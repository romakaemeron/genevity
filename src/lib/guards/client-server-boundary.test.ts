/**
 * Guards the client/server boundary around the database client.
 *
 * `src/lib/db/client.ts` evaluates `neon(process.env.DATABASE_URL!)` at module
 * scope. If a `"use client"` component reaches it — directly, or through any
 * module that imports it — the Neon client lands in the browser bundle, where
 * DATABASE_URL does not exist, and the page dies on hydration with
 * "No database connection string was provided to `neon()`".
 *
 * That exact bug shipped to production once: /admin/services/[id] imported
 * `serviceBeforeAfterKey` (a value) from `lib/db/queries/before-after`, which
 * imports `sql`. Neither `tsc` nor `next build` catches it — the type-checker
 * sees valid types, and the bundler happily produces the broken bundle. Only
 * opening the page in a browser surfaces it, so this test stands in for that.
 *
 * Two things are deliberately NOT flagged, because neither reaches the bundle:
 *   • `import type …` — erased at compile time.
 *   • importing a `"use server"` module — Next.js replaces the import with an
 *     RPC stub, so a server action's own `sql` import never crosses over. That
 *     is how every admin form already talks to the database, so taint stops at
 *     a `"use server"` file rather than propagating through it.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "../..");

/** Every .ts/.tsx file under src/, excluding tests. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      sourceFiles(full, acc);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

/** Resolve a `@/…` or relative specifier to a file on disk, or null. */
function resolveImport(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // bare package specifier

  for (const candidate of [
    base, `${base}.ts`, `${base}.tsx`,
    path.join(base, "index.ts"), path.join(base, "index.tsx"),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * Value imports only. `import type …` and `import { type X }` are erased by
 * the compiler, so they cannot drag a module into the bundle.
 */
function valueImports(source: string): string[] {
  const out: string[] = [];
  const re = /import\s+(?!type\s)([\s\S]*?)\s*from\s*["']([^"']+)["']/g;
  for (const m of source.matchAll(re)) {
    const clause = m[1];
    const spec = m[2];
    // A braces-only clause whose every binding is `type X` is also erased.
    const braces = clause.match(/^\{([\s\S]*)\}$/);
    if (braces) {
      const bindings = braces[1].split(",").map((b) => b.trim()).filter(Boolean);
      if (bindings.length > 0 && bindings.every((b) => b.startsWith("type "))) continue;
    }
    out.push(spec);
  }
  // Side-effect imports (`import "x"`) also pull the module in.
  for (const m of source.matchAll(/import\s+["']([^"']+)["']/g)) out.push(m[1]);
  return out;
}

const DB_CLIENT = path.join(SRC, "lib/db/client.ts");

/** A leading "use client" / "use server" directive, if the file opens with one. */
function directive(source: string): "client" | "server" | null {
  const m = source.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/.*\n\s*)*["']use (client|server)["']/);
  return m ? (m[1] as "client" | "server") : null;
}

/**
 * Files that reach `lib/db/client` through value imports, transitively,
 * treating `"use server"` modules as a boundary the taint cannot cross.
 */
function buildTaintedSet(files: string[], directives: Map<string, "client" | "server" | null>): Set<string> {
  const valueGraph = new Map<string, string[]>();
  for (const file of files) {
    const src = fs.readFileSync(file, "utf-8");
    valueGraph.set(
      file,
      valueImports(src)
        .map((spec) => resolveImport(spec, file))
        .filter((f): f is string => f !== null),
    );
  }

  const tainted = new Set<string>([DB_CLIENT]);
  // Fixed-point: keep adding importers of tainted modules until nothing changes.
  let changed = true;
  while (changed) {
    changed = false;
    for (const [file, deps] of valueGraph) {
      if (tainted.has(file)) continue;
      // A server action is an RPC boundary — importing one bundles a stub,
      // not the action's dependencies.
      if (directives.get(file) === "server") continue;
      if (deps.some((d) => tainted.has(d))) { tainted.add(file); changed = true; }
    }
  }
  return tainted;
}

describe("client/server boundary", () => {
  it("no \"use client\" module value-imports the database client", () => {
    const files = sourceFiles(SRC);
    const directives = new Map(
      files.map((f) => [f, directive(fs.readFileSync(f, "utf-8"))] as const),
    );
    const tainted = buildTaintedSet(files, directives);

    const offenders = files
      .filter((f) => directives.get(f) === "client")
      .filter((f) => tainted.has(f))
      .map((f) => path.relative(SRC, f));

    expect(offenders).toEqual([]);
  });
});

/**
 * Guard the implicit cache tags that blog ISR revalidation depends on.
 *
 * `src/lib/revalidate-blog.ts` calls `revalidatePath("/[locale]/(pages)/blog/[slug]", "page")`.
 * Next expires the tag `_N_T_<pattern>/<type>` and matches it by EXACT string
 * equality, so the route group `(pages)` has to be part of the pattern. Nothing
 * enforces that: renaming `(pages)` or moving the blog page changes the tag,
 * revalidation silently starts matching nothing, and there is no build error, no
 * test failure and no runtime signal — saves just stop going live.
 *
 * This script closes that gap by asserting, against the real build output, that
 * every pattern the code revalidates still corresponds to a route Next emitted.
 *
 * Run AFTER a build (it reads `.next/app-path-routes-manifest.json`, whose keys
 * are the app-router route paths the implicit tags are derived from):
 *
 *   npm run build && npx tsx scripts/check-blog-tags.ts
 *
 * Exits non-zero — with the actual blog routes printed — when a pattern is gone.
 */
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, ".next/app-path-routes-manifest.json");

/** Route patterns passed to revalidatePath(..., "page") in src/lib/revalidate-blog.ts. */
const REQUIRED_PATTERNS = [
  "/[locale]/(pages)/blog/[slug]",
  "/[locale]/(pages)/blog",
  "/(admin)/admin/blog",
] as const;

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(MANIFEST)) {
  fail(
    `no build output at ${path.relative(ROOT, MANIFEST)}.\n` +
      `  This check needs a completed build — it cannot pass without one.\n` +
      `  Run: npm run build && npx tsx scripts/check-blog-tags.ts`,
  );
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf-8")) as Record<string, string>;
const routes = Object.keys(manifest);
if (routes.length === 0) fail(`${path.relative(ROOT, MANIFEST)} is empty — the build did not complete.`);

const missing = REQUIRED_PATTERNS.filter((p) => !routes.includes(`${p}/page`));

if (missing.length) {
  console.error("✗ blog ISR revalidation is broken — these route patterns no longer exist:\n");
  for (const p of missing) {
    console.error(`    revalidatePath("${p}", "page")  →  expects tag  _N_T_${p}/page`);
  }
  console.error("\n  Blog routes actually present in this build:");
  for (const r of routes.filter((r) => r.includes("blog"))) console.error(`    ${r}`);
  console.error(
    "\n  Fix src/lib/revalidate-blog.ts to use the exact route paths above " +
      "(route groups included — matching is exact string equality).",
  );
  process.exit(1);
}

console.log(`✓ all ${REQUIRED_PATTERNS.length} blog revalidation patterns match the build:`);
for (const p of REQUIRED_PATTERNS) console.log(`    _N_T_${p}/page`);

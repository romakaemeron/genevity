"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

type Leaf = { uk?: string; ru?: string; en?: string };

function isLeaf(v: unknown): v is Leaf {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("uk" in v || "ru" in v || "en" in v) &&
    Object.values(v).every((x) => typeof x === "string" || x === undefined)
  );
}

/**
 * Merge a partial leaf update into the tree at path, preserving everything else.
 * path examples: "nav.about" or "homeFaq.q1.question"
 */
function setPath(tree: Record<string, unknown>, path: string, leaf: Leaf): void {
  const parts = path.split(".");
  let cur: any = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] == null || Array.isArray(cur[p])) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = leaf;
}

export async function saveUiStringsDiff(updates: { path: string; leaf: Leaf }[]) {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = (rows[0]?.data ?? {}) as Record<string, unknown>;

  for (const u of updates) {
    if (!isLeaf(u.leaf)) continue;
    setPath(tree, u.path, u.leaf);
  }

  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  revalidatePath("/");
  return { ok: true };
}

export async function saveFullTree(tree: Record<string, unknown>) {
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  revalidatePath("/");
  return { ok: true };
}

/** Replace a single top-level namespace within ui_strings.data */
export async function saveNamespaceTree(namespace: string, subtree: Record<string, unknown>) {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = (rows[0]?.data ?? {}) as Record<string, unknown>;
  tree[namespace] = subtree;
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  revalidatePath("/");
  return { ok: true };
}

/** Save at an arbitrary dot-path (preserves siblings at every level) */
export async function saveAtPath(path: string, subtree: Record<string, unknown>) {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = (rows[0]?.data ?? {}) as Record<string, unknown>;
  const parts = path.split(".");
  let cur: any = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] == null || Array.isArray(cur[parts[i]])) {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = subtree;
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  revalidatePath("/");
  return { ok: true };
}

import { sql } from "../client";

type Lang = "uk" | "ru" | "en";
type LocaleInput = string; // "ua" | "ru" | "en" | anything

function toLang(locale: LocaleInput): Lang {
  return (locale === "ua" ? "uk" : locale) as Lang;
}

/**
 * Raw JSONB tree as stored in ui_strings.data.
 * Each leaf is {uk, ru, en}; non-leaf nodes are plain objects.
 */
export type UiStringsTree = Record<string, unknown>;

/** Fetch the raw JSONB tree — used by admin editor */
export async function getUiStringsTree(): Promise<UiStringsTree> {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const raw = rows[0]?.data;
  if (!raw) return {};
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/**
 * Get a next-intl-compatible flat messages object for a locale.
 * Walks the tree and replaces every {uk,ru,en} leaf with the locale's string.
 */
export async function getMessagesForLocale(locale: LocaleInput): Promise<Record<string, unknown>> {
  const lang = toLang(locale);
  const tree = await getUiStringsTree();
  return resolveTree(tree, lang);
}

function isLeaf(v: unknown): v is { uk?: string; ru?: string; en?: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("uk" in v || "ru" in v || "en" in v) &&
    Object.values(v).every((x) => typeof x === "string")
  );
}

function resolveTree(node: unknown, lang: Lang): any {
  if (isLeaf(node)) {
    return node[lang] ?? node.uk ?? node.ru ?? node.en ?? "";
  }
  if (Array.isArray(node)) {
    return node.map((item) => resolveTree(item, lang));
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) out[k] = resolveTree(v, lang);
    return out;
  }
  return node;
}

/** Dot-path getter against the raw tree — returns the locale string or empty string */
export async function getUiString(path: string, locale: LocaleInput): Promise<string> {
  const lang = toLang(locale);
  const tree = await getUiStringsTree();
  const parts = path.split(".");
  let cur: any = tree;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return "";
    cur = cur[p];
  }
  if (cur == null) return "";
  if (isLeaf(cur)) return cur[lang] ?? cur.uk ?? "";
  if (typeof cur === "string") return cur;
  return "";
}

/** Save the entire tree (used by admin) */
export async function saveUiStringsTree(tree: UiStringsTree): Promise<void> {
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
}

/** Get a single top-level namespace subtree — for scoped per-page editors */
export async function getUiStringsNamespace(namespace: string): Promise<Record<string, unknown>> {
  const tree = await getUiStringsTree();
  const ns = tree[namespace];
  return (ns && typeof ns === "object" && !Array.isArray(ns) ? ns : {}) as Record<string, unknown>;
}

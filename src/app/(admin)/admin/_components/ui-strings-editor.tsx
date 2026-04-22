"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Check, Search } from "lucide-react";
import { saveFullTree } from "../_actions/ui-strings";

type Leaf = { uk?: string; ru?: string; en?: string };
type Tree = Record<string, unknown>;

const LOCALES: Array<"uk" | "ru" | "en"> = ["uk", "ru", "en"];
const LOCALE_LABEL: Record<"uk" | "ru" | "en", string> = { uk: "UA", ru: "RU", en: "EN" };

function isLeaf(v: unknown): v is Leaf {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("uk" in v || "ru" in v || "en" in v) &&
    Object.values(v).every((x) => typeof x === "string" || x === undefined)
  );
}

function cloneTree<T>(t: T): T {
  return JSON.parse(JSON.stringify(t));
}

function setAt(tree: Tree, path: string[], value: unknown): void {
  let cur: any = tree;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
  cur[path[path.length - 1]] = value;
}

/** Flatten tree to array of {path: "a.b.c", leaf: {uk,ru,en}} for searching */
function flatten(tree: unknown, prefix: string[] = []): { path: string[]; leaf: Leaf }[] {
  if (isLeaf(tree)) return [{ path: prefix, leaf: tree }];
  if (Array.isArray(tree) || tree == null || typeof tree !== "object") return [];
  const out: { path: string[]; leaf: Leaf }[] = [];
  for (const [k, v] of Object.entries(tree)) {
    out.push(...flatten(v, [...prefix, k]));
  }
  return out;
}

interface Props {
  tree: Tree;
}

export default function UiStringsEditor({ tree: initial }: Props) {
  const [tree, setTree] = useState<Tree>(initial);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(initial).map((k) => [k, false])),
  );
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const topLevel = useMemo(() => Object.keys(tree).sort(), [tree]);

  const allLeaves = useMemo(() => flatten(tree), [tree]);

  const filteredLeaves = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allLeaves.filter(({ path, leaf }) => {
      const p = path.join(".").toLowerCase();
      const vals = Object.values(leaf).join(" ").toLowerCase();
      return p.includes(q) || vals.includes(q);
    });
  }, [query, allLeaves]);

  const updateLeaf = (path: string[], locale: "uk" | "ru" | "en", value: string) => {
    setTree((prev) => {
      const next = cloneTree(prev);
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      const key = path[path.length - 1];
      const existing = (cur[key] as Leaf) || {};
      cur[key] = { ...existing, [locale]: value };
      return next;
    });
    setDirty(true);
  };

  const save = () => {
    startTransition(async () => {
      await saveFullTree(tree);
      setDirty(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search keys or values..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
        />
      </div>

      {filteredLeaves ? (
        <div className="flex flex-col gap-2">
          {filteredLeaves.length === 0 && (
            <div className="text-center py-10 text-sm text-muted">No matches</div>
          )}
          {filteredLeaves.map(({ path, leaf }) => (
            <LeafRow key={path.join(".")} path={path} leaf={leaf} onChange={updateLeaf} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {topLevel.map((key) => (
            <Section
              key={key}
              name={key}
              value={tree[key]}
              expanded={!!expanded[key]}
              onToggle={() => setExpanded({ ...expanded, [key]: !expanded[key] })}
              onChangeLeaf={updateLeaf}
            />
          ))}
        </div>
      )}

      {/* Save bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-champagne-dark/90 backdrop-blur-lg border-t border-line -mx-8 px-8 py-3 flex items-center gap-3">
        <span className="text-xs text-muted">
          {allLeaves.length} string{allLeaves.length === 1 ? "" : "s"} across {topLevel.length} section{topLevel.length === 1 ? "" : "s"}
        </span>
        <div className="flex-1" />
        {dirty && !savedAt && <span className="text-xs text-warning">Unsaved changes</span>}
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="px-5 py-2 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save all"}
        </button>
      </div>
    </div>
  );
}

function Section({
  name, value, expanded, onToggle, onChangeLeaf,
}: {
  name: string;
  value: unknown;
  expanded: boolean;
  onToggle: () => void;
  onChangeLeaf: (path: string[], locale: "uk" | "ru" | "en", value: string) => void;
}) {
  const leafCount = useMemo(() => flatten(value).length, [value]);

  return (
    <div className="rounded-xl border border-line bg-champagne-dark overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-champagne/30 transition-colors cursor-pointer text-left"
      >
        <ChevronRight size={14} className={`text-muted transition-transform ${expanded ? "rotate-90" : ""}`} />
        <span className="flex-1 text-sm font-medium text-ink">{name}</span>
        <span className="text-xs text-muted">{leafCount} key{leafCount === 1 ? "" : "s"}</span>
      </button>
      {expanded && (
        <div className="p-4 border-t border-line bg-champagne/20">
          <Branch value={value} path={[name]} onChangeLeaf={onChangeLeaf} />
        </div>
      )}
    </div>
  );
}

function Branch({
  value, path, onChangeLeaf,
}: {
  value: unknown;
  path: string[];
  onChangeLeaf: (path: string[], locale: "uk" | "ru" | "en", value: string) => void;
}) {
  if (isLeaf(value)) {
    return <LeafRow path={path} leaf={value} onChange={onChangeLeaf} />;
  }
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return <div className="text-xs text-muted italic py-1">Unsupported value type (arrays not edited here)</div>;
  }
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(value).map(([k, v]) => {
        const childPath = [...path, k];
        if (isLeaf(v)) {
          return <LeafRow key={k} path={childPath} leaf={v} onChange={onChangeLeaf} />;
        }
        return (
          <div key={k} className="rounded-lg bg-champagne-dark border border-line">
            <div className="px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider border-b border-line bg-champagne/40">
              {k}
            </div>
            <div className="p-3">
              <Branch value={v} path={childPath} onChangeLeaf={onChangeLeaf} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeafRow({
  path, leaf, onChange,
}: {
  path: string[];
  leaf: Leaf;
  onChange: (path: string[], locale: "uk" | "ru" | "en", value: string) => void;
}) {
  const multiline =
    (leaf.uk?.length ?? 0) > 80 ||
    (leaf.ru?.length ?? 0) > 80 ||
    (leaf.en?.length ?? 0) > 80;

  return (
    <div className="flex flex-col gap-1.5 py-1.5">
      <label className="text-[11px] font-mono text-muted" title={path.join(".")}>
        {path.slice(1).join(".") || path[0]}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {LOCALES.map((l) => {
          const val = leaf[l] ?? "";
          const commonClass = "w-full px-2.5 py-1.5 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";
          return (
            <div key={l} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted uppercase tracking-wider">{LOCALE_LABEL[l]}</span>
              {multiline ? (
                <textarea
                  rows={3}
                  value={val}
                  onChange={(e) => onChange(path, l, e.target.value)}
                  className={`${commonClass} resize-y`}
                />
              ) : (
                <input
                  value={val}
                  onChange={(e) => onChange(path, l, e.target.value)}
                  className={commonClass}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

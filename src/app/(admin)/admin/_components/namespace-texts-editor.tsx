"use client";

import { useMemo, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { saveNamespaceTree, saveAtPath } from "../_actions/ui-strings";
import { useUnsavedTracker } from "./unsaved-changes";
import Button from "@/components/ui/Button";

type Leaf = { uk?: string; ru?: string; en?: string };

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
  /** Either a top-level namespace key ("stationaryPage") or a dot-path ("pageMeta.stationary") */
  namespace: string;
  initial: Record<string, unknown>;
  title?: string;
  description?: string;
}

export default function NamespaceTextsEditor({ namespace, initial, title, description }: Props) {
  const isPath = namespace.includes(".");
  const [tree, setTree] = useState<Record<string, unknown>>(initial);
  const [baseline, setBaseline] = useState<Record<string, unknown>>(initial);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const leaves = useMemo(() => flatten(tree), [tree]);

  // Dirty is derived — whether current tree differs from the last-saved baseline.
  // So editing then restoring the original value correctly flips dirty back to false.
  const baselineJson = useMemo(() => JSON.stringify(baseline), [baseline]);
  const dirty = JSON.stringify(tree) !== baselineJson;

  const updateLeaf = (path: string[], locale: "uk" | "ru" | "en", value: string) => {
    setTree((prev) => {
      const next = cloneTree(prev);
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (typeof cur[path[i]] !== "object" || cur[path[i]] == null) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      const key = path[path.length - 1];
      const existing = (cur[key] as Leaf) || {};
      cur[key] = { ...existing, [locale]: value };
      return next;
    });
  };

  const save = async () => {
    if (isPath) {
      await saveAtPath(namespace, tree);
    } else {
      await saveNamespaceTree(namespace, tree);
    }
    // New baseline after a successful write so subsequent edits compare
    // against the saved state, not the initial props.
    setBaseline(tree);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const saveClicked = () => { startTransition(() => { void save(); }); };
  const cancel = () => { setTree(baseline); };

  useUnsavedTracker({
    id: `namespace:${namespace}`,
    label: title || `Texts · ${namespace}`,
    dirty,
    save,
    discard: cancel,
  });

  return (
    <div className="flex flex-col gap-4">
      {(title || description) && (
        <div>
          {title && <h3 className="font-heading text-lg text-ink">{title}</h3>}
          {description && <p className="body-m text-muted mt-1">{description}</p>}
        </div>
      )}

      {leaves.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No text keys yet in <code className="font-mono text-xs">{namespace}</code>.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaves.map(({ path, leaf }) => (
            <LeafRow key={path.join(".")} path={path} leaf={leaf} onChange={updateLeaf} />
          ))}
        </div>
      )}

      <div className="sticky bottom-0 left-0 right-0 bg-champagne border-t border-line -mx-8 px-8 py-3 flex items-center gap-3">
        <span className="text-xs text-muted">{leaves.length} text{leaves.length === 1 ? "" : "s"} in {namespace}</span>
        <div className="flex-1" />
        {dirty && !savedAt && <span className="text-xs text-warning">Unsaved changes</span>}
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty} title="Revert unsaved edits to the last-saved values">
          Cancel changes
        </Button>
        <Button variant="primary" size="sm" onClick={saveClicked} disabled={pending || !dirty}>
          {pending ? "Saving..." : "Save texts"}
        </Button>
      </div>
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
    <div className="flex flex-col gap-1.5 py-2 px-3 rounded-lg bg-champagne-dark border border-line">
      <label className="text-[11px] font-mono text-muted" title={path.join(".")}>
        {path.join(".")}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {LOCALES.map((l) => {
          const val = leaf[l] ?? "";
          const commonClass = "w-full px-2.5 py-1.5 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";
          return (
            <div key={l} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted uppercase tracking-wider">{LOCALE_LABEL[l]}</span>
              {multiline ? (
                <textarea rows={3} value={val} onChange={(e) => onChange(path, l, e.target.value)} className={`${commonClass} resize-y`} />
              ) : (
                <input value={val} onChange={(e) => onChange(path, l, e.target.value)} className={commonClass} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

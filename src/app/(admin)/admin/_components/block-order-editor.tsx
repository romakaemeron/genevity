"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useUnsavedTracker } from "./unsaved-changes";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";

/**
 * Generic layout editor — shows an ordered list of page blocks with up/down
 * arrows so admins can rearrange how a page renders. Each consumer decides
 * which blocks are movable and passes a `save` action that persists the new
 * order (a string[] of block keys).
 */

export interface BlockDef {
  key: string;
  label: string;
  description?: string;
  /** Whether this block has any content to render (informational only — affects the muted "empty" badge). */
  hasContent?: boolean;
}

interface Props {
  /** All possible blocks in some canonical order (the template's default). */
  blocks: BlockDef[];
  /** Saved order (subset of `blocks` keys). Empty/null = default. */
  initialOrder: string[] | null;
  /** Server action called with the new ordered array. */
  onSave: (order: string[]) => Promise<unknown>;
  /** For the unsaved-changes guard. */
  entityId: string;
  entityLabel: string;
}

export default function BlockOrderEditor({ blocks, initialOrder, onSave, entityId, entityLabel }: Props) {
  const blockKeys = useMemo(() => blocks.map((b) => b.key), [blocks]);

  // Resolve an order by keeping the valid entries of `saved` and appending any
  // current blocks the saved list doesn't mention (new sections, new block types).
  const resolveOrder = (saved: string[] | null, currentKeys: string[]): string[] => {
    const validSet = new Set(currentKeys);
    const base = (saved || []).filter((k) => validSet.has(k));
    const baseSet = new Set(base);
    const missing = currentKeys.filter((k) => !baseSet.has(k));
    return [...base, ...missing];
  };

  const [order, setOrder] = useState<string[]>(() => resolveOrder(initialOrder, blockKeys));
  const [baseline, setBaseline] = useState<string[]>(() => resolveOrder(initialOrder, blockKeys));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Keep order in sync when blocks change (e.g., the admin added a section on
  // the Sections tab, then re-opened the Layout tab). We preserve any pending
  // user reorder by starting from `order`, then appending any newly-added keys.
  useEffect(() => {
    setOrder((prev) => {
      const next = resolveOrder(prev, blockKeys);
      return JSON.stringify(next) !== JSON.stringify(prev) ? next : prev;
    });
    setBaseline((prev) => {
      const next = resolveOrder(initialOrder ?? prev, blockKeys);
      return JSON.stringify(next) !== JSON.stringify(prev) ? next : prev;
    });
  }, [blockKeys, initialOrder]);

  const dirty = JSON.stringify(order) !== JSON.stringify(baseline);
  const { getRowProps, getHandleProps } = useReorderable(order, setOrder);

  const doSave = async () => {
    await onSave(order);
    setBaseline(order);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const save = () => { startTransition(() => { void doSave(); }); };
  const cancel = () => setOrder(baseline);

  useUnsavedTracker({
    id: `layout:${entityId}`,
    label: `Layout · ${entityLabel}`,
    dirty,
    save: doSave,
    discard: cancel,
  });

  const byKey = useMemo(() => Object.fromEntries(blocks.map((b) => [b.key, b] as const)), [blocks]);

  return (
    <div className="flex flex-col gap-2">
      {order.map((key, i) => {
        const b = byKey[key];
        if (!b) return null;
        return (
          <div
            key={key}
            {...getRowProps(i)}
            className={`flex items-center gap-3 p-3 rounded-xl bg-white border border-line ${REORDERABLE_ROW_CLASSES}`}
          >
            <DragHandle {...getHandleProps(i)} />
            <span className="text-xs font-mono text-muted tabular-nums w-6">{i + 1}.</span>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">{b.label}</span>
                {b.hasContent === false && (
                  <span className="text-[10px] uppercase tracking-wider text-muted italic">empty — will not render</span>
                )}
              </div>
              {b.description && <span className="body-s text-muted line-clamp-2">{b.description}</span>}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1" />
        {dirty && !savedAt && <span className="text-xs text-warning">Unsaved changes</span>}
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty} title="Revert to the last-saved order">
          Cancel changes
        </Button>
        <Button variant="primary" size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving..." : "Save layout"}
        </Button>
      </div>
    </div>
  );
}

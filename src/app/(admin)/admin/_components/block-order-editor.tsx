"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Check, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useUnsavedTracker } from "./unsaved-changes";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";

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
  /** If provided, an "Apply to all" checkbox appears that syncs layout to every service. */
  onApplyToAll?: (order: string[]) => Promise<unknown>;
  /** For the unsaved-changes guard. */
  entityId: string;
  entityLabel: string;
}

export default function BlockOrderEditor({ blocks, initialOrder, onSave, onApplyToAll, entityId, entityLabel }: Props) {
  const blockKeys = useMemo(() => blocks.map((b) => b.key), [blocks]);

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
  const [applyToAll, setApplyToAll] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

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

  const doSaveAndApply = async () => {
    setApplyError(null);
    try {
      console.log("[BlockOrderEditor] doSaveAndApply start, dirty=", dirty, "order=", order);
      if (dirty) {
        await onSave(order);
        setBaseline(order);
      }
      console.log("[BlockOrderEditor] calling onApplyToAll, onApplyToAll=", !!onApplyToAll);
      if (onApplyToAll) {
        const result = await onApplyToAll(order);
        console.log("[BlockOrderEditor] onApplyToAll result=", result);
      }
      setApplyToAll(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    } catch (e) {
      console.error("[BlockOrderEditor] doSaveAndApply error:", e);
      setApplyError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleSaveClick = () => {
    console.log("[BlockOrderEditor] handleSaveClick, applyToAll=", applyToAll, "onApplyToAll=", !!onApplyToAll);
    if (applyToAll && onApplyToAll) {
      setShowConfirm(true);
    } else {
      startTransition(async () => { await doSave(); });
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    startTransition(async () => { await doSaveAndApply(); });
  };

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
    <>
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
          {onApplyToAll && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 rounded border-line accent-main cursor-pointer"
              />
              <span className="text-xs text-muted">Apply to all service pages</span>
            </label>
          )}
          <div className="flex-1" />
          {applyError && <span className="text-xs text-error">Error: {applyError}</span>}
          {dirty && !savedAt && !applyError && <span className="text-xs text-warning">Unsaved changes</span>}
          {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
          <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty} title="Revert to the last-saved order">
            Cancel changes
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveClick} disabled={pending || (!dirty && !applyToAll)}>
            {pending ? "Saving..." : "Save layout"}
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-champagne border border-line shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-warning" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-ink">Apply layout to all service pages?</p>
                <p className="body-s text-muted">
                  The current block order will be synced to every service page. Each service keeps its own section content, but the ordering of blocks (sections, FAQ, doctors, equipment, etc.) will be overwritten to match this page.
                </p>
                <p className="body-s text-muted mt-1">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="neutral" size="sm" onClick={() => setShowConfirm(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirm} disabled={pending}>
                {pending ? "Applying..." : "Yes, apply to all"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

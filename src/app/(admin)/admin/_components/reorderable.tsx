"use client";

// Whole-row drag-and-drop reorder primitive with live reshuffling.
//
// Usage:
//   const { getRowProps, getHandleProps } = useReorderable(items, setItems);
//
//   items.map((item, i) => (
//     <div key={i} {...getRowProps(i)} className={`... ${REORDERABLE_ROW_CLASSES}`}>
//       <DragHandle {...getHandleProps(i)} />   // decorative grip icon
//       ...content...
//     </div>
//   ))
//
// Mechanics:
//  - The whole row is draggable=true — grab anywhere outside an input/button
//    to start a drag.
//  - As the cursor drags over another row's vertical midpoint, the underlying
//    array is reordered live (onReorder fires), so the other rows visibly
//    slide to new positions the moment you cross the midpoint. No drop
//    indicator line needed — the items themselves show you where you'll land.
//  - Inputs, buttons, and other interactive children keep working because
//    HTML5 drag only starts when the user mouse-downs on a non-form area.

import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

export interface ReorderableApi {
  /** Spread on the row container — makes it a drag source + drop target. */
  getRowProps: (index: number) => {
    draggable: true;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onDrop: (e: React.DragEvent) => void;
    "data-dragging"?: "true";
  };
  /** Spread on the grip icon — now purely decorative; it inherits drag from
   *  the row. Kept for API compatibility with consumers. */
  getHandleProps: (index: number) => Record<string, never>;
  dragIndex: number | null;
}

export function useReorderable<T>(items: T[], onReorder: (next: T[]) => void): ReorderableApi {
  const dragFromRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const getRowProps = useCallback((index: number) => ({
    draggable: true as const,
    onDragStart: (e: React.DragEvent) => {
      // Guard: don't start a drag if the user actually mouse-downed on an
      // input/textarea/select/button — they're trying to interact with it.
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        e.preventDefault();
        return;
      }
      dragFromRef.current = index;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Firefox requires non-empty payload to fire subsequent drag events
      e.dataTransfer.setData("text/plain", String(index));
    },
    onDragOver: (e: React.DragEvent) => {
      if (dragFromRef.current === null) return;
      e.preventDefault();
      const from = dragFromRef.current;
      if (from === index) return;

      // Live reorder only when the cursor has crossed the target row's
      // midpoint — prevents jittery back-and-forth when hovering near an edge
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const movingDown = from < index;
      const crossed = movingDown ? e.clientY >= mid : e.clientY <= mid;
      if (!crossed) return;

      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      onReorder(next);
      // The dragged item is now at `index` — keep the ref in sync so further
      // onDragOver events fire against the new position
      dragFromRef.current = index;
      setDragIndex(index);
    },
    onDragEnd: () => {
      dragFromRef.current = null;
      setDragIndex(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      dragFromRef.current = null;
      setDragIndex(null);
    },
    ...(dragIndex === index ? { "data-dragging": "true" as const } : {}),
  }), [dragIndex, items, onReorder]);

  // Handle is now decorative — the row is the drag source. We keep the hook
  // so call sites don't need to change.
  const getHandleProps = useCallback((_index: number) => ({}) as Record<string, never>, []);

  return { getRowProps, getHandleProps, dragIndex };
}

/**
 * Visual drag-grip icon. Decorative — cursor: grab and the same colour cue
 * that users expect, but the whole row is the actual drag source.
 */
export function DragHandle({
  className = "",
  size = 16,
}: {
  className?: string;
  size?: number;
  // Accept any extra props from callers that may have passed getHandleProps output
  [key: string]: unknown;
}) {
  return (
    <div
      className={`cursor-grab active:cursor-grabbing text-muted flex items-center justify-center select-none pointer-events-none ${className}`}
      title="Drag the whole row to reorder"
      aria-hidden="true"
    >
      <GripVertical size={size} />
    </div>
  );
}

/**
 * Tailwind classes to apply to the reorderable row container:
 *   - cursor-grab / grabbing so the hover affordance is everywhere on the row
 *   - data-[dragging=true]:opacity-50 ghosts the source while dragging
 *   - transition-[transform,opacity] makes the swap feel tactile
 */
export const REORDERABLE_ROW_CLASSES =
  "cursor-grab active:cursor-grabbing transition-[opacity,transform] duration-150 data-[dragging=true]:opacity-50";

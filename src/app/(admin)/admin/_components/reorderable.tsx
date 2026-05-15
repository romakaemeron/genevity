"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

export interface ReorderableApi {
  getRowProps: (index: number) => {
    "data-dragging"?: "true";
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onDrop: (e: React.DragEvent) => void;
  };
  getHandleProps: (index: number) => {
    draggable: true;
    onDragStart: (e: React.DragEvent) => void;
  };
  dragIndex: number | null;
}

export function useReorderable<T>(items: T[], onReorder: (next: T[]) => void): ReorderableApi {
  const dragFromRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());

  const getRowProps = useCallback((index: number) => ({
    ref: (el: HTMLElement | null) => {
      if (el) rowRefs.current.set(index, el);
      else rowRefs.current.delete(index);
    },
    onDragOver: (e: React.DragEvent) => {
      if (dragFromRef.current === null) return;
      e.preventDefault();
      const from = dragFromRef.current;
      if (from === index) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const movingDown = from < index;
      const crossed = movingDown ? e.clientY >= mid : e.clientY <= mid;
      if (!crossed) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      onReorder(next);
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

  const getHandleProps = useCallback((index: number) => ({
    draggable: true as const,
    onDragStart: (e: React.DragEvent) => {
      dragFromRef.current = index;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      // Use the whole row as the drag ghost image
      const rowEl = rowRefs.current.get(index);
      if (rowEl) e.dataTransfer.setDragImage(rowEl, 20, 20);
    },
  }), []);

  return { getRowProps, getHandleProps, dragIndex };
}

export function DragHandle({
  className = "",
  size = 16,
  draggable,
  onDragStart,
  ...rest
}: {
  className?: string;
  size?: number;
  draggable?: true;
  onDragStart?: (e: React.DragEvent) => void;
  [key: string]: unknown;
}) {
  return (
    <div
      className={`cursor-grab active:cursor-grabbing text-muted flex items-center justify-center select-none ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
      title="Drag to reorder"
      aria-hidden="true"
      {...(rest as Record<string, unknown>)}
    >
      <GripVertical size={size} />
    </div>
  );
}

export const REORDERABLE_ROW_CLASSES =
  "transition-[opacity,transform] duration-150 data-[dragging=true]:opacity-50";

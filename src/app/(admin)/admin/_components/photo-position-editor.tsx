"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize2, X, Pencil, Check, Minus, Plus } from "lucide-react";

/**
 * Photo-with-position editor.
 *
 * Default: collapsed — just a header row with label + "Edit focal point" button.
 * After clicking Edit: a big preview appears at the correct aspect ratio with a
 * draggable crosshair marker to reposition the focal point. Save the form to persist.
 *
 * Pass `scaleName` to enable a zoom slider alongside the focal-point drag.
 * Pass `maxPreviewClass` (e.g. "max-w-[260px]") to cap the preview width.
 */
interface Props {
  name: string;
  label: string;
  photoUrl: string | null | undefined;
  defaultValue?: string;
  aspect?: "square" | "portrait" | "wide" | "modal";
  alt?: string;
  /** Fires on every position change so sibling thumbnails can mirror the live crop. */
  onPositionChange?: (posString: string) => void;
  /** Enable zoom slider — provide the hidden-input name for the scale value. */
  scaleName?: string;
  defaultScale?: number;
  onScaleChange?: (scale: number) => void;
  /** Tailwind class(es) to constrain the preview width, e.g. "max-w-[260px]". */
  maxPreviewClass?: string;
}

const SCALE_MIN = 0.5;
const SCALE_MAX = 4;
const SCALE_STEP = 0.05;

function parsePosition(val: string | undefined | null): { x: number; y: number } {
  if (!val) return { x: 50, y: 50 };
  const keywords: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const parts = val.trim().split(/\s+/);
  const [px, py] = parts;
  const x = px?.endsWith("%") ? parseFloat(px) : keywords[px] ?? 50;
  const y = py?.endsWith("%") ? parseFloat(py) : keywords[py] ?? 50;
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
}

const aspectClass = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/9]",
  modal: "aspect-[16/10]",
};

export default function PhotoPositionEditor({
  name, label, photoUrl, defaultValue, aspect = "square", alt = "",
  onPositionChange,
  scaleName, defaultScale, onScaleChange,
  maxPreviewClass,
}: Props) {
  const initial = parsePosition(defaultValue);
  const [pos, setPos] = useState(initial);
  const initScale = Number.isFinite(defaultScale) && (defaultScale as number) > 0 ? (defaultScale as number) : 1;
  const [scale, setScale] = useState(initScale);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const posString = `${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`;
  const clampScale = (s: number) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, Number(s.toFixed(3))));

  // Notify parent on every change
  useEffect(() => {
    onPositionChange?.(posString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posString]);
  useEffect(() => {
    if (scaleName) onScaleChange?.(scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, scaleName]);

  const updatePos = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    updatePos(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updatePos(e.clientX, e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  // Scroll-to-zoom inside the preview when zoom is enabled
  useEffect(() => {
    if (!editing || !scaleName) return;
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => clampScale(s - e.deltaY * 0.0015));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, scaleName]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const hiddenInputs = (
    <>
      <input type="hidden" name={name} value={posString} />
      {scaleName && <input type="hidden" name={scaleName} value={scale.toFixed(3)} />}
    </>
  );

  if (!photoUrl) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
        <p className="text-xs text-muted italic">Upload photo first to edit the focal point.</p>
        {hiddenInputs}
      </div>
    );
  }

  // Width class for the preview frame and aligned controls
  const frameWidthClass = maxPreviewClass ? `w-full ${maxPreviewClass}` : "w-full";
  const controlsWidthClass = maxPreviewClass ? `${maxPreviewClass} mx-auto w-full` : "w-full";

  return (
    <div className="flex flex-col gap-3">
      {/* Collapsed header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs text-muted hover:text-ink transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Show full image"
          >
            <Maximize2 size={12} /> Full size
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
              editing
                ? "bg-success/10 text-success hover:bg-success/20"
                : "bg-main/10 text-main hover:bg-main/20"
            }`}
          >
            {editing ? <><Check size={12} /> Done</> : <><Pencil size={12} /> Edit focal point</>}
          </button>
        </div>
      </div>

      {/* Collapsed thumbnail preview */}
      {!editing && (
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 rounded-lg overflow-hidden bg-champagne-dark border border-line ${
              aspect === "portrait" ? "w-12 h-16" :
              aspect === "wide" ? "w-20 h-[45px]" :
              aspect === "modal" ? "w-20 h-[50px]" :
              "w-12 h-12"
            }`}
            style={scaleName && scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: posString } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: posString }}
            />
          </div>
          <p className="text-[11px] text-muted font-mono">
            {posString}{scaleName ? ` · ${scale.toFixed(2)}×` : ""}
          </p>
        </div>
      )}

      {/* Expanded editor — only when in edit mode */}
      {editing && (
        <>
          <p className="text-xs text-muted">
            Drag to reposition the focal point{scaleName ? ". Scroll or use the slider to zoom" : ""}.
          </p>

          {/* Preview frame — optionally constrained width */}
          <div className={maxPreviewClass ? "flex justify-center" : undefined}>
            <div
              ref={frameRef}
              className={`${aspectClass[aspect]} relative ${frameWidthClass} rounded-xl overflow-hidden bg-champagne-darker select-none ring-2 ring-main ${
                dragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{
                  objectPosition: posString,
                  ...(scaleName ? { transform: `scale(${scale})`, transformOrigin: posString } : {}),
                }}
                draggable={false}
              />
              {/* Focal-point crosshair */}
              <div
                className="absolute w-8 h-8 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  opacity: dragging ? 1 : 0.9,
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.25)",
                }}
              >
                <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-champagne-dark" />
              </div>
            </div>
          </div>

          {/* Zoom slider — only when scaleName is provided */}
          {scaleName && (
            <div className={`flex items-center gap-3 ${controlsWidthClass}`}>
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider shrink-0">Zoom</label>
              <button
                type="button"
                onClick={() => setScale((s) => clampScale(s - SCALE_STEP * 2))}
                className="w-7 h-7 rounded-lg border border-line text-ink inline-flex items-center justify-center hover:border-main transition-colors cursor-pointer shrink-0"
                title="Zoom out"
              >
                <Minus size={12} />
              </button>
              <input
                type="range"
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={SCALE_STEP}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-main"
              />
              <button
                type="button"
                onClick={() => setScale((s) => clampScale(s + SCALE_STEP * 2))}
                className="w-7 h-7 rounded-lg border border-line text-ink inline-flex items-center justify-center hover:border-main transition-colors cursor-pointer shrink-0"
                title="Zoom in"
              >
                <Plus size={12} />
              </button>
              <span className="text-[11px] text-ink font-mono tabular-nums min-w-[40px] text-right">
                {scale.toFixed(2)}×
              </span>
            </div>
          )}

          <div className={`flex items-center justify-between gap-2 ${controlsWidthClass}`}>
            <p className="text-[11px] text-muted font-mono">{posString}</p>
            <button
              type="button"
              onClick={() => { setPos({ x: 50, y: 50 }); if (scaleName) setScale(1); }}
              className="text-[11px] text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {hiddenInputs}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6" onClick={() => setModalOpen(false)}>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-champagne-dark/10 hover:bg-champagne-dark/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt={alt} className="w-full h-auto max-h-[90vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

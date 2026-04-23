"use client";

/**
 * Circular focal-point editor with zoom. Used for the doctor's
 * "booking-form circle thumbnail" — the tiny 36 px round avatar
 * rendered in the booking combobox on the public site.
 *
 * The preview is square with a circular mask over it so the admin
 * sees exactly what a 36 px circle will show. Two native-form hidden
 * inputs (`circle_focal_point` + `circle_scale`) carry the current
 * values back to the server action when the parent form submits;
 * parent can also observe live changes via `onChange`.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Pencil, Check } from "lucide-react";

interface Props {
  name: string;
  label: string;
  photoUrl: string | null | undefined;
  defaultFocalPoint?: string;
  defaultScale?: number;
  /** Form field names the inputs bind to (focal + scale). */
  focalFieldName: string;
  scaleFieldName: string;
  alt?: string;
  onChange?: (focal: string, scale: number) => void;
}

const SCALE_MIN = 0.5;
const SCALE_MAX = 4;
const SCALE_STEP = 0.05;

function parsePosition(v?: string | null): { x: number; y: number } {
  if (!v) return { x: 50, y: 50 };
  const keywords: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const [px, py] = v.trim().split(/\s+/);
  const x = px?.endsWith("%") ? parseFloat(px) : keywords[px] ?? 50;
  const y = py?.endsWith("%") ? parseFloat(py) : keywords[py] ?? 50;
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
}

export default function CirclePhotoEditor({
  label, photoUrl, defaultFocalPoint, defaultScale,
  focalFieldName, scaleFieldName, alt = "", onChange,
}: Props) {
  const [pos, setPos] = useState(parsePosition(defaultFocalPoint));
  const [scale, setScale] = useState<number>(
    Number.isFinite(defaultScale) && (defaultScale as number) > 0 ? (defaultScale as number) : 1,
  );
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const posString = `${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`;

  useEffect(() => { onChange?.(posString, scale); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [posString, scale]);

  const clampScale = (s: number) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, Number(s.toFixed(3))));

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

  // Wheel-to-zoom inside the preview — native listener so we can
  // preventDefault (React's synthetic onWheel is passive-by-default).
  useEffect(() => {
    if (!editing) return;
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => clampScale(s - e.deltaY * 0.0015));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [editing]);

  // Always emit hidden inputs so the parent form picks up the values
  // even when the editor isn't expanded. `name` in the Props is unused —
  // we use `focalFieldName` and `scaleFieldName` explicitly.
  const hiddenInputs = (
    <>
      <input type="hidden" name={focalFieldName} value={posString} />
      <input type="hidden" name={scaleFieldName} value={scale.toFixed(3)} />
    </>
  );

  if (!photoUrl) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
        <p className="text-xs text-muted italic">
          Upload the booking-modal photo first to edit the circular crop.
        </p>
        {hiddenInputs}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
            editing
              ? "bg-success/10 text-success hover:bg-success/20"
              : "bg-main/10 text-main hover:bg-main/20"
          }`}
        >
          {editing ? <><Check size={12} /> Done</> : <><Pencil size={12} /> Edit circle</>}
        </button>
      </div>

      {/* Collapsed: 48 px live preview so the admin sees the real render */}
      {!editing && (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-champagne-dark border border-line shrink-0">
            <div
              className="absolute inset-0"
              style={{ transform: `scale(${scale})`, transformOrigin: posString }}
            >
              <Image src={photoUrl} alt={alt} fill sizes="48px" className="object-cover" style={{ objectPosition: posString }} />
            </div>
          </div>
          <p className="text-[11px] text-muted font-mono">
            {posString} · {scale.toFixed(2)}×
          </p>
        </div>
      )}

      {/* Expanded: big square preview with circular mask + controls */}
      {editing && (
        <>
          <p className="text-xs text-muted">
            Drag to set the focal point, scroll (or use the slider) to zoom into the face.
          </p>

          <div className="flex flex-col items-center gap-3">
            <div
              ref={frameRef}
              className={`relative aspect-square w-64 rounded-full overflow-hidden bg-champagne-darker select-none ring-2 ring-main ${
                dragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="absolute inset-0"
                style={{ transform: `scale(${scale})`, transformOrigin: posString }}
              >
                <Image
                  src={photoUrl}
                  alt={alt}
                  fill
                  className="object-cover pointer-events-none"
                  style={{ objectPosition: posString }}
                  sizes="256px"
                  draggable={false}
                />
              </div>
              <div
                className="absolute w-7 h-7 rounded-full border-2 border-white pointer-events-none"
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

            <div className="flex items-center gap-3 w-full max-w-[320px]">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider shrink-0">Zoom</label>
              <button
                type="button"
                onClick={() => setScale((s) => clampScale(s - SCALE_STEP * 2))}
                className="w-7 h-7 rounded-lg border border-line text-ink inline-flex items-center justify-center hover:border-main transition-colors cursor-pointer"
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
                className="w-7 h-7 rounded-lg border border-line text-ink inline-flex items-center justify-center hover:border-main transition-colors cursor-pointer"
                title="Zoom in"
              >
                <Plus size={12} />
              </button>
              <span className="text-[11px] text-ink font-mono tabular-nums min-w-[40px] text-right">
                {scale.toFixed(2)}×
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 w-full max-w-[320px]">
              <p className="text-[11px] text-muted font-mono">{posString}</p>
              <button
                type="button"
                onClick={() => { setPos({ x: 50, y: 50 }); setScale(1); }}
                className="text-[11px] text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )}

      {hiddenInputs}
    </div>
  );
}

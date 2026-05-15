"use client";

/**
 * Responsive focal-point editor for homepage hero slides.
 *
 * Works like Chrome DevTools' responsive mode: pick a preset viewport
 * (Desktop / Tablet / Mobile) or drag the right / bottom / corner handles
 * to emulate any arbitrary size. The preview mirrors the live hero — same
 * typography, gradients, content positioning and CTA styling — at the
 * emulated viewport's actual dimensions, scaled to fit the modal panel.
 *
 * Each breakpoint carries both a focal point (object-position) AND a zoom
 * scale so the admin can handle cases where `object-cover` leaves no
 * vertical/horizontal slack (e.g. a landscape photo on a tall phone —
 * zooming in gives the focal point room to move). Zoom via the slider
 * or the scroll-wheel directly over the preview.
 */

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Monitor, Tablet, Smartphone, MapPin, Copy as CopyIcon, Minus, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type Breakpoint = "desktop" | "tablet" | "mobile";
export type HeroFocalBP = { pos: string; scale: number };
export type HeroFocalValue = Record<Breakpoint, HeroFocalBP>;

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  initial: HeroFocalValue;
  heroContent: { title: string; subtitle: string; cta: string; location: string };
  onSave: (next: HeroFocalValue) => void;
}

const PRESETS: { key: Breakpoint; label: string; w: number; h: number; icon: typeof Monitor }[] = [
  { key: "desktop", label: "Desktop", w: 1440, h: 900, icon: Monitor },
  { key: "tablet",  label: "Tablet",  w: 820,  h: 1180, icon: Tablet },
  { key: "mobile",  label: "Mobile",  w: 390,  h: 844,  icon: Smartphone },
];

function bpForWidth(w: number): Breakpoint {
  if (w >= 1024) return "desktop";
  if (w >= 768) return "tablet";
  return "mobile";
}

function parsePosition(val: string | undefined | null): { x: number; y: number } {
  if (!val) return { x: 50, y: 50 };
  const keywords: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const parts = val.trim().split(/\s+/);
  const [px, py] = parts;
  const x = px?.endsWith("%") ? parseFloat(px) : keywords[px] ?? 50;
  const y = py?.endsWith("%") ? parseFloat(py) : keywords[py] ?? 50;
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
}

function headingSize(vw: number): number {
  return Math.max(40, Math.min(64, vw * 0.05));
}

const MIN_W = 320;
const MAX_W = 1920;
const MIN_H = 480;
const MAX_H = 2400;
const SCALE_MIN = 0.5;
const SCALE_MAX = 3;
const SCALE_STEP = 0.05;

export default function HeroFocalResponsiveEditor({
  open, onClose, imageUrl, initial, heroContent, onSave,
}: Props) {
  const [focal, setFocal] = useState<HeroFocalValue>(initial);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: PRESETS[0].w, h: PRESETS[0].h });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<null | "right" | "bottom" | "corner">(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageMaxW, setStageMaxW] = useState(720);

  useEffect(() => { if (open) setFocal(initial); }, [open, initial]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageMaxW(el.clientWidth - 4));
    ro.observe(el);
    setStageMaxW(el.clientWidth - 4);
    return () => ro.disconnect();
  }, [open]);

  const active = bpForWidth(viewport.w);
  const current = focal[active];
  const pos = useMemo(() => parsePosition(current.pos), [current.pos]);
  const posString = `${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`;
  const scale = current.scale;

  const fitScale = Math.min(1, stageMaxW / viewport.w, 620 / viewport.h);
  const displayW = Math.round(viewport.w * fitScale);
  const displayH = Math.round(viewport.h * fitScale);

  const patchActive = (patch: Partial<HeroFocalBP>) => {
    setFocal((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
  };

  const updatePos = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clamped = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    patchActive({ pos: `${clamped.x.toFixed(1)}% ${clamped.y.toFixed(1)}%` });
  };

  const clampScale = (s: number) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, Number(s.toFixed(3))));
  const setScale = (s: number) => patchActive({ scale: clampScale(s) });

  const onPointerDown = (e: React.PointerEvent) => {
    if (resizing) return;
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

  // Native (non-passive) wheel handler so we can `preventDefault` and block
  // page-scroll while the admin zooms inside the preview. React's synthetic
  // onWheel is attached passive by default and can't cancel the event.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      setFocal((prev) => ({
        ...prev,
        [active]: { ...prev[active], scale: clampScale(prev[active].scale + delta * 0.0015) },
      }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [active]);

  const startResize = useCallback((e: React.PointerEvent, mode: "right" | "bottom" | "corner") => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setResizing(mode);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = viewport.w;
    const startH = viewport.h;
    const startScale = fitScale;
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / startScale;
      const dy = (ev.clientY - startY) / startScale;
      setViewport(() => ({
        w: mode === "bottom" ? startW : Math.max(MIN_W, Math.min(MAX_W, Math.round(startW + dx))),
        h: mode === "right"  ? startH : Math.max(MIN_H, Math.min(MAX_H, Math.round(startH + dy))),
      }));
    };
    const onUp = () => {
      setResizing(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [viewport.w, viewport.h, fitScale]);

  const setPreset = (p: (typeof PRESETS)[number]) => setViewport({ w: p.w, h: p.h });

  const copyFromActive = (target: Breakpoint) => {
    setFocal((prev) => ({ ...prev, [target]: { ...prev[active] } }));
  };

  const reset = () => {
    const fresh: HeroFocalBP = { pos: "50% 50%", scale: 1 };
    setFocal({ desktop: fresh, tablet: fresh, mobile: fresh });
  };
  const handleSave = () => { onSave(focal); onClose(); };

  const h1Font = headingSize(viewport.w);
  const containerPad = viewport.w >= 1024 ? 48 : viewport.w >= 640 ? 24 : 16;
  const containerMaxW = 1440;
  const contentMaxW = Math.min(viewport.w - containerPad * 2, 820);

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm:max-w-5xl">
      <div className="flex flex-col max-h-[94vh]">
        <div className="px-6 py-4 border-b border-line">
          <h2 className="font-heading text-lg text-ink">Edit hero focal points</h2>
          <p className="text-xs text-muted mt-0.5">
            Drag inside the preview to move the focal point. Scroll or use the slider to zoom.
            Drag the frame&apos;s right / bottom / corner to emulate any viewport — breakpoints
            follow the emulated width automatically.
          </p>
        </div>

        {/* Controls row */}
        <div className="px-6 py-3 border-b border-line flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-champagne-dark gap-1">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isActive = active === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={14} />
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] text-ink font-mono">
            <span className="tabular-nums">{viewport.w}</span>
            <span className="text-muted">×</span>
            <span className="tabular-nums">{viewport.h}</span>
            <span className="text-muted ml-1">· {active}</span>
          </div>

          <div className="text-[11px] text-muted font-mono ml-auto">
            {posString} · {scale.toFixed(2)}×
          </div>

          <div className="inline-flex gap-1">
            {(["desktop", "tablet", "mobile"] as Breakpoint[])
              .filter((k) => k !== active)
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => copyFromActive(k)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted hover:text-ink hover:bg-champagne-dark transition-colors cursor-pointer"
                  title={`Copy active focal + zoom to ${k}`}
                >
                  <CopyIcon size={10} />
                  → {k}
                </button>
              ))}
          </div>
        </div>

        {/* Scale controls */}
        <div className="px-6 py-3 border-b border-line flex items-center gap-3">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wider shrink-0">Zoom</label>
          <button
            type="button"
            onClick={() => setScale(scale - SCALE_STEP * 2)}
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
            onClick={() => setScale(scale + SCALE_STEP * 2)}
            className="w-7 h-7 rounded-lg border border-line text-ink inline-flex items-center justify-center hover:border-main transition-colors cursor-pointer"
            title="Zoom in"
          >
            <Plus size={12} />
          </button>
          <span className="text-[11px] text-ink font-mono tabular-nums min-w-[48px] text-right">
            {scale.toFixed(2)}×
          </span>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="text-[11px] text-muted hover:text-ink transition-colors cursor-pointer"
            title="Reset zoom to 1x"
          >
            reset
          </button>
        </div>

        <div
          ref={stageRef}
          className="flex-1 overflow-auto px-6 py-6 bg-champagne-dark/40 flex flex-col items-center gap-3"
        >
          <div className="relative" style={{ width: displayW, height: displayH }}>
            <div
              ref={frameRef}
              className={`absolute inset-0 overflow-hidden rounded-xl border border-line bg-black shadow-lg select-none ${
                dragging ? "cursor-grabbing" : resizing ? "cursor-default" : "cursor-grab"
              }`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  width: viewport.w,
                  height: viewport.h,
                  transform: `scale(${fitScale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* Zoom layer — exactly matches the live Hero.tsx: a scaled
                     wrapper with transform-origin at the focal point, so
                     zooming pivots around the focused subject. */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: posString,
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: posString }}
                    sizes="100vw"
                    draggable={false}
                  />
                </div>

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)",
                  }}
                />
                <div
                  className="absolute inset-x-0 top-0 pointer-events-none"
                  style={{
                    height: viewport.w >= 1024 ? 224 : 160,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
                  }}
                />

                <div className="relative h-full flex items-center">
                  <div
                    className="w-full mx-auto"
                    style={{
                      maxWidth: containerMaxW,
                      paddingLeft: containerPad,
                      paddingRight: containerPad,
                    }}
                  >
                    <div style={{ maxWidth: contentMaxW }}>
                      <h1
                        className="heading-1 text-champagne"
                        style={{ fontSize: `${h1Font}px` }}
                      >
                        {heroContent.title || "Hero title"}
                      </h1>
                      <p
                        className="body-l text-white-60 mt-5"
                        style={{ maxWidth: "54ch" }}
                      >
                        {heroContent.subtitle || "Hero subtitle"}
                      </p>
                      <div className="flex flex-col gap-4 mt-8">
                        <span className="inline-flex items-center gap-1.5 body-l text-white-60">
                          <MapPin className="w-4 h-4" />
                          {heroContent.location || "Location"}
                        </span>
                        <span
                          className="inline-flex items-center justify-center rounded-[var(--radius-button)] bg-champagne text-black font-medium self-start px-9 py-4 text-base"
                        >
                          {heroContent.cta || "Book consultation"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute w-8 h-8 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  opacity: dragging ? 1 : 0.95,
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.25), 0 0 16px rgba(0,0,0,0.35)",
                }}
              >
                <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-champagne-dark" />
              </div>
            </div>

            {/* Resize handles */}
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={(e) => startResize(e, "right")}
              className={`absolute top-0 bottom-0 -right-1.5 w-3 cursor-ew-resize flex items-center justify-center ${
                resizing === "right" ? "bg-main/20" : ""
              }`}
              title="Drag to resize width"
            >
              <div className="w-[3px] h-12 rounded-full bg-ink/30 hover:bg-main transition-colors pointer-events-none" />
            </div>
            <div
              role="separator"
              aria-orientation="horizontal"
              onPointerDown={(e) => startResize(e, "bottom")}
              className={`absolute left-0 right-0 -bottom-1.5 h-3 cursor-ns-resize flex items-center justify-center ${
                resizing === "bottom" ? "bg-main/20" : ""
              }`}
              title="Drag to resize height"
            >
              <div className="h-[3px] w-12 rounded-full bg-ink/30 hover:bg-main transition-colors pointer-events-none" />
            </div>
            <div
              role="separator"
              onPointerDown={(e) => startResize(e, "corner")}
              className={`absolute -right-2 -bottom-2 w-5 h-5 cursor-nwse-resize ${
                resizing === "corner" ? "text-main" : "text-ink/40 hover:text-main"
              }`}
              title="Drag to resize both"
            >
              <svg viewBox="0 0 20 20" className="w-full h-full">
                <path d="M18 6 L6 18 M18 11 L11 18 M18 16 L16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <p className="text-[11px] text-muted text-center max-w-md">
            Preview matches the live hero typography, gradients, and content position.
            Scroll over the preview to zoom — the focal point stays anchored.
            {fitScale < 1 && <> Scaled to {Math.round(fitScale * 100)}% to fit the modal.</>}
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-line">
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted hover:text-ink transition-colors cursor-pointer"
          >
            Reset all to center · 1×
          </button>
          <div className="flex-1" />
          <Button variant="neutral" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Apply focal points
          </Button>
        </div>
      </div>
    </Modal>
  );
}

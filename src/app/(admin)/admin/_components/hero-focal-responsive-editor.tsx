"use client";

/**
 * Responsive focal-point editor for homepage hero slides.
 *
 * The live homepage hero keeps the same image across desktop / tablet /
 * mobile, but on a 390-wide phone a centred crop loses subjects that sit
 * well at 1440. This modal lets the admin pick three independent focal
 * points and preview each against a faithful mock of the real hero layout
 * — H1, subtitle, map link and CTA all laid over the image at the actual
 * breakpoint aspect ratio.
 *
 * Drag anywhere on the preview to reposition the crosshair; the object-
 * position string ({x}% {y}%) updates live for the active breakpoint only.
 */

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Monitor, Tablet, Smartphone, MapPin, Copy as CopyIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type Breakpoint = "desktop" | "tablet" | "mobile";
export type HeroFocalValue = Record<Breakpoint, string>;

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  initial: HeroFocalValue;
  /** Real H1 / subtitle / CTA copy from the homepage hero singleton,
   *  rendered at-scale inside the preview so the admin sees the crop
   *  against the actual content that will sit on top. */
  heroContent: { title: string; subtitle: string; cta: string; location: string };
  onSave: (next: HeroFocalValue) => void;
}

/** Simulated viewport dimensions per breakpoint. These are what the preview
 *  frame *looks like* in the live site — they drive the frame's aspect ratio
 *  and the transform-scale so the overlaid content renders pixel-accurately
 *  relative to the image. */
const VIEWPORTS: Record<Breakpoint, { w: number; h: number; label: string; icon: typeof Monitor }> = {
  desktop: { w: 1440, h: 900, label: "Desktop", icon: Monitor },
  tablet: { w: 820, h: 1180, label: "Tablet", icon: Tablet },
  mobile: { w: 390, h: 844, label: "Mobile", icon: Smartphone },
};

function parsePosition(val: string | undefined | null): { x: number; y: number } {
  if (!val) return { x: 50, y: 50 };
  const keywords: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const parts = val.trim().split(/\s+/);
  const [px, py] = parts;
  const x = px?.endsWith("%") ? parseFloat(px) : keywords[px] ?? 50;
  const y = py?.endsWith("%") ? parseFloat(py) : keywords[py] ?? 50;
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
}

export default function HeroFocalResponsiveEditor({
  open, onClose, imageUrl, initial, heroContent, onSave,
}: Props) {
  const [focal, setFocal] = useState<HeroFocalValue>(initial);
  const [active, setActive] = useState<Breakpoint>("desktop");
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Reset internal state every time the modal is opened with a new slide.
  useEffect(() => { if (open) setFocal(initial); }, [open, initial]);

  const pos = useMemo(() => parsePosition(focal[active]), [focal, active]);
  const posString = `${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`;

  const updatePos = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clamped = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    setFocal((prev) => ({ ...prev, [active]: `${clamped.x.toFixed(1)}% ${clamped.y.toFixed(1)}%` }));
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

  const vp = VIEWPORTS[active];
  // Cap the preview's WIDTH to a value that fits inside the modal panel.
  // The inner scaled content uses the real viewport dimensions so the H1 /
  // CTA render at exactly the right proportions after the CSS transform.
  const MAX_W = 720;
  const scale = Math.min(1, MAX_W / vp.w);
  const frameW = Math.round(vp.w * scale);
  const frameH = Math.round(vp.h * scale);

  const copyFromActive = (source: Breakpoint, target: Breakpoint) => {
    setFocal((prev) => ({ ...prev, [target]: prev[source] }));
  };

  const reset = () => setFocal({ desktop: "50% 50%", tablet: "50% 50%", mobile: "50% 50%" });
  const handleSave = () => { onSave(focal); onClose(); };

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm:max-w-4xl">
      <div className="flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-line">
          <h2 className="font-heading text-lg text-ink">Edit hero focal points</h2>
          <p className="text-xs text-muted mt-0.5">
            Drag inside the preview to reposition the focal point on the active breakpoint.
            Each breakpoint is saved independently.
          </p>
        </div>

        {/* Viewport toggle + current value + copy shortcut */}
        <div className="px-6 py-3 border-b border-line flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-champagne-dark gap-1">
            {(Object.keys(VIEWPORTS) as Breakpoint[]).map((k) => {
              const v = VIEWPORTS[k];
              const Icon = v.icon;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActive(k)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active === k ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={14} />
                  {v.label}
                  <span className="text-[10px] text-muted/70 font-mono ml-1">{v.w}</span>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-muted font-mono ml-auto">{posString}</div>
          <div className="inline-flex gap-1">
            {(Object.keys(VIEWPORTS) as Breakpoint[])
              .filter((k) => k !== active)
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => copyFromActive(active, k)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted hover:text-ink hover:bg-champagne-dark transition-colors cursor-pointer"
                  title={`Copy this focal point to ${VIEWPORTS[k].label}`}
                >
                  <CopyIcon size={10} />
                  → {VIEWPORTS[k].label}
                </button>
              ))}
          </div>
        </div>

        {/* Preview frame */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-champagne-dark/40 flex flex-col items-center gap-3">
          <div
            ref={frameRef}
            className={`relative overflow-hidden rounded-xl border border-line bg-black shadow-lg select-none ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ width: frameW, height: frameH }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Inner scaled container — the children render at the real
                viewport size, then CSS transform scales everything down so
                content fits the preview frame while staying proportional. */}
            <div
              className="absolute top-0 left-0"
              style={{
                width: vp.w,
                height: vp.h,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover pointer-events-none"
                style={{ objectPosition: posString }}
                sizes="100vw"
                draggable={false}
              />

              {/* Left darken gradient — matches live hero */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)",
                }}
              />
              {/* Top dim for header readability */}
              <div
                className="absolute inset-x-0 top-0 pointer-events-none"
                style={{
                  height: active === "desktop" ? 224 : 160,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
                }}
              />

              {/* Content overlay — rough mirror of the live hero, rendered at
                   true size so that after transform-scale it matches the real
                   mobile/tablet/desktop layouts. */}
              <div className="relative h-full flex items-center">
                <div
                  className="w-full"
                  style={{
                    paddingLeft: active === "desktop" ? 48 : active === "tablet" ? 24 : 16,
                    paddingRight: active === "desktop" ? 48 : active === "tablet" ? 24 : 16,
                  }}
                >
                  <div style={{ maxWidth: active === "mobile" ? "100%" : 620 }}>
                    <h1
                      className="font-heading text-champagne"
                      style={{ fontSize: active === "desktop" ? 72 : active === "tablet" ? 52 : 38, lineHeight: 1.05 }}
                    >
                      {heroContent.title || "Hero title"}
                    </h1>
                    <p
                      className="text-white/70 mt-5"
                      style={{ fontSize: active === "desktop" ? 20 : 16, maxWidth: "54ch" }}
                    >
                      {heroContent.subtitle || "Hero subtitle"}
                    </p>
                    <div className="flex flex-col gap-3 mt-7">
                      <span className="inline-flex items-center gap-1.5 text-white/70" style={{ fontSize: active === "desktop" ? 16 : 13 }}>
                        <MapPin size={active === "desktop" ? 16 : 13} />
                        {heroContent.location || "Location"}
                      </span>
                      <span
                        className="inline-flex items-center justify-center rounded-xl bg-champagne text-ink font-medium self-start"
                        style={{
                          paddingInline: active === "desktop" ? 24 : 18,
                          paddingBlock: active === "desktop" ? 14 : 10,
                          fontSize: active === "desktop" ? 16 : 13,
                        }}
                      >
                        {heroContent.cta || "Book consultation"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crosshair marker — positioned in frame coords (not scaled) so
                 the hit target stays usable on small viewports. */}
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

          <p className="text-[11px] text-muted text-center">
            Frame mirrors a <strong>{vp.w}×{vp.h}</strong> viewport scaled to {Math.round(scale * 100)}%.
            Content over the image is approximate — positioning is faithful.
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-line">
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted hover:text-ink transition-colors cursor-pointer"
          >
            Reset all to center
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

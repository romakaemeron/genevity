"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import type { MediaMentionPublic } from "@/lib/db/queries/media";

/** Thumbnail that falls back to the GENEVITY logo on a brand-brown background
 * when the image is missing or fails to load (some outlets hotlink-protect or
 * 404 their og:image). */
function CardThumb({ src }: { src: string | null }) {
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // The <img> is server-rendered, so it can finish (and fail) loading before
  // React hydrates and attaches onError — that event would be lost. After mount,
  // check for an already-broken image (complete but zero natural size) so the
  // logo fallback still shows.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setErrored(true);
  }, [src]);
  const showImg = src && !errored;
  return (
    <div className="aspect-[16/9] w-full overflow-hidden bg-champagne-darker">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={src} alt="" loading="lazy" onError={() => setErrored(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-main px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/LogoFullLight.svg" alt="GENEVITY" loading="lazy"
            className="h-9 w-auto opacity-90" />
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const tag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB";
  try { return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(iso)); } catch { return null; }
}

/**
 * A single press-mention card: thumbnail (with logo fallback), publisher chip,
 * title, date and a "read" button that is a stretched nofollow link over the
 * whole card. Shared by the /media page grid and the homepage slider.
 */
export default function MediaCard({
  mention: m, locale, readLabel,
}: { mention: MediaMentionPublic; locale: string; readLabel: string }) {
  const date = formatDate(m.publishedAt, locale);
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[16px] bg-champagne-dark transition-colors hover:bg-champagne-darker">
      <CardThumb src={m.imageUrl} />
      <div className="flex flex-1 flex-col gap-3 p-card">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.logo} alt="" width={20} height={20}
            loading="lazy" className="h-5 w-5 rounded-xs"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="body-s font-medium text-main/70">{m.publisherName}</span>
        </div>
        <h2 className="body-strong line-clamp-3 text-black transition-colors group-hover:text-main">{m.title}</h2>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {date && <time className="body-s text-main/50">{date}</time>}
          <Button
            href={m.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            variant="outline"
            size="sm"
            className="ml-auto after:absolute after:inset-0 after:content-['']"
          >
            {readLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

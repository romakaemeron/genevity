"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { RotateCcw, RotateCw, Trash2, Plus, Loader2 } from "lucide-react";
import {
  rotateCertificateImage,
  deleteCertificateImage,
  uploadCertificateImage,
} from "../../_actions/doctors";

type CertImg = { url: string; type: "image" | "pdf"; alt_uk: string };

interface Props {
  doctorId: string;
  initialImages: CertImg[];
}

export default function CertificatesEditor({ doctorId, initialImages }: Props) {
  const [images, setImages] = useState<CertImg[]>(initialImages);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const imageItems = images.filter((c) => c.type === "image");

  function setBusy(url: string, label: string) {
    setPending((p) => ({ ...p, [url]: label }));
  }
  function clearBusy(url: string) {
    setPending((p) => { const n = { ...p }; delete n[url]; return n; });
  }

  function handleRotate(url: string, dir: "cw" | "ccw") {
    setError(null);
    setBusy(url, dir === "cw" ? "↻" : "↺");
    startTransition(async () => {
      const res = await rotateCertificateImage(doctorId, url, dir);
      if (res.error) { setError(res.error); clearBusy(url); return; }
      // Re-fetch updated list from server via router refresh — simplest approach:
      // optimistically show a cache-busted URL so the thumbnail updates immediately
      setImages((prev) =>
        prev.map((c) =>
          c.url === url ? { ...c, url: c.url + `?r=${Date.now()}` } : c
        )
      );
      // Full page refresh to get the real new URL from server
      window.location.reload();
    });
  }

  function handleDelete(url: string) {
    if (!confirm("Delete this certificate image?")) return;
    setError(null);
    setBusy(url, "del");
    startTransition(async () => {
      const res = await deleteCertificateImage(doctorId, url);
      if (res.error) { setError(res.error); clearBusy(url); return; }
      setImages((prev) => prev.filter((c) => c.url !== url));
      clearBusy(url);
    });
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const tempUrl = URL.createObjectURL(file);
    setBusy(tempUrl, "upload");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadCertificateImage(doctorId, fd);
      if (res.error) { setError(res.error); clearBusy(tempUrl); return; }
      window.location.reload();
    });
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">
            {imageItems.length} image{imageItems.length !== 1 ? "s" : ""}
            {images.length !== imageItems.length ? ` (${images.length - imageItems.length} non-image hidden)` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-main text-white text-xs font-medium hover:bg-main/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {imageItems.length === 0 && (
        <p className="text-xs text-muted italic">No certificate images yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {imageItems.map((cert) => {
          const isBusy = !!pending[cert.url];
          return (
            <div key={cert.url} className="flex flex-col gap-1.5">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-line">
                <Image
                  src={cert.url.split("?")[0]}
                  alt={cert.alt_uk}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized
                />
                {isBusy && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-main" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 justify-center">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleRotate(cert.url, "ccw")}
                  title="Rotate counter-clockwise"
                  className="w-7 h-7 rounded-lg border border-line bg-white hover:bg-stone-50 flex items-center justify-center disabled:opacity-40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-ink" />
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleRotate(cert.url, "cw")}
                  title="Rotate clockwise"
                  className="w-7 h-7 rounded-lg border border-line bg-white hover:bg-stone-50 flex items-center justify-center disabled:opacity-40 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-ink" />
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDelete(cert.url)}
                  title="Delete"
                  className="w-7 h-7 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center disabled:opacity-40 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

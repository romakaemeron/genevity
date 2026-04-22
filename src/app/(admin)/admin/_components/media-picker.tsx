"use client";

/**
 * Reusable in-editor media picker. Opens a modal with the full media library,
 * lets the admin filter by folder + search, and returns the selected asset's
 * URL to the caller via `onPick`. Fetches assets lazily on first open so the
 * ~200 KB of data doesn't ship with every form.
 *
 * Used by {@link ImageUpload} to offer a "Pick from library" affordance next
 * to the file-upload drop zone.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Folder as FolderIcon, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { listMediaAssets, type MediaAssetDTO } from "../_actions/media";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fires with the picked asset's absolute URL (either a blob or /public/ path). */
  onPick: (url: string, asset: MediaAssetDTO) => void;
  /** Preselect this folder when the picker opens — handy when the caller knows
   *  the asset type (e.g., ImageUpload passing "services" to show service hero images first). */
  preferredFolder?: string;
}

export default function MediaPicker({ open, onClose, onPick, preferredFolder }: Props) {
  const [assets, setAssets] = useState<MediaAssetDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [folder, setFolder] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  // Lazy fetch on first open
  useEffect(() => {
    if (!open || assets !== null) return;
    setLoading(true);
    listMediaAssets()
      .then((res) => {
        setAssets(res);
        if (preferredFolder && res.some((a) => a.folder === preferredFolder)) {
          setFolder(preferredFolder);
        }
      })
      .finally(() => setLoading(false));
  }, [open, assets, preferredFolder]);

  const folders = useMemo(() => {
    if (!assets) return [] as string[];
    return Array.from(new Set(assets.map((a) => a.folder))).sort();
  }, [assets]);

  const filtered = useMemo(() => {
    if (!assets) return [] as MediaAssetDTO[];
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (folder !== "all" && a.folder !== folder) return false;
      if (!q) return true;
      return (
        a.filename.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.folder.toLowerCase().includes(q)
      );
    });
  }, [assets, folder, query]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm:max-w-2xl">
      <div className="flex flex-col max-h-[85vh]">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
          <h2 className="font-heading text-lg text-ink">Pick from media library</h2>
          <span className="text-xs text-muted">{assets ? `${assets.length} assets` : "Loading…"}</span>
        </div>

        <div className="px-6 py-3 border-b border-line flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, folder…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FolderPill label="All" active={folder === "all"} onClick={() => setFolder("all")} />
            {folders.map((f) => (
              <FolderPill key={f} label={f} active={folder === f} onClick={() => setFolder(f)} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && <div className="text-center py-12 text-sm text-muted">Loading library…</div>}
          {!loading && assets && filtered.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-line text-muted text-sm">
              No assets match the filter. Upload from <strong>Media Library</strong> in the sidebar, then retry.
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onPick(a.url, a);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-champagne-dark cursor-pointer text-left hover:ring-2 hover:ring-main transition-all"
                  title={`${a.title} · ${a.folder}`}
                >
                  <Image
                    src={a.url}
                    alt={a.title}
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized={a.url.endsWith(".svg")}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[10px] text-white truncate">{a.title}</p>
                    <p className="text-[9px] text-white/70 truncate">{a.folder}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-main text-champagne items-center justify-center opacity-0 group-hover:flex transition-opacity hidden">
                    <Check size={12} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function FolderPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        active ? "bg-main text-champagne" : "bg-champagne-dark text-muted hover:text-ink"
      }`}
    >
      <FolderIcon size={11} />
      {label}
    </button>
  );
}

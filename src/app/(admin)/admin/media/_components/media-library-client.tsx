"use client";

import { useMemo, useState, useTransition, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Upload, Check, Copy, Trash2, Folder as FolderIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { uploadMediaAsset, deleteMediaAsset, renameFolder } from "../../_actions/media";

export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  folder: string;
  source: "blob" | "public";
  title: string;
  createdAt: string;
  mimeType: string | null;
  sizeBytes: number | null;
}

interface Props {
  assets: MediaAsset[];
  folders: string[];
}

export default function MediaLibraryClient({ assets, folders }: Props) {
  const [activeFolder, setActiveFolder] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (activeFolder !== "all" && a.folder !== activeFolder) return false;
      if (!q) return true;
      return (
        a.filename.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.folder.toLowerCase().includes(q)
      );
    });
  }, [assets, activeFolder, query]);

  const copyUrl = async (a: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(a.url);
      setCopiedId(a.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // noop
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, title, folder…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main"
          />
        </div>
        <div className="flex-1" />
        <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
          <Upload size={14} /> Upload image
        </Button>
      </div>

      {/* Folder tabs */}
      <div className="flex flex-wrap gap-2">
        <FolderTab
          label="All"
          count={assets.length}
          active={activeFolder === "all"}
          onClick={() => setActiveFolder("all")}
        />
        {folders.map((f) => (
          <FolderTab
            key={f}
            label={f}
            count={assets.filter((a) => a.folder === f).length}
            active={activeFolder === f}
            onClick={() => setActiveFolder(f)}
          />
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-line text-muted text-sm">
          No assets match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-champagne-dark cursor-pointer text-left hover:ring-2 hover:ring-main/40 transition-all"
              title={a.title}
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
            </button>
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadModal
          existingFolders={folders}
          onClose={() => setUploadOpen(false)}
        />
      )}

      {selected && (
        <AssetModal
          asset={selected}
          folders={folders}
          copiedId={copiedId}
          onCopyUrl={() => copyUrl(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function FolderTab({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        active ? "bg-main text-champagne" : "bg-champagne-dark text-muted hover:text-ink"
      }`}
    >
      <FolderIcon size={12} />
      <span>{label}</span>
      <span className={`text-[10px] tabular-nums ${active ? "text-champagne/80" : "text-muted"}`}>{count}</span>
    </button>
  );
}

function UploadModal({
  existingFolders,
  onClose,
}: {
  existingFolders: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState(existingFolders[0] || "uncategorized");
  const [customFolder, setCustomFolder] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!file) { setError("Pick a file first"); return; }
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", customFolder.trim() || folder);
      fd.append("title", title);
      const res = await uploadMediaAsset(fd);
      if (res && "error" in res && res.error) {
        setError(res.error);
      } else {
        router.refresh(); // pull the new asset into the grid
        onClose();
      }
    });
  };

  const picked = file?.name || "";

  return (
    <Modal open onClose={onClose} maxWidth="sm:max-w-lg">
      <div className="p-6">
        <h2 className="font-heading text-xl text-ink mb-1">Upload to media library</h2>
        <p className="body-s text-muted mb-5">
          Auto-converted to WebP (≤2400 px) and added to the selected folder. Reusable across sections without re-uploading.
        </p>

        {error && <div className="mb-4 p-3 bg-error-light text-error rounded-xl text-sm">{error}</div>}

        <div className="flex flex-col gap-4">
          {/* File picker */}
          <div
            className="relative aspect-[16/9] rounded-xl border-2 border-dashed border-line bg-champagne-dark flex items-center justify-center cursor-pointer hover:border-main/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={URL.createObjectURL(file)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted text-sm">
                <Upload size={20} />
                <span>Click to pick an image</span>
                <span className="text-xs text-muted">JPG / PNG / WebP / SVG</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          {picked && <p className="text-xs text-muted -mt-2">{picked}</p>}

          {/* Folder picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Folder</label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main"
            >
              {existingFolders.map((f) => <option key={f} value={f}>{f}</option>)}
              <option value="__new__">+ Create new folder…</option>
            </select>
            {folder === "__new__" && (
              <input
                value={customFolder}
                onChange={(e) => setCustomFolder(e.target.value)}
                placeholder="new-folder-name"
                className="mt-1 px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main"
              />
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to filename"
              className="px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="neutral" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={submit} disabled={pending || !file}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AssetModal({
  asset, folders, copiedId, onCopyUrl, onClose,
}: {
  asset: MediaAsset;
  folders: string[];
  copiedId: string | null;
  onCopyUrl: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [folder, setFolder] = useState(asset.folder);
  const [pending, startTransition] = useTransition();

  const saveFolder = () => {
    if (folder === asset.folder) return;
    startTransition(async () => {
      await renameFolder(asset.id, folder);
      router.refresh();
    });
  };
  const remove = () => {
    if (asset.source === "public") return;
    if (!confirm(`Delete “${asset.title}” from the library? This doesn't delete the blob file itself.`)) return;
    startTransition(async () => {
      await deleteMediaAsset(asset.id);
      router.refresh();
      onClose();
    });
  };

  return (
    <Modal open onClose={onClose} maxWidth="sm:max-w-lg">
      <div className="flex flex-col p-6 gap-4">
        {/* Image fills the modal width; height scales proportionally, capped so
            very tall photos don't overflow the viewport. */}
        <div className="w-full rounded-xl bg-champagne-dark overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.url}
            alt={asset.title}
            className="w-full h-auto max-h-[50vh] object-contain"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-heading text-lg text-ink break-all">{asset.title}</h3>
            <p className="text-xs text-muted mt-0.5 break-all">{asset.filename}</p>
          </div>

          <dl className="grid grid-cols-[80px_1fr] gap-y-1.5 text-xs">
            <dt className="text-muted">Source</dt>
            <dd className="text-ink">{asset.source === "blob" ? "Vercel Blob" : "Repo /public"}</dd>
            {asset.mimeType && (<><dt className="text-muted">Type</dt><dd className="text-ink font-mono">{asset.mimeType}</dd></>)}
            {asset.sizeBytes != null && (<><dt className="text-muted">Size</dt><dd className="text-ink">{formatBytes(asset.sizeBytes)}</dd></>)}
            <dt className="text-muted">Added</dt>
            <dd className="text-ink">{new Date(asset.createdAt).toLocaleString()}</dd>
          </dl>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">URL</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={asset.url}
                className="flex-1 px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-xs font-mono outline-none"
              />
              <Button variant="neutral" size="sm" onClick={onCopyUrl}>
                {copiedId === asset.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Folder</label>
            <div className="flex gap-2">
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main"
              >
                {folders.map((f) => <option key={f} value={f}>{f}</option>)}
                {!folders.includes(folder) && <option value={folder}>{folder}</option>}
              </select>
              {folder !== asset.folder && (
                <Button variant="primary" size="sm" onClick={saveFolder} disabled={pending}>Save</Button>
              )}
            </div>
          </div>

          <div className="flex-1" />

          {asset.source === "blob" ? (
            <Button variant="destructive-outline" size="sm" onClick={remove} disabled={pending} className="self-start">
              <Trash2 size={14} /> Delete from library
            </Button>
          ) : (
            <p className="text-xs text-muted italic">
              Bundled asset — lives in the repo&apos;s <code className="font-mono text-[10px]">/public/</code> directory.
              Not deletable from the admin.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

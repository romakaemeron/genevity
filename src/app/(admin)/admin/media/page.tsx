import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import MediaLibraryClient, { type MediaAsset } from "./_components/media-library-client";
import { AdminPageHeader } from "../_components/admin-list";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireSession();

  const rows = await sql`
    SELECT id, url, filename, folder, source, title, created_at, mime_type, size_bytes
    FROM media_assets
    ORDER BY created_at DESC, filename
  `;
  const assets: MediaAsset[] = rows.map((r) => ({
    id: r.id as string,
    url: r.url as string,
    filename: r.filename as string,
    folder: r.folder as string,
    source: r.source as "blob" | "public",
    title: (r.title as string) || (r.filename as string),
    createdAt: (r.created_at as Date).toISOString(),
    mimeType: (r.mime_type as string | null) || null,
    sizeBytes: r.size_bytes ? Number(r.size_bytes) : null,
  }));

  const folders = Array.from(new Set(assets.map((a) => a.folder))).sort();

  return (
    <div className="p-8 flex flex-col gap-6">
      <AdminPageHeader
        title="Media Library"
        subtitle={`${assets.length} assets in ${folders.length} folder${folders.length === 1 ? "" : "s"} — reusable across the site`}
      />
      <MediaLibraryClient assets={assets} folders={folders} />
    </div>
  );
}

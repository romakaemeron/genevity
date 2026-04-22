import { redirect } from "next/navigation";

// The editor URL for service detail pages now lives under /admin/pages for
// consistency with every other public-page editor. Anything still linking to
// the old URL is 301'd to the new one so old bookmarks keep working.
export default async function OldServiceEditorRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/pages/services/${id}`);
}

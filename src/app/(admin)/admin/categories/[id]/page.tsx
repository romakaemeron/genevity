import { redirect } from "next/navigation";

// The editor URL for service category pages now lives under /admin/pages for
// consistency with every other public-page editor. Anything still linking to
// the old URL is redirected to the new one.
export default async function OldCategoryEditorRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/pages/categories/${id}`);
}

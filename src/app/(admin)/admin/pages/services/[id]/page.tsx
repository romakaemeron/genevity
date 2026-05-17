import { redirect } from "next/navigation";

export default async function LegacyServiceEditorRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/services/${id}`);
}

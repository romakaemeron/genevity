import { notFound } from "next/navigation";
import { requireSession } from "../../_actions/auth";
import { adminGetMentionById } from "@/lib/db/queries/media";
import PressForm from "./_form";

export const dynamic = "force-dynamic";

export default async function PressEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const mention = id === "new" ? null : await adminGetMentionById(id);
  if (id !== "new" && !mention) notFound();
  return <PressForm mention={mention} />;
}

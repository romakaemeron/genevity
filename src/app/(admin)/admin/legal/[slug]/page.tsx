import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { notFound } from "next/navigation";
import LegalForm from "../_components/legal-form";

export default async function EditLegalDocPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSession();
  const { slug } = await params;

  if (slug === "new") {
    return <LegalForm />;
  }

  const rows = await sql`SELECT * FROM legal_docs WHERE slug = ${slug}`;
  if (!rows.length) notFound();

  return <LegalForm doc={rows[0] as any} />;
}

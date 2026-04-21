import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { notFound } from "next/navigation";
import CategoryForm from "../_components/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const rows = await sql`SELECT * FROM service_categories WHERE id = ${id}`;
  if (!rows.length) notFound();
  return <CategoryForm category={rows[0] as any} />;
}

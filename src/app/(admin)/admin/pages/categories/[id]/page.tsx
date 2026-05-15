import { sql } from "@/lib/db/client";
import { requireSession } from "../../../_actions/auth";
import { notFound } from "next/navigation";
import CategoryForm from "../../../categories/_components/category-form";

/**
 * Canonical editor URL for service category hub pages — /admin/pages/categories/<id>.
 * Reuses the existing CategoryForm so the only thing that changed is the URL.
 */
export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const rows = await sql`SELECT * FROM service_categories WHERE id = ${id}`;
  if (!rows.length) notFound();

  const [sectionRows, faqRows, doctorRows] = await Promise.all([
    sql`SELECT id, section_type, data, sort_order FROM content_sections WHERE owner_type = 'category' AND owner_id = ${id} ORDER BY sort_order`,
    sql`SELECT * FROM faq_items WHERE owner_type = 'category' AND owner_id = ${id} ORDER BY sort_order`,
    sql`SELECT id, name_uk, role_uk FROM doctors ORDER BY sort_order`,
  ]);

  const sections = sectionRows.map((r) => ({
    type: r.section_type as string,
    data: typeof r.data === "string" ? JSON.parse(r.data) : r.data,
  }));

  const faq = faqRows.map((r) => ({
    question_uk: r.question_uk || "",
    question_ru: r.question_ru || "",
    question_en: r.question_en || "",
    answer_uk: r.answer_uk || "",
    answer_ru: r.answer_ru || "",
    answer_en: r.answer_en || "",
  }));

  return <CategoryForm category={rows[0] as any} sections={sections} faq={faq} doctors={doctorRows as any} />;
}

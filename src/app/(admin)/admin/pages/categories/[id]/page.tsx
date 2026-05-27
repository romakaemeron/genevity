import { sql } from "@/lib/db/client";
import { requireSession } from "../../../_actions/auth";
import { notFound } from "next/navigation";
import CategoryForm from "../../../categories/_components/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const rows = await sql`SELECT * FROM service_categories WHERE id = ${id}`;
  if (!rows.length) notFound();

  const cat = rows[0];
  const galleryKey = `category_${cat.slug as string}`;

  const [sectionRows, faqRows, doctorRows, galleryRows] = await Promise.all([
    sql`SELECT id, section_type, data, sort_order FROM content_sections WHERE owner_type = 'category' AND owner_id = ${id} ORDER BY sort_order`,
    sql`SELECT * FROM faq_items WHERE owner_type = 'category' AND owner_id = ${id} ORDER BY sort_order`,
    sql`SELECT id, name_uk, role_uk FROM doctors ORDER BY sort_order`,
    sql`SELECT * FROM gallery_items WHERE owner_key = ${galleryKey} ORDER BY sort_order`,
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

  const gallery = (galleryRows as any[]).map((r) => ({
    id: r.id as string,
    image_url: (r.image_url as string) || "",
    alt_uk: (r.alt_uk as string) || "", alt_ru: (r.alt_ru as string) || "", alt_en: (r.alt_en as string) || "",
    title_uk: (r.title_uk as string) || "", title_ru: (r.title_ru as string) || "", title_en: (r.title_en as string) || "",
    label_uk: (r.label_uk as string) || "", label_ru: (r.label_ru as string) || "", label_en: (r.label_en as string) || "",
    sublabel_uk: (r.sublabel_uk as string) || "", sublabel_ru: (r.sublabel_ru as string) || "", sublabel_en: (r.sublabel_en as string) || "",
    description_uk: (r.description_uk as string) || "", description_ru: (r.description_ru as string) || "", description_en: (r.description_en as string) || "",
  }));

  return <CategoryForm category={cat as any} sections={sections} faq={faq} doctors={doctorRows as any} gallery={gallery} />;
}

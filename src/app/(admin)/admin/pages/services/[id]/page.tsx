import { sql } from "@/lib/db/client";
import { requireSession } from "../../../_actions/auth";
import { notFound } from "next/navigation";
import ServiceForm from "../../../services/_components/service-form";
import { getUiStringsTree } from "@/lib/db/queries/ui-strings";

/**
 * Canonical editor URL for service detail pages — /admin/pages/services/<id>.
 * Reuses the existing ServiceForm so the only thing that changed is the URL.
 */
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const rows = await sql`SELECT * FROM services WHERE id = ${id}`;
  if (!rows.length) notFound();

  const [categories, sectionRows, faqRows, doctorRows, serviceRows, equipmentRows, sdRows, srRows, seRows, uiTree] = await Promise.all([
    sql`SELECT id, title_uk, slug FROM service_categories ORDER BY sort_order`,
    sql`SELECT id, section_type, data, sort_order FROM content_sections WHERE owner_type = 'service' AND owner_id = ${id} ORDER BY sort_order`,
    sql`SELECT * FROM faq_items WHERE owner_type = 'service' AND owner_id = ${id} ORDER BY sort_order`,
    sql`SELECT id, name_uk, role_uk FROM doctors ORDER BY sort_order`,
    sql`SELECT s.id, s.title_uk, s.slug, c.title_uk AS cat_title FROM services s JOIN service_categories c ON s.category_id = c.id WHERE s.id != ${id} ORDER BY c.sort_order, s.sort_order`,
    sql`SELECT id, name, category FROM equipment ORDER BY sort_order`,
    sql`SELECT doctor_id FROM service_doctors WHERE service_id = ${id} ORDER BY sort_order`,
    sql`SELECT related_service_id FROM service_related WHERE service_id = ${id} ORDER BY sort_order`,
    sql`SELECT equipment_id FROM service_equipment WHERE service_id = ${id} ORDER BY sort_order`,
    getUiStringsTree(),
  ]);

  // Pull the UK global labels that ServiceDetailTemplate falls back to when
  // the per-service override is blank — surfaced as placeholders on the
  // Layout tab's heading-override inputs so the admin sees "what you'd get".
  const leafAll = (path: string[]): { uk: string; ru: string; en: string } => {
    let cur: any = uiTree;
    for (const p of path) { if (!cur || typeof cur !== "object") return { uk: "", ru: "", en: "" }; cur = cur[p]; }
    if (cur && typeof cur === "object") return { uk: cur.uk || "", ru: cur.ru || "", en: cur.en || "" };
    return { uk: "", ru: "", en: "" };
  };
  const mergeLeaf = (a: { uk: string; ru: string; en: string }, b: { uk: string; ru: string; en: string }) =>
    ({ uk: a.uk || b.uk, ru: a.ru || b.ru, en: a.en || b.en });
  const uiDefaults = {
    faq: leafAll(["labels", "faq"]),
    doctors: leafAll(["doctors", "title"]),
    equipment: mergeLeaf(leafAll(["equipment", "title"]), leafAll(["labels", "equipment"])),
    relatedServices: leafAll(["labels", "alsoInteresting"]),
    finalCTA: leafAll(["labels", "bookCta"]),
  };

  const sections = sectionRows.map((r) => ({
    id: r.id as string,
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

  const relations = {
    doctorIds: sdRows.map((r) => r.doctor_id as string),
    relatedServiceIds: srRows.map((r) => r.related_service_id as string),
    equipmentIds: seRows.map((r) => r.equipment_id as string),
  };

  return (
    <ServiceForm
      service={rows[0]}
      categories={categories as any}
      sections={sections}
      faq={faq}
      relations={relations}
      doctors={doctorRows as any}
      allServices={serviceRows as any}
      equipment={equipmentRows as any}
      uiDefaults={uiDefaults}
    />
  );
}

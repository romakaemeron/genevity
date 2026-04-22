import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { notFound } from "next/navigation";
import { getUiStringsNamespace } from "@/lib/db/queries";
import PageForm from "../_components/page-form";
import type { PriceCategory } from "../../_components/prices-editor";
import type { LabServiceInput, LabPrepStepInput, LabCheckupInput } from "../../_components/lab-editor";

export default async function EditStaticPagePage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSession();
  const { slug } = await params;

  if (slug === "new") {
    return <PageForm />;
  }

  const rows = await sql`SELECT * FROM static_pages WHERE slug = ${slug}`;
  if (!rows.length) notFound();

  const page = rows[0];

  const textNamespaceMap: Record<string, string> = {
    stationary: "stationaryPage",
    laboratory: "laboratoryPage",
    about: "aboutPage",
    contacts: "contactsPage",
    doctors: "doctorsPage",
    prices: "pricesPage",
  };
  const textNamespace = textNamespaceMap[slug] || null;
  const galleryOwnerKey: string | null = ["stationary", "about", "laboratory"].includes(slug) ? slug : null;
  const isLaboratory = slug === "laboratory";
  const isPrices = slug === "prices";
  const isContacts = slug === "contacts";
  const isAbout = slug === "about";
  const isHome = slug === "home";

  // The homepage is a composite of many sections, each with its own ui_strings
  // namespace. Rather than shoehorn it into the generic per-page editor, we
  // fetch all of them here and render a stack of NamespaceTextsEditor blocks.
  const HOME_NAMESPACES: Array<{ key: string; label: string; description?: string }> = [
    { key: "homeHero", label: "Hero", description: "Eyebrow, title, subtitle, and CTA of the hero block." },
    { key: "aboutSlideshow", label: "About slideshow", description: "Five slides of the About section slideshow." },
    { key: "advantages", label: "Advantages", description: "Our advantages grid (team, equipment, laboratory, stationary, longevity)." },
    { key: "equipment", label: "Equipment section", description: "Headings and labels for the Equipment block." },
    { key: "doctors", label: "Doctors section", description: "Doctors block headings and CTA." },
    { key: "homeFaq", label: "Homepage FAQ", description: "Questions and answers of the FAQ block." },
    { key: "contacts", label: "Contacts section", description: "Headings and labels for the contacts block." },
    { key: "labels", label: "Shared labels", description: "Common labels used across the homepage (Book now, Learn more, etc.)." },
  ];

  const [
    sectionRows, faqRows, doctorRows, pageMetaTexts, pageTexts,
    aboutRows, galleryRows, siteSettingsRows,
    priceCatRows, priceItemRows,
    labSvcRows, labPrepRows, labChkRows,
    heroSlidesRows, heroSingletonRows,
    homeNsPayloads,
  ] = await Promise.all([
    sql`SELECT id, section_type, data, sort_order FROM content_sections WHERE owner_type = 'static_page' AND owner_id = ${page.id} ORDER BY sort_order`,
    sql`SELECT * FROM faq_items WHERE owner_type = 'static_page' AND owner_id = ${page.id} ORDER BY sort_order`,
    sql`SELECT id, name_uk, role_uk FROM doctors ORDER BY sort_order`,
    getUiStringsNamespace("pageMeta").then((tree) => (tree[slug] || null) as Record<string, unknown> | null),
    textNamespace ? getUiStringsNamespace(textNamespace) : Promise.resolve(null),
    isHome || isAbout ? sql`SELECT * FROM about WHERE id = 1` : Promise.resolve([]),
    galleryOwnerKey ? sql`SELECT * FROM gallery_items WHERE owner_key = ${galleryOwnerKey} ORDER BY sort_order` : Promise.resolve([]),
    isContacts || isHome ? sql`SELECT * FROM site_settings WHERE id = 1` : Promise.resolve([]),
    isPrices ? sql`SELECT * FROM price_categories ORDER BY sort_order` : Promise.resolve([]),
    isPrices ? sql`SELECT * FROM price_items ORDER BY sort_order` : Promise.resolve([]),
    isLaboratory ? sql`SELECT * FROM lab_services ORDER BY sort_order` : Promise.resolve([]),
    isLaboratory ? sql`SELECT * FROM lab_prep_steps ORDER BY sort_order` : Promise.resolve([]),
    isLaboratory ? sql`SELECT * FROM lab_checkups ORDER BY sort_order` : Promise.resolve([]),
    isHome ? sql`SELECT * FROM hero_slides ORDER BY sort_order` : Promise.resolve([]),
    isHome ? sql`SELECT * FROM hero WHERE id = 1` : Promise.resolve([]),
    isHome
      ? Promise.all(HOME_NAMESPACES.map(async (n) => ({
          key: n.key,
          label: n.label,
          description: n.description,
          initial: (await getUiStringsNamespace(n.key)) as Record<string, unknown>,
        })))
      : Promise.resolve([]),
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

  const aboutSingleton = (aboutRows as any[])[0] || null;
  const siteSettings = (siteSettingsRows as any[])[0] || null;

  const gallery = (galleryRows as any[]).map((r) => ({
    id: r.id as string,
    image_url: (r.image_url as string) || "",
    alt_uk: (r.alt_uk as string) || "", alt_ru: (r.alt_ru as string) || "", alt_en: (r.alt_en as string) || "",
    label_uk: (r.label_uk as string) || "", label_ru: (r.label_ru as string) || "", label_en: (r.label_en as string) || "",
    sublabel_uk: (r.sublabel_uk as string) || "", sublabel_ru: (r.sublabel_ru as string) || "", sublabel_en: (r.sublabel_en as string) || "",
    description_uk: (r.description_uk as string) || "", description_ru: (r.description_ru as string) || "", description_en: (r.description_en as string) || "",
  }));

  const priceCategories: PriceCategory[] | null = isPrices
    ? (priceCatRows as any[]).map((c) => ({
        id: c.id as string,
        slug: c.slug as string,
        label_uk: (c.label_uk as string) || "",
        label_ru: (c.label_ru as string) || "",
        label_en: (c.label_en as string) || "",
        link: (c.link as string) || null,
        items: (priceItemRows as any[])
          .filter((it) => it.category_id === c.id)
          .map((it) => ({
            id: it.id as string,
            name_uk: (it.name_uk as string) || "",
            name_ru: (it.name_ru as string) || "",
            name_en: (it.name_en as string) || "",
            price: (it.price as string) || "",
          })),
      }))
    : null;

  const labServices: LabServiceInput[] | null = isLaboratory
    ? (labSvcRows as any[]).map((r) => ({
        id: r.id as string,
        icon_key: (r.icon_key as string) || "Scan",
        label_uk: (r.label_uk as string) || "", label_ru: (r.label_ru as string) || "", label_en: (r.label_en as string) || "",
        items_uk: (r.items_uk as string[]) || [], items_ru: (r.items_ru as string[]) || [], items_en: (r.items_en as string[]) || [],
        price_uk: (r.price_uk as string) || "", price_ru: (r.price_ru as string) || "", price_en: (r.price_en as string) || "",
      }))
    : null;

  const labPrepSteps: LabPrepStepInput[] | null = isLaboratory
    ? (labPrepRows as any[]).map((r) => ({
        id: r.id as string,
        icon_key: (r.icon_key as string) || "Clock",
        label_uk: (r.label_uk as string) || "", label_ru: (r.label_ru as string) || "", label_en: (r.label_en as string) || "",
        desc_uk: (r.desc_uk as string) || "", desc_ru: (r.desc_ru as string) || "", desc_en: (r.desc_en as string) || "",
      }))
    : null;

  const labCheckups: LabCheckupInput[] | null = isLaboratory
    ? (labChkRows as any[]).map((r) => ({
        id: r.id as string,
        label_uk: (r.label_uk as string) || "", label_ru: (r.label_ru as string) || "", label_en: (r.label_en as string) || "",
        price_uk: (r.price_uk as string) || "", price_ru: (r.price_ru as string) || "", price_en: (r.price_en as string) || "",
        desc_uk: (r.desc_uk as string) || "", desc_ru: (r.desc_ru as string) || "", desc_en: (r.desc_en as string) || "",
      }))
    : null;

  const heroSlides = (heroSlidesRows as any[]).map((r) => ({
    id: r.id as string,
    image_url: (r.image_url as string) || "",
    object_position: (r.object_position as string) || "center center",
    alt_uk: (r.alt_uk as string) || "",
    alt_ru: (r.alt_ru as string) || "",
    alt_en: (r.alt_en as string) || "",
  }));

  return (
    <PageForm
      page={page as any}
      sections={sections}
      faq={faq}
      doctors={doctorRows as any}
      textNamespace={textNamespace}
      pageTexts={pageTexts}
      pageMetaTexts={pageMetaTexts}
      pageSlug={slug}
      aboutSingleton={aboutSingleton}
      gallery={gallery}
      galleryOwnerKey={galleryOwnerKey}
      priceCategories={priceCategories}
      labServices={labServices}
      labPrepSteps={labPrepSteps}
      labCheckups={labCheckups}
      siteSettings={siteSettings}
      isHome={isHome}
      heroSlides={isHome ? heroSlides : undefined}
      heroSingleton={isHome ? ((heroSingletonRows as any[])[0] || null) : undefined}
      homeNamespaces={isHome ? (homeNsPayloads as any) : undefined}
    />
  );
}

import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { getUiStringsNamespace, getUiStringsTree } from "@/lib/db/queries";
import PricesEditor, { type PriceCategory } from "../_components/prices-editor";
import NamespaceTextsEditor from "../_components/namespace-texts-editor";
import { AdminPageHeader, AdminSectionHeading } from "../_components/admin-list";

export default async function PricingAdminPage() {
  await requireSession();
  const [catRows, itemRows, pageTexts, fullTree] = await Promise.all([
    sql`SELECT * FROM price_categories ORDER BY sort_order`,
    sql`SELECT * FROM price_items ORDER BY sort_order`,
    getUiStringsNamespace("pricesPage"),
    getUiStringsTree(),
  ]);

  const pricesMetaTexts = ((fullTree.pageMeta as Record<string, unknown>)?.prices || {}) as Record<string, unknown>;

  const cats: PriceCategory[] = catRows.map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    label_uk: (c.label_uk as string) || "",
    label_ru: (c.label_ru as string) || "",
    label_en: (c.label_en as string) || "",
    link: (c.link as string) || null,
    items: itemRows
      .filter((it) => it.category_id === c.id)
      .map((it) => ({
        id: it.id as string,
        name_uk: (it.name_uk as string) || "",
        name_ru: (it.name_ru as string) || "",
        name_en: (it.name_en as string) || "",
        price: (it.price as string) || "",
      })),
  }));

  return (
    <div className="p-8 flex flex-col gap-10">
      <AdminPageHeader title="Price List" subtitle="Categories and items shown on the /prices page." />

      <PricesEditor initial={cats} />

      <div>
        <AdminSectionHeading>Page texts</AdminSectionHeading>
        <p className="body-m text-muted">Headings, subtitles, and descriptive lines shown on /prices.</p>
      </div>
      <NamespaceTextsEditor namespace="pricesPage" initial={pageTexts} />

      <div>
        <AdminSectionHeading>SEO meta</AdminSectionHeading>
        <p className="body-m text-muted">Browser title and meta description for the /prices page.</p>
      </div>
      <NamespaceTextsEditor namespace="pageMeta.prices" initial={pricesMetaTexts} />
    </div>
  );
}

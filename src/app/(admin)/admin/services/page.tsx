import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { Plus } from "lucide-react";
import { AdminPageHeader, AdminPrimaryButton, AdminList, AdminListItem } from "../_components/admin-list";
import { getAdminStrings } from "../_i18n/server";

/**
 * Flat roster of every service, grouped only as "all services" with the
 * category shown inline per row. Clicking a service opens its full editor at
 * /admin/pages/services/<id> where Content / SEO / Sections / FAQ / Relations
 * live. Category editing happens on its own page from /admin/pages.
 */
export default async function ServicesListPage() {
  await requireSession();
  const t = await getAdminStrings();

  const services = await sql`
    SELECT s.id, s.slug, s.title_uk, s.price_from_uk,
           c.slug AS cat_slug, c.title_uk AS cat_title
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    ORDER BY c.sort_order, s.sort_order, s.title_uk
  `;

  return (
    <div className="p-8">
      <AdminPageHeader
        title={t.servicesPage.title}
        subtitle={t.servicesPage.subtitle(services.length)}
        actions={<AdminPrimaryButton href="/admin/services/new"><Plus size={16} /> {t.servicesPage.addNew}</AdminPrimaryButton>}
      />

      <AdminList empty={t.servicesPage.noServices}>
        {services.map((svc: any) => (
          <AdminListItem
            key={svc.id}
            href={`/admin/services/${svc.id}`}
            title={svc.title_uk}
            subtitle={`/services/${svc.cat_slug}/${svc.slug}`}
            badge={
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{svc.cat_title}</span>
                {svc.price_from_uk && <span className="text-xs text-main">{svc.price_from_uk}</span>}
              </div>
            }
          />
        ))}
      </AdminList>
    </div>
  );
}

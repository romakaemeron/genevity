import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { Plus } from "lucide-react";
import {
  AdminPageHeader, AdminPrimaryButton, AdminSecondaryButton,
  AdminSectionHeading, AdminList, AdminListItem,
} from "../_components/admin-list";

/**
 * Unified "Pages" hub — one index that lists every public-facing URL on the
 * website and deep-links to its dedicated editor, so admins always know where
 * to go to change anything visible on the site.
 *
 * Each section reads from the table that owns that URL:
 *   - Static Pages          → /admin/pages/<slug>
 *   - Service Category hubs → /admin/categories/<id>
 *   - Service detail pages  → /admin/services/<id>
 *   - Doctor list page      → /admin/pages/doctors (list) + /admin/doctors (roster)
 *   - Legal documents       → /admin/legal/<slug>
 *   - Blog posts            → placeholder (v2)
 */
export default async function PagesHub() {
  await requireSession();

  const [staticPages, categories, services, doctors, legalDocs] = await Promise.all([
    sql`SELECT * FROM static_pages ORDER BY
          CASE slug
            WHEN 'home' THEN 0
            WHEN 'about' THEN 1
            WHEN 'services' THEN 2
            WHEN 'prices' THEN 3
            WHEN 'doctors' THEN 4
            WHEN 'stationary' THEN 5
            WHEN 'laboratory' THEN 6
            WHEN 'contacts' THEN 7
            ELSE 99
          END, slug`,
    sql`SELECT c.*, (SELECT count(*) FROM services WHERE category_id = c.id) AS service_count
        FROM service_categories c ORDER BY c.sort_order`,
    sql`SELECT s.*, c.slug AS cat_slug, c.title_uk AS cat_title
        FROM services s JOIN service_categories c ON s.category_id = c.id
        ORDER BY c.sort_order, s.sort_order`,
    sql`SELECT count(*) AS total FROM doctors`,
    sql`SELECT * FROM legal_docs ORDER BY sort_order`,
  ]);

  const doctorCount = Number(doctors[0]?.total ?? 0);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Pages"
        subtitle="Every public URL on the site — click a row to edit its content, text, images, and SEO."
        actions={
          <>
            <AdminSecondaryButton href="/admin/legal/new"><Plus size={16} /> Add Legal Doc</AdminSecondaryButton>
            <AdminPrimaryButton href="/admin/pages/new"><Plus size={16} /> Add Custom Page</AdminPrimaryButton>
          </>
        }
      />

      {/* ─── Static pages ─── */}
      <AdminSectionHeading>Static pages</AdminSectionHeading>
      <div className="mb-10">
        <AdminList empty="No static pages yet">
          {staticPages.map((page) => (
            <AdminListItem
              key={page.id}
              href={`/admin/pages/${page.slug}`}
              title={page.title_uk || page.slug}
              subtitle={page.slug === "home" ? "/" : `/${page.slug}`}
            />
          ))}
        </AdminList>
      </div>

      {/* ─── Service category hubs ─── */}
      <AdminSectionHeading>Service category pages</AdminSectionHeading>
      <p className="text-xs text-muted mb-3">
        Landing pages under <code className="font-mono">/services/&lt;category&gt;</code> — each one describes a treatment category.
      </p>
      <div className="mb-10">
        <AdminList empty="No categories yet">
          {categories.map((cat) => (
            <AdminListItem
              key={cat.id}
              href={`/admin/pages/categories/${cat.id}`}
              title={cat.title_uk}
              subtitle={`/services/${cat.slug}`}
              badge={<span className="text-xs text-muted">{Number(cat.service_count)} services</span>}
            />
          ))}
        </AdminList>
      </div>

      {/* ─── Individual service detail pages, grouped by category ─── */}
      <AdminSectionHeading>Service detail pages</AdminSectionHeading>
      <p className="text-xs text-muted mb-3">
        One URL per treatment at <code className="font-mono">/services/&lt;category&gt;/&lt;slug&gt;</code>.
      </p>
      <div className="mb-10 flex flex-col gap-6">
        {categories.map((cat) => {
          const items = (services as any[]).filter((s) => s.category_id === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id}>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">{cat.title_uk}</h3>
              <AdminList>
                {items.map((svc) => (
                  <AdminListItem
                    key={svc.id}
                    href={`/admin/pages/services/${svc.id}`}
                    title={svc.title_uk}
                    subtitle={`/services/${cat.slug}/${svc.slug}`}
                    badge={svc.price_from_uk ? <span className="text-xs text-main">{svc.price_from_uk}</span> : undefined}
                  />
                ))}
              </AdminList>
            </div>
          );
        })}
      </div>

      {/* ─── Doctors — the only dynamic entity without detail URLs (yet) ─── */}
      <AdminSectionHeading>Doctors</AdminSectionHeading>
      <p className="text-xs text-muted mb-3">
        Individual doctor cards rendered on <code className="font-mono">/doctors</code> (each opens a modal, not a dedicated page).
      </p>
      <div className="mb-10">
        <AdminList>
          <AdminListItem
            href="/admin/doctors"
            title="Doctor roster"
            subtitle="Manage photos, names, roles, experience — one entry per doctor"
            badge={<span className="text-xs text-muted">{doctorCount} doctors</span>}
          />
        </AdminList>
      </div>

      {/* ─── Legal pages ─── */}
      <AdminSectionHeading>Legal documents</AdminSectionHeading>
      <div className="mb-10">
        <AdminList empty="No legal documents yet">
          {legalDocs.map((doc) => (
            <AdminListItem
              key={doc.id}
              href={`/admin/legal/${doc.slug}`}
              title={doc.title_uk}
              subtitle={`/legal/${doc.slug}`}
            />
          ))}
        </AdminList>
      </div>

      {/* ─── Blog — placeholder for v2 ─── */}
      <AdminSectionHeading>Blog posts</AdminSectionHeading>
      <p className="text-xs text-muted mb-3">
        Content publishing for <code className="font-mono">/blog</code> is planned for v2.
      </p>
      <div className="bg-champagne-dark rounded-2xl p-8 text-center text-sm text-muted italic">
        Blog posts, categories, and per-article SEO will appear here once v2 ships.
      </div>
    </div>
  );
}

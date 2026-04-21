import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";

export default async function ServicesListPage() {
  await requireSession();

  const categories = await sql`SELECT * FROM service_categories ORDER BY sort_order`;
  const services = await sql`SELECT s.*, c.slug AS cat_slug, c.title_uk AS cat_title FROM services s JOIN service_categories c ON s.category_id = c.id ORDER BY c.sort_order, s.sort_order`;

  // Group by category
  const grouped = categories.map((cat: any) => ({
    ...cat,
    services: services.filter((s: any) => s.category_id === cat.id),
  }));

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-2 text-ink">Services</h1>
          <p className="body-m text-muted mt-1">{services.length} services in {categories.length} categories</p>
        </div>
        <Link href="/services/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors">
          <Plus size={16} /> Add Service
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {grouped.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-line overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-champagne/30">
              <div>
                <h2 className="font-heading text-lg text-ink">{cat.title_uk}</h2>
                <p className="text-xs text-muted">{cat.slug} · {cat.services.length} services</p>
              </div>
              <Link href={`/categories/${cat.id}`} className="text-xs text-main hover:text-main-dark transition-colors flex items-center gap-1">
                Edit category <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-line">
              {cat.services.map((svc: any) => (
                <Link key={svc.id} href={`/services/${svc.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-champagne/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{svc.title_uk}</p>
                    <p className="text-xs text-muted truncate">{svc.slug}</p>
                  </div>
                  {svc.price_from_uk && (
                    <span className="text-xs text-main shrink-0">{svc.price_from_uk}</span>
                  )}
                  <ChevronRight size={14} className="text-muted shrink-0" />
                </Link>
              ))}
              {cat.services.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-muted">No services yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

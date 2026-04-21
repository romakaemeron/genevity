import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function CategoriesPage() {
  await requireSession();
  const categories = await sql`
    SELECT c.*, (SELECT count(*) FROM services WHERE category_id = c.id) AS service_count
    FROM service_categories c ORDER BY c.sort_order
  `;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="heading-2 text-ink mb-8">Service Categories</h1>
      <div className="bg-white rounded-2xl border border-line overflow-hidden divide-y divide-line">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-champagne/30 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{cat.title_uk}</p>
              <p className="text-xs text-muted">{cat.slug} · {cat.service_count} services</p>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}

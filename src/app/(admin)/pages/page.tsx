import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function StaticPagesPage() {
  await requireSession();
  const pages = await sql`SELECT * FROM static_pages ORDER BY slug`;
  const legalDocs = await sql`SELECT * FROM legal_docs ORDER BY sort_order`;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="heading-2 text-ink mb-8">Pages</h1>

      <h2 className="font-heading text-lg text-ink mb-3">Static Pages</h2>
      <div className="bg-white rounded-2xl border border-line overflow-hidden divide-y divide-line mb-8">
        {pages.length === 0 && <div className="px-6 py-8 text-center text-sm text-muted">No static pages yet</div>}
        {pages.map((page) => (
          <Link key={page.id} href={`/pages/${page.slug}`} className="flex items-center gap-4 px-6 py-4 hover:bg-champagne/30 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{page.title_uk || page.slug}</p>
              <p className="text-xs text-muted">/{page.slug}</p>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </Link>
        ))}
      </div>

      <h2 className="font-heading text-lg text-ink mb-3">Legal Documents</h2>
      <div className="bg-white rounded-2xl border border-line overflow-hidden divide-y divide-line">
        {legalDocs.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{doc.title_uk}</p>
              <p className="text-xs text-muted">/{doc.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

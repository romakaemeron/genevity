import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import HomepageForm from "./_components/homepage-form";
import { ArrowUpRight } from "lucide-react";

export default async function HomepageSettingsPage() {
  await requireSession();
  const [heroRows, aboutRows] = await Promise.all([
    sql`SELECT * FROM hero WHERE id = 1`,
    sql`SELECT * FROM about WHERE id = 1`,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <HomepageForm hero={heroRows[0] || {}} about={aboutRows[0] || {}} />

      <div className="px-8 pb-8">
        <a
          href="/admin/pages/home"
          className="flex items-center gap-3 p-5 rounded-2xl border border-line bg-champagne-dark hover:bg-champagne transition-colors group"
        >
          <div className="flex-1">
            <p className="body-strong text-ink">Homepage texts — advantages, FAQ, section headings</p>
            <p className="body-m text-muted mt-0.5">
              Edit all labels, questions, and body copy for the homepage sections.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-muted group-hover:text-ink transition-colors shrink-0" />
        </a>
      </div>
    </div>
  );
}

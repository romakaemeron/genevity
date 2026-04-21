import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteSettingsForm from "./_components/site-settings-form";

export default async function SettingsPage() {
  await requireSession();
  const rows = await sql`SELECT * FROM site_settings WHERE id = 1`;
  const settings = rows[0] || {};

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="heading-2 text-ink mb-8">Settings</h1>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <Link href="/settings/homepage" className="bg-white rounded-xl border border-line p-4 hover:border-main/30 transition-colors flex items-center justify-between">
          <div><p className="text-sm font-medium text-ink">Homepage</p><p className="text-xs text-muted">Hero, About section</p></div>
          <ChevronRight size={14} className="text-muted" />
        </Link>
        <Link href="/settings/navigation" className="bg-white rounded-xl border border-line p-4 hover:border-main/30 transition-colors flex items-center justify-between">
          <div><p className="text-sm font-medium text-ink">Navigation</p><p className="text-xs text-muted">Menu items, CTA</p></div>
          <ChevronRight size={14} className="text-muted" />
        </Link>
      </div>

      <h2 className="font-heading text-lg text-ink mb-4">General Settings</h2>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}

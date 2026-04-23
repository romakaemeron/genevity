import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import SiteSettingsForm from "./_components/site-settings-form";
import {
  AdminPageHeader, AdminSectionHeading, AdminList, AdminListItem,
} from "../_components/admin-list";

export default async function SettingsPage() {
  await requireSession();
  const rows = await sql`SELECT * FROM site_settings WHERE id = 1`;
  const settings = rows[0] || {};

  return (
    <div className="p-8">
      <AdminPageHeader title="Settings" />

      <AdminSectionHeading>Configuration</AdminSectionHeading>
      <div className="mb-10">
        <AdminList>
          <AdminListItem
            href="/admin/settings/homepage"
            title="Homepage"
            subtitle="Hero, About section, advantages, FAQ"
          />
          <AdminListItem
            href="/admin/settings/navigation"
            title="Navigation"
            subtitle="Menu items, CTA"
          />
          <AdminListItem
            href="/admin/settings/ui-strings"
            title="UI Strings"
            subtitle="All labels, headings, CTAs"
          />
          <AdminListItem
            href="/admin/settings/cta"
            title="Booking CTAs"
            subtitle="Per-location overrides for every booking button"
          />
          <AdminListItem
            href="/admin/settings/hero-slides"
            title="Hero Slides"
            subtitle="Homepage slideshow images"
          />
          <AdminListItem
            href="/admin/settings/galleries"
            title="Galleries"
            subtitle="Stripe galleries per page"
          />
        </AdminList>
      </div>

      <AdminSectionHeading>General Settings</AdminSectionHeading>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}

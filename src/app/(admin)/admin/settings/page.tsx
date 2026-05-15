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
      <AdminPageHeader
        title="Settings"
        subtitle="Global site configuration — contact info, booking texts, navigation, and footer."
      />

      <AdminSectionHeading>General</AdminSectionHeading>
      <div className="mb-10">
        <SiteSettingsForm settings={settings} />
      </div>

      <AdminSectionHeading>Global Texts</AdminSectionHeading>
      <div className="mb-10">
        <AdminList>
          <AdminListItem
            href="/admin/settings/ui-strings"
            title="Footer & Labels"
            subtitle="Footer links and booking form default labels"
          />
          <AdminListItem
            href="/admin/settings/cta"
            title="Booking CTAs"
            subtitle="Per-location button text, modal title, and submit label overrides"
          />
          <AdminListItem
            href="/admin/settings/navigation"
            title="Navigation"
            subtitle="Menu items and navigation CTA"
          />
        </AdminList>
      </div>
    </div>
  );
}

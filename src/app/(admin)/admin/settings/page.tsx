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
        subtitle="Site-wide configuration — contact info, navigation, booking, and global labels."
      />

      <AdminSectionHeading>General</AdminSectionHeading>
      <div className="mb-10">
        <SiteSettingsForm settings={settings} />
      </div>

      <AdminSectionHeading>Content</AdminSectionHeading>
      <div className="mb-10">
        <AdminList>
          <AdminListItem
            href="/admin/settings/homepage"
            title="Homepage"
            subtitle="Hero title, subtitle, CTA button, and about section copy"
          />
          <AdminListItem
            href="/admin/settings/hero-slides"
            title="Hero slides"
            subtitle="Homepage rotating slideshow images and alt text"
          />
          <AdminListItem
            href="/admin/settings/galleries"
            title="Galleries"
            subtitle="Stripe galleries on the stationary, about, and homepage bento"
          />
          <AdminListItem
            href="/admin/settings/ui-strings"
            title="Footer & Labels"
            subtitle="Footer links and booking form default labels"
          />
          <AdminListItem
            href="/admin/pages"
            title="Page content"
            subtitle="All static pages, service pages, and their section texts — edit each page directly"
            badge={<span className="text-xs text-main font-medium">Pages →</span>}
          />
        </AdminList>
      </div>

      <AdminSectionHeading>Booking & Navigation</AdminSectionHeading>
      <div className="mb-10">
        <AdminList>
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

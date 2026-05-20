import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import SiteSettingsForm from "./_components/site-settings-form";
import {
  AdminPageHeader, AdminSectionHeading, AdminList, AdminListItem,
} from "../_components/admin-list";
import { getAdminStrings } from "../_i18n/server";

export default async function SettingsPage() {
  await requireSession();
  const [rows, t] = await Promise.all([
    sql`SELECT * FROM site_settings WHERE id = 1`,
    getAdminStrings(),
  ]);
  const settings = rows[0] || {};

  return (
    <div className="p-8">
      <AdminPageHeader
        title={t.settingsPage.title}
        subtitle={t.settingsPage.subtitle}
      />

      <AdminSectionHeading>{t.settingsPage.homepage}</AdminSectionHeading>
      <div className="mb-10">
        <AdminList>
          <AdminListItem
            href="/admin/settings/hero-slides"
            title={t.settingsPage.heroSlides}
            subtitle={t.settingsPage.heroSlidesDesc}
          />
          <AdminListItem
            href="/admin/settings/homepage"
            title={t.settingsPage.homepage}
            subtitle={t.settingsPage.homepageDesc}
          />
          <AdminListItem
            href="/admin/settings/galleries"
            title={t.settingsPage.galleries}
            subtitle={t.settingsPage.galleriesDesc}
          />
        </AdminList>
      </div>

      <AdminSectionHeading>{t.common.edit}</AdminSectionHeading>
      <div className="mb-10">
        <SiteSettingsForm settings={settings} />
      </div>

      <AdminSectionHeading>{t.settingsPage.uiStrings}</AdminSectionHeading>
      <div className="mb-10">
        <AdminList>
          <AdminListItem
            href="/admin/settings/navigation"
            title={t.settingsPage.navigation}
            subtitle={t.settingsPage.navigationDesc}
          />
          <AdminListItem
            href="/admin/settings/ui-strings"
            title={t.settingsPage.uiStrings}
            subtitle={t.settingsPage.uiStringsDesc}
          />
          <AdminListItem
            href="/admin/settings/cta"
            title={t.settingsPage.cta}
            subtitle={t.settingsPage.ctaDesc}
          />
        </AdminList>
      </div>
    </div>
  );
}

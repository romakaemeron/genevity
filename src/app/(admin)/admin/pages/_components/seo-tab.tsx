"use client";

import { saveStaticPage } from "../../_actions/static-pages";
import type { LocaleKey } from "../../_components/translation-tabs";
import SeoFormTab from "../../_components/seo-form-tab";

interface Props {
  page: any;
}

/**
 * Thin adapter around the shared SeoFormTab — maps the static_pages row
 * to the generic component's props and round-trips every non-SEO column
 * so saveStaticPage doesn't null them when only this tab is submitted.
 */
export default function SeoTab({ page }: Props) {
  const hiddenFields: Record<string, string> = { slug: page.slug };
  for (const l of ["uk", "ru", "en"] as const) {
    hiddenFields[`title_${l}`] = page[`title_${l}`] || "";
    hiddenFields[`h1_${l}`] = page[`h1_${l}`] || "";
    hiddenFields[`summary_${l}`] = page[`summary_${l}`] || "";
  }

  const publicPathFor = (locale: LocaleKey) => {
    const base = page.slug === "home" ? "/" : `/${page.slug}`;
    if (locale === "uk") return base;
    return base === "/" ? `/${locale}` : `/${locale}${base}`;
  };

  return (
    <SeoFormTab
      entity={page}
      entityId={page.id}
      saveAction={saveStaticPage}
      label={page.title_uk || page.slug}
      publicPathFor={publicPathFor}
      hiddenFields={hiddenFields}
      fallbackTitleFor={(l) => page[`title_${l}`] || ""}
      fallbackDescFor={(l) => page[`summary_${l}`] || ""}
    />
  );
}

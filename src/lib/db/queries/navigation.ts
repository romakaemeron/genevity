import { sql } from "../client";
import type { NavigationData } from "../types";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

export async function getNavigation(locale: string): Promise<NavigationData> {
  const l = lang(locale);

  const [navRows, itemRows] = await Promise.all([
    sql`SELECT * FROM navigation WHERE id = 1`,
    sql`
      SELECT ni.*, c.slug AS category_slug
      FROM nav_items ni
      LEFT JOIN service_categories c ON ni.category_id = c.id
      ORDER BY ni.sort_order
    `,
  ]);

  const nav = navRows[0];

  return {
    items: itemRows.map((r) => ({
      label: pick(r, "label", l) || "",
      href: r.href,
      isMegaMenu: r.is_mega_menu || false,
      categorySlug: r.category_slug || null,
      order: r.sort_order || 0,
    })),
    cta: {
      label: nav ? pick(nav, "cta_label", l) || "" : "",
      href: nav?.cta_href || "",
    },
  };
}

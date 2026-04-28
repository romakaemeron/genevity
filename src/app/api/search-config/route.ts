import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getUiStringsNamespace } from "@/lib/db/queries/ui-strings";

export interface SearchConfig {
  popularTags: string[];
  categories: { slug: string; title: string }[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const locale = req.nextUrl.searchParams.get("locale") ?? "ua";
  const lang = (locale === "ua" ? "uk" : locale) as "uk" | "ru" | "en";

  const [searchNs, categoryRows] = await Promise.all([
    getUiStringsNamespace("search"),
    sql`
      SELECT slug, title_uk, title_ru, title_en
      FROM service_categories
      WHERE seo_noindex IS NOT TRUE
      ORDER BY sort_order
    `,
  ]);

  const tagsLeaf = (searchNs as Record<string, unknown>)?.popularTags as Record<string, string> | undefined;
  const rawTags = tagsLeaf?.[lang] ?? tagsLeaf?.uk ?? "";
  const popularTags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);

  const categories = (categoryRows as Record<string, unknown>[]).map((r) => ({
    slug: r.slug as string,
    title: (r[`title_${lang}`] ?? r.title_uk ?? "") as string,
  }));

  return NextResponse.json({ popularTags, categories } satisfies SearchConfig);
}

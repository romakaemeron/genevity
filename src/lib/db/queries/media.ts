import { sql } from "../client";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export type MediaMentionPublic = {
  id: string;
  url: string;
  publisherName: string;
  title: string;
  imageUrl: string | null;
  logo: string;
  publishedAt: string | null;
};

export type MediaMentionAdmin = {
  id: string;
  url: string;
  publisherName: string;
  publisherDomain: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string | null;
  logoUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type MediaMentionInput = {
  id?: string;
  url: string;
  publisherName: string;
  publisherDomain: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  imageUrl: string | null;
  logoUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export async function getMediaMentions(locale: string): Promise<MediaMentionPublic[]> {
  const l = lang(locale);
  const rows = await sql`
    SELECT id, url, publisher_name, publisher_domain,
      title_uk, title_ru, title_en, image_url, logo_url,
      published_at::text AS published_at
    FROM media_mentions
    WHERE is_published = true
    ORDER BY published_at DESC NULLS LAST, sort_order`;
  return rows.map((r) => ({
    id: r.id as string,
    url: r.url as string,
    publisherName: (r.publisher_name as string) || (r.publisher_domain as string),
    title: (r[`title_${l}`] as string) || (r.title_uk as string) || "",
    imageUrl: (r.image_url as string | null) || null,
    logo: (r.logo_url as string | null) || faviconUrl(r.publisher_domain as string),
    publishedAt: (r.published_at as string | null) || null,
  }));
}

export async function getMediaMentionCount(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS n FROM media_mentions`;
  return (rows[0]?.n as number) ?? 0;
}

function toAdmin(r: Record<string, unknown>): MediaMentionAdmin {
  return {
    id: r.id as string,
    url: r.url as string,
    publisherName: r.publisher_name as string,
    publisherDomain: r.publisher_domain as string,
    titleUk: r.title_uk as string,
    titleRu: r.title_ru as string,
    titleEn: r.title_en as string,
    imageUrl: (r.image_url as string | null) || null,
    logoUrl: (r.logo_url as string | null) || null,
    publishedAt: (r.published_at as string | null) || null,
    sortOrder: r.sort_order as number,
    isPublished: r.is_published as boolean,
  };
}

export async function adminGetAllMentions(): Promise<MediaMentionAdmin[]> {
  const rows = await sql`
    SELECT *, media_mentions.published_at::text AS published_at FROM media_mentions
    ORDER BY media_mentions.published_at DESC NULLS LAST, sort_order`;
  return rows.map(toAdmin);
}

export async function adminGetMentionById(id: string): Promise<MediaMentionAdmin | null> {
  const rows = await sql`
    SELECT *, published_at::text AS published_at
    FROM media_mentions WHERE id = ${id} LIMIT 1`;
  return rows.length ? toAdmin(rows[0]) : null;
}

export async function adminSaveMention(d: MediaMentionInput): Promise<string> {
  if (d.id) {
    await sql`
      UPDATE media_mentions SET
        url=${d.url}, publisher_name=${d.publisherName}, publisher_domain=${d.publisherDomain},
        title_uk=${d.titleUk}, title_ru=${d.titleRu}, title_en=${d.titleEn},
        image_url=${d.imageUrl}, logo_url=${d.logoUrl},
        published_at=${d.publishedAt ? sql`${d.publishedAt}::date` : sql`NULL`},
        sort_order=${d.sortOrder}, is_published=${d.isPublished}
      WHERE id=${d.id}`;
    return d.id;
  }
  const rows = await sql`
    INSERT INTO media_mentions
      (url, publisher_name, publisher_domain, title_uk, title_ru, title_en,
       image_url, logo_url, published_at, sort_order, is_published)
    VALUES
      (${d.url}, ${d.publisherName}, ${d.publisherDomain}, ${d.titleUk}, ${d.titleRu}, ${d.titleEn},
       ${d.imageUrl}, ${d.logoUrl},
       ${d.publishedAt ? sql`${d.publishedAt}::date` : sql`NULL`},
       ${d.sortOrder}, ${d.isPublished})
    RETURNING id`;
  return rows[0].id as string;
}

export async function adminDeleteMention(id: string): Promise<void> {
  await sql`DELETE FROM media_mentions WHERE id = ${id}`;
}

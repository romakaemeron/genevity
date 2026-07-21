export type MediaMeta = {
  publisher_name: string;
  publisher_domain: string;
  title_uk: string;
  image_url: string | null;
  published_at: string | null;
};

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function metaContent(html: string, ...keys: string[]): string | null {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i");
    const m = html.match(re) ||
      html.match(new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"));
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–");
}

/**
 * Best-effort Open Graph scrape for a press article. Never throws; returns a
 * partial MediaMeta (domain always set) so the admin can complete manually
 * when a site blocks server-side fetches (several Dnipro outlets return 403).
 */
export async function fetchMediaMeta(url: string): Promise<MediaMeta> {
  const publisher_domain = domainOf(url);
  const fallback: MediaMeta = {
    publisher_name: publisher_domain,
    publisher_domain,
    title_uk: "",
    image_url: null,
    published_at: null,
  };
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const rawTitle =
      metaContent(html, "og:title", "twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "";
    const rawPublisher =
      metaContent(html, "og:site_name") || publisher_domain;
    const image = metaContent(html, "og:image", "twitter:image");
    const date =
      metaContent(html, "article:published_time", "og:updated_time") || null;
    return {
      publisher_name: decodeEntities(rawPublisher).trim() || publisher_domain,
      publisher_domain,
      title_uk: decodeEntities(rawTitle).trim(),
      image_url: image ? (image.startsWith("http") ? image : null) : null,
      published_at: date ? date.slice(0, 10) : null,
    };
  } catch (e) {
    console.error("fetchMediaMeta failed:", e);
    return fallback;
  }
}

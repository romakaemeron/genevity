import { lookup } from "dns/promises";

export type MediaMeta = {
  publisher_name: string;
  publisher_domain: string;
  title_uk: string;
  image_url: string | null;
  published_at: string | null;
};

/** Lowercase a hostname and strip IPv6 brackets + a single trailing dot. */
function normHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

function domainOf(url: string): string {
  try { return normHost(new URL(url).hostname).replace(/^www\./, ""); } catch { return ""; }
}

/**
 * True if an IP-literal string falls in a non-public (blocked) range:
 * loopback, private, link-local, CGNAT, unique-local, or cloud metadata.
 */
function isBlockedIp(ip: string): boolean {
  const host = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (host.includes(":")) {
    // IPv6. Global unicast (routable) addresses are 2000::/3 — they start with
    // a hex digit, never "::". Anything beginning "::" is loopback (::1),
    // unspecified (::), or IPv4-mapped/compat (::ffff:127.0.0.1 → ::ffff:7f00:1)
    // — all non-public. Also block link-local (fe80) and unique-local (fc/fd).
    if (host.startsWith("::")) return true;
    if (host.startsWith("fe80") || host.startsWith("fc") || host.startsWith("fd")) return true;
    return false;
  }
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    if (a === 0 || a === 127 || a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;             // link-local + 169.254.169.254 metadata
    if (a === 100 && b >= 64 && b <= 127) return true;   // CGNAT (100.100.100.200 metadata)
    return false;
  }
  return false; // not an IP literal
}

/**
 * Statically validate a URL as a public http(s) endpoint: rejects non-http(s)
 * schemes, internal hostnames, and IP literals in blocked ranges. Does not
 * resolve DNS — pair with resolvesPublic() before fetching each hop.
 */
function parsePublicHttpUrl(raw: string): URL | null {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = normHost(u.hostname);
  if (!host) return null;
  if (host === "localhost" || host.endsWith(".localhost")) return null;
  if (host.endsWith(".local") || host.endsWith(".internal")) return null;
  const isIp = host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (isIp) return isBlockedIp(host) ? null : u;
  if (!host.includes(".")) return null; // bare internal hostname
  return u;
}

/**
 * Resolve the hostname and reject if ANY resolved address is in a blocked
 * range — defends against DNS rebinding (a public name pointing at an internal
 * IP). IP literals are checked directly. A residual TOCTOU remains (fetch
 * re-resolves), accepted as proportionate for this admin-gated helper.
 */
async function resolvesPublic(hostname: string): Promise<boolean> {
  const host = normHost(hostname);
  if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return !isBlockedIp(host);
  try {
    const addrs = await lookup(host, { all: true });
    return addrs.length > 0 && !addrs.some((a) => isBlockedIp(a.address));
  } catch { return false; }
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
 *
 * SSRF-hardened: only fetches public http(s) hosts, resolves DNS and blocks
 * internal addresses, and follows redirects manually (bounded, re-validating
 * every hop) so a public URL cannot bounce the request onto internal infra.
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
    let current = parsePublicHttpUrl(url);
    if (!current) return fallback;
    let res: Response | undefined;
    for (let hop = 0; hop < 5; hop++) {
      if (!(await resolvesPublic(current.hostname))) return fallback;
      const r = await fetch(current.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html",
        },
        redirect: "manual",
      });
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get("location");
        if (!loc) return fallback;
        let next: URL;
        try { next = new URL(loc, current); } catch { return fallback; }
        const validated = parsePublicHttpUrl(next.toString());
        if (!validated) return fallback;
        current = validated;
        continue;
      }
      res = r;
      break;
    }
    if (!res || !res.ok) return fallback;
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

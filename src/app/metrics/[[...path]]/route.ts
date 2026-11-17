import type { NextRequest } from "next/server";

/**
 * Google tag gateway for advertisers ("manual / other CDN" setup).
 *
 * GTM and the GA4/Ads hits it sends are served from our own domain under
 * /metrics/* and relayed to Google's per-tag endpoint, so ad blockers and
 * browser tracking protection treat them as first-party. The site is not
 * behind the Cloudflare proxy (Cloudflare only hosts DNS; traffic goes
 * straight to Vercel), so Google's one-click Cloudflare setup does not apply.
 *
 * Google requires the visitor's country/region on every request — without
 * them `/metrics/?validate_geo=healthy` answers 500. Vercel already geolocates
 * each request, so we pass its values through.
 *
 * Checks: /metrics/healthy and /metrics/?validate_geo=healthy both print "ok".
 * Docs: https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual
 */

const UPSTREAM = "https://gtm-pggk275d.fps.goog";
const MEASUREMENT_PATH = "/metrics";

// Only what the gateway needs goes upstream. Everything else — Authorization,
// the admin session cookie, preview-bypass cookies — must never reach Google.
const FORWARD_REQUEST_HEADERS = [
  "user-agent",
  "accept",
  "accept-language",
  "referer",
  "origin",
  "content-type",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
];
// Google's own first-party cookies (GA4, Ads, gateway FP* cookies).
const GOOGLE_COOKIE = /^(_ga|_gid|_gcl|_gac|FP[A-Z]+$)/;
// fetch() decodes the body, so the upstream encoding/length no longer apply.
const DROP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
]);

async function relay(request: NextRequest, path: string[] | undefined) {
  // `/metrics/` and `/metrics` both map to the upstream root, which Google
  // only serves with the trailing slash.
  const rest = path?.length ? path.map(encodeURIComponent).join("/") : "";
  const target = `${UPSTREAM}${MEASUREMENT_PATH}/${rest}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const googleCookies = request.cookies
    .getAll()
    .filter((c) => GOOGLE_COOKIE.test(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (googleCookies) headers.set("cookie", googleCookies);

  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  if (country) headers.set("X-Forwarded-Country", country);
  if (region) headers.set("X-Forwarded-Region", region);

  const clientIp = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) headers.set("X-Forwarded-For", clientIp);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!DROP_RESPONSE_HEADERS.has(key) && key !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });
  // Set-Cookie may repeat; forEach would merge them into one invalid header.
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Ctx = { params: Promise<{ path?: string[] }> };

async function handler(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return relay(request, path);
}

export const dynamic = "force-dynamic";
export { handler as GET, handler as POST, handler as HEAD, handler as OPTIONS };

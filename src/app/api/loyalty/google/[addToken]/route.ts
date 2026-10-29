import { getCardByAddToken } from "@/lib/db/queries/loyalty";
import { isWellFormedToken } from "@/lib/loyalty/tokens";
import { createSaveUrl, isGoogleConfigured } from "@/lib/loyalty/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = { "Cache-Control": "no-store" };
const text = (status: number, body: string) =>
  new Response(body, { status, headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" } });

/**
 * Mints the signed Google "save to wallet" link at click time (not at page
 * load) and redirects to it. The signed JWT therefore never appears in the
 * public add page's HTML.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ addToken: string }> }) {
  const { addToken } = await ctx.params;
  if (!isWellFormedToken(addToken)) return text(404, "Картку не знайдено");
  const card = await getCardByAddToken(addToken);
  if (!card) return text(404, "Картку не знайдено");
  if (card.status === "revoked") return text(410, "Картку скасовано");
  if (!isGoogleConfigured()) return text(503, "Додавання тимчасово недоступне");
  try {
    const url = await createSaveUrl(card);
    if (!url) return text(503, "Додавання тимчасово недоступне");
    return new Response(null, { status: 302, headers: { ...HEADERS, Location: url } });
  } catch (err) {
    // Never echo error text (may hold key material); log the error name only.
    console.error("google save url failed", err instanceof Error ? err.name : "unknown");
    return new Response(null, { status: 500, headers: HEADERS });
  }
}

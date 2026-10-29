import { getCardByAddToken } from "@/lib/db/queries/loyalty";
import { isWellFormedToken } from "@/lib/loyalty/tokens";
import { generatePkpass, isAppleConfigured } from "@/lib/loyalty/apple";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const plain = (status: number, body: string) =>
  new Response(body, { status, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });

export async function GET(_req: Request, ctx: { params: Promise<{ addToken: string }> }) {
  const { addToken } = await ctx.params;
  if (!isWellFormedToken(addToken)) return plain(404, "Картку не знайдено");
  const card = await getCardByAddToken(addToken);
  if (!card) return plain(404, "Картку не знайдено");
  if (card.status === "revoked") return plain(410, "Картку скасовано");
  if (!isAppleConfigured()) return plain(503, "Додавання тимчасово недоступне");
  try {
    const buf = await generatePkpass(card);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="genevity-friends.pkpass"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // Never echo error text (may contain file paths); log the error name only.
    console.error("pkpass generation failed", err instanceof Error ? err.name : "unknown");
    return plain(500, "Сталася помилка. Спробуйте пізніше.");
  }
}

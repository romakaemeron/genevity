import { getCardByAddToken } from "@/lib/db/queries/loyalty";
import { isWellFormedToken } from "@/lib/loyalty/tokens";
import { generatePkpass, isAppleConfigured } from "@/lib/loyalty/apple";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const plain = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(_req: Request, ctx: { params: Promise<{ addToken: string }> }) {
  const { addToken } = await ctx.params;
  if (!isWellFormedToken(addToken)) return plain(404);
  const card = await getCardByAddToken(addToken);
  if (!card) return plain(404);
  if (card.status === "revoked") return plain(410);
  if (!isAppleConfigured()) return plain(503);
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
  } catch {
    // Never echo error text: it can contain file paths.
    return plain(500);
  }
}

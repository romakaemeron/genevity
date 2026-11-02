import { getLatestPass } from "@/lib/loyalty/passkit-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ passTypeId: string; serial: string }> }) {
  return getLatestPass(req, await ctx.params);
}

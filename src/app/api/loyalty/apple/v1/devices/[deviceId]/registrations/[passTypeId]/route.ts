import { listUpdatedSerials } from "@/lib/loyalty/passkit-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ deviceId: string; passTypeId: string }> }) {
  return listUpdatedSerials(req, await ctx.params);
}

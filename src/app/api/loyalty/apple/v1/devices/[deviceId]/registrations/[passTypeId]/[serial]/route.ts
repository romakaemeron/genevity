import { registerDevice, unregisterDevice } from "@/lib/loyalty/passkit-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ deviceId: string; passTypeId: string; serial: string }> };

export async function POST(req: Request, ctx: Ctx) {
  return registerDevice(req, await ctx.params);
}

export async function DELETE(req: Request, ctx: Ctx) {
  return unregisterDevice(req, await ctx.params);
}

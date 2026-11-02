import { receiveLog } from "@/lib/loyalty/passkit-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  return receiveLog(req);
}

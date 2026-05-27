import { NextRequest, NextResponse } from "next/server";
import { confirmEscalation } from "@/lib/chat/session";

export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json();
    if (!sessionToken) return NextResponse.json({ error: "missing sessionToken" }, { status: 400 });
    await confirmEscalation(sessionToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[chat/confirm] failed:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

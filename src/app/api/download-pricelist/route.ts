import { sql } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`SELECT pricelist_pdf FROM site_settings WHERE id = 1`;
  const pdfUrl = rows[0]?.pricelist_pdf as string | null;

  if (!pdfUrl) return new NextResponse("Not found", { status: 404 });

  const upstream = await fetch(pdfUrl);
  if (!upstream.ok) return new NextResponse("Failed to fetch PDF", { status: 502 });

  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Genevity_Price_Catalog.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

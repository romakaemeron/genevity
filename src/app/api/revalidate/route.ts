import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

const LOCALES = ["", "/ru", "/en"] as const;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sanity-secret");

  if (process.env.SANITY_REVALIDATE_SECRET && secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      _type?: string;
      slug?: string;
      _id?: string;
    };

    const type = body._type || "";
    const slug = body.slug;
    const paths: string[] = [];

    paths.push("/");
    for (const locale of LOCALES) {
      paths.push(`${locale}/`);
    }

    switch (type) {
      case "service":
        if (slug) {
          // Look up the category slug so we can build exact paths
          const rows = await sql`
            SELECT sc.slug AS cat
            FROM services s
            JOIN service_categories sc ON sc.id = s.category_id
            WHERE s.slug = ${slug}
            LIMIT 1
          `;
          const cat = rows[0]?.cat ?? "[category]";
          for (const locale of LOCALES) {
            paths.push(`${locale}/services/${cat}/${slug}`);
          }
        }
        break;
      case "serviceCategory":
        if (slug) {
          for (const locale of LOCALES) {
            paths.push(`${locale}/services/${slug}`);
            paths.push(`${locale}/services`);
          }
        }
        break;
      case "staticPage":
        if (slug && slug !== "home") {
          for (const locale of LOCALES) {
            paths.push(`${locale}/${slug}`);
          }
        }
        break;
      case "doctor":
        for (const locale of LOCALES) {
          paths.push(`${locale}/doctors`);
        }
        break;
      case "priceItem":
      case "priceCategory":
        for (const locale of LOCALES) {
          paths.push(`${locale}/prices`);
        }
        break;
      case "navigation":
      case "siteSettings":
        for (const locale of LOCALES) {
          paths.push(`${locale}/`);
        }
        break;
    }

    for (const path of paths) {
      revalidatePath(path, "page");
    }

    return NextResponse.json({ revalidated: true, paths, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 },
    );
  }
}

import "server-only";

/**
 * Join RoApp's bookable specialists to the doctors on our site.
 *
 * RoApp is the source of truth for *who can be booked and when*; our CMS is the
 * source of truth for *how a doctor is presented* — photo, localized role, and
 * the link to their profile page. Matching the two lets the wizard show real
 * faces instead of initials.
 *
 * Name formats differ on both sides:
 *   RoApp  "Віктор Ігорович Бєлянушкін"   — Given Patronymic Surname
 *   CMS    "Бєлянушкін Віктор Ігорович"   — Surname Given Patronymic
 *
 * and patronymics are spelled differently between the Ukrainian and Russian
 * records ("Анжела Вячеславовна" vs "Анжела В'ячеславівна"), so the key is
 * surname + given name only. Falls back to a unique-surname match. At the time
 * of writing this resolves 8 of the 12 bookable specialists; the other 4 aren't
 * on the site yet and render with initials and RoApp's own job title, which is
 * a perfectly good degraded state.
 */

import { sql } from "@/lib/db/client";
import type { BookingDoctor, RoappEmployee } from "./types";

function lang(locale: string) {
  return locale === "ua" ? "uk" : locale;
}

const clean = (s: string) =>
  s.toLowerCase().replace(/[’'`ʼ]/g, "").replace(/\s+/g, " ").trim();

/** "Given Patronymic Surname" → "surname|given" */
function keyFromRoapp(name: string): string {
  const t = clean(name).split(" ");
  return `${t[t.length - 1]}|${t[0]}`;
}

/** "Surname Given Patronymic" → "surname|given" */
function keyFromCms(name: string): string {
  const t = clean(name).split(" ");
  return `${t[0]}|${t[1] ?? ""}`;
}

interface DoctorRow {
  slug: string | null;
  name: string;
  role: string;
  photo_circle: string | null;
  photo_card: string | null;
  circle_focal_point: string | null;
  card_position: string | null;
}

/**
 * Merge RoApp employees with CMS doctors, preserving RoApp's ordering (they
 * sort by name) and RoApp's `firstSlot`.
 */
export async function mergeDoctors(
  employees: RoappEmployee[],
  locale: string,
): Promise<BookingDoctor[]> {
  const l = lang(locale);
  let rows: DoctorRow[] = [];
  try {
    rows = (await sql`
      SELECT slug,
             name_uk, name_ru, name_en,
             role_uk, role_ru, role_en,
             photo_circle, photo_card, circle_focal_point, card_position
      FROM doctors
      WHERE is_published = true
    `) as unknown as DoctorRow[];
  } catch {
    // The wizard must still work if our own DB hiccups — RoApp has everything
    // needed to book; only the styling degrades.
    rows = [];
  }

  const pick = (r: Record<string, unknown>, field: string) =>
    ((r[`${field}_${l}`] ?? r[`${field}_uk`]) as string | null) || "";

  const exact = new Map<string, DoctorRow>();
  const bySurname = new Map<string, DoctorRow[]>();
  for (const r of rows) {
    const nameUk = (r as unknown as Record<string, string>).name_uk;
    if (!nameUk) continue;
    const key = keyFromCms(nameUk);
    exact.set(key, r);
    const surname = key.split("|")[0];
    bySurname.set(surname, [...(bySurname.get(surname) ?? []), r]);
  }

  return employees.map((e): BookingDoctor => {
    const key = keyFromRoapp(e.name);
    let match = exact.get(key);
    if (!match) {
      const candidates = bySurname.get(key.split("|")[0]);
      if (candidates?.length === 1) match = candidates[0];
    }
    const row = match as unknown as Record<string, unknown> | undefined;

    return {
      id: e.id,
      // Prefer our spelling — it's the one used everywhere else on the site.
      name: row ? pick(row, "name") || e.name : e.name,
      role: row ? pick(row, "role") || e.position : e.position,
      photo: match ? match.photo_circle || match.photo_card || null : null,
      photoFocalPoint:
        (match?.circle_focal_point || match?.card_position) ?? "50% 50%",
      slug: match?.slug ?? null,
      nextSlot: e.firstSlot?.dateStart ?? null,
    };
  });
}

/**
 * Apply the semantic core to page SEO fields.
 *
 *   1. Parses the three CSV exports under /semantics for UK / RU / EN.
 *   2. Uses the explicit PAGES mapping below to bridge each semantic
 *      cluster (a "tag" in the CSV) to a real URL — a category, a
 *      service, a static page, or the homepage.
 *   3. For every mapped page it generates, per locale:
 *        - seo_title     : primary keyword + brand + city, ≤ 60 chars
 *        - seo_desc      : natural sentence using 2-3 secondary
 *                          keywords, ≤ 160 chars
 *        - seo_keywords  : top 12 frequency-sorted keywords from the
 *                          cluster, comma-joined
 *   4. Writes to the DB but only where the field is currently empty
 *      (so admin-authored SEO copy is never clobbered). Pass --force
 *      on the CLI to overwrite existing values.
 *
 * The script prints a full report at the end including keyword counts
 * per page and any semantic clusters that did NOT map to a live URL
 * (usually pages that haven't been built yet — плavника хірургія, etc.).
 *
 * Run: npx tsx scripts/seo-from-semantics.ts            # safe dry-run over empty fields
 *      npx tsx scripts/seo-from-semantics.ts --force    # overwrite
 *      npx tsx scripts/seo-from-semantics.ts --dry-run  # print report, no writes
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

type Locale = "uk" | "ru" | "en";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});
const sql = postgres(env.DATABASE_URL!);

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY = args.includes("--dry-run");

/* ───────────────────────── CSV parser ─────────────────────────────── */
/** Tiny CSV parser that handles quoted fields and embedded commas but
 *  not embedded newlines (the semantics CSVs don't have any). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const row: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (inQuotes) {
        if (c === '"' && raw[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else cur += c;
      } else {
        if (c === ",") { row.push(cur); cur = ""; }
        else if (c === '"') inQuotes = true;
        else cur += c;
      }
    }
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

interface Keyword { phrase: string; tag: string; frequency: number; }

function loadCsv(file: string): Keyword[] {
  const text = fs.readFileSync(path.resolve(__dirname, "..", file), "utf-8");
  const rows = parseCsv(text);
  const out: Keyword[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;
    const phrase = (row[0] || "").trim();
    const tag = (row[2] || "").trim();
    const freqStr = (row[3] || "").trim();
    if (!phrase || !tag) continue;
    // Frequencies are integers or "n/a" / "—" — coerce non-numeric to 1.
    const freqNum = parseInt(freqStr, 10);
    const frequency = Number.isFinite(freqNum) ? freqNum : 1;
    out.push({ phrase, tag, frequency });
  }
  return out;
}

/* ─────────────────── Page → semantic tag registry ─────────────────── */

type Locator =
  | { type: "home" }
  | { type: "category"; slug: string }
  | { type: "service"; slug: string }
  | { type: "static"; slug: string };

interface PageEntry {
  locator: Locator;
  /** Human-friendly name for the report only. */
  label: string;
  /** One or more semantic tags per locale. Multiple tags combine into
   *  a single keyword pool (useful when the CSV split a theme). */
  tags: Partial<Record<Locale, string[]>>;
}

const PAGES: PageEntry[] = [
  { locator: { type: "home" },                                         label: "Homepage",               tags: { uk: ["головна"], ru: ["главная"], en: ["aesthetic medicine center"] } },

  // ── Service categories ─────────────────────────────────────────────
  { locator: { type: "category", slug: "injectable-cosmetology" },     label: "Injectable cosmetology", tags: { uk: ["косметичні ін'єкції"], ru: ["инъекционная косметология"], en: ["rejuvenation injections"] } },
  { locator: { type: "category", slug: "apparatus-cosmetology" },      label: "Apparatus cosmetology",  tags: { uk: ["апаратна косметологія", "апаратні процедури для обличчя"], ru: ["аппаратная косметология", "аппаратные процедуры для лица", "аппаратная косметология для тела"], en: ["non invasive cosmetic procedures", "non-invasive body contouring"] } },
  { locator: { type: "category", slug: "intimate-rejuvenation" },      label: "Intimate rejuvenation",  tags: { uk: ["інтимна косметологія"], ru: ["Аппаратная косметология для интимной зоны"], en: ["Intimate area cosmetology"] } },
  { locator: { type: "category", slug: "laser-hair-removal" },         label: "Laser hair removal",     tags: { uk: ["лазерна епіляція"], ru: ["лазерная эпиляция"], en: ["laser hair removal"] } },

  // ── Services: injectable cosmetology ───────────────────────────────
  { locator: { type: "service", slug: "botulinum-therapy" },           label: "Botulinum therapy",      tags: { uk: ["ботулінотерапія"], ru: ["ботулинотерапия"], en: ["botulinum toxin therapy"] } },
  { locator: { type: "service", slug: "contour-plasty" },              label: "Contour plasty",         tags: { uk: ["контурна пластика"], ru: ["контурная пластика"], en: ["facial contouring"] } },
  { locator: { type: "service", slug: "biorevitalisation" },           label: "Biorevitalisation",      tags: { uk: ["біоревіталізація"], ru: ["биоревитализация"], en: ["facial biorevitalization"] } },
  { locator: { type: "service", slug: "mesotherapy" },                 label: "Mesotherapy",            tags: { uk: ["мезотерапія"], ru: ["мезотерапия"], en: ["facial mesotherapy"] } },
  { locator: { type: "service", slug: "prp-therapy" },                 label: "PRP therapy",            tags: { uk: ["prp плазмоліфтинг"], ru: ["prp терапия"], en: ["prp therapy"] } },
  { locator: { type: "service", slug: "exosomes" },                    label: "Exosomes",               tags: { uk: ["екзосоми"], ru: ["экзосомы"], en: ["exosomes"] } },
  { locator: { type: "service", slug: "stem-cell-therapy" },           label: "Stem cell therapy",      tags: { uk: ["омолодження стовбуровими клітинами"], ru: ["стволовая клеточная терапия"], en: ["stem cell rejuvenation"] } },
  { locator: { type: "service", slug: "rejuran" },                     label: "Rejuran",                tags: { uk: ["rejuran"], ru: ["rejuran"], en: ["rejuran treatment"] } },
  { locator: { type: "service", slug: "juvederm" },                    label: "Juvederm",               tags: { uk: ["juvederm"], ru: ["juvederm"], en: ["juvederm injections"] } },
  { locator: { type: "service", slug: "polyphil" },                    label: "PolyPhil",               tags: { uk: ["polyphil"], ru: ["polyphil"], en: ["polyphil treatment"] } },

  // ── Services: apparatus cosmetology ────────────────────────────────
  { locator: { type: "service", slug: "emface" },                      label: "EMFACE",                 tags: { uk: ["emface"], ru: ["emface"], en: ["emface"] } },
  { locator: { type: "service", slug: "volnewmer" },                   label: "VOLNEWMER",              tags: { uk: ["volnewmer"], ru: ["volnewmer"], en: ["volnewmer"] } },
  { locator: { type: "service", slug: "exion" },                       label: "EXION",                  tags: { uk: ["exion"], ru: ["exion"], en: ["exion"] } },
  { locator: { type: "service", slug: "ultraformer-mpt" },             label: "Ultraformer MPT",        tags: { uk: ["Ultraformer mpt"], ru: ["ultraformer mpt"], en: ["ultraformer mpt"] } },
  { locator: { type: "service", slug: "emsculpt-neo" },                label: "EMSCULPT NEO",           tags: { uk: ["emsculpt neo", "апаратна корекція фігури"], ru: ["emsculpt neo"], en: ["emsculpt neo"] } },
  { locator: { type: "service", slug: "ultraformer-mpt-body" },        label: "Ultraformer MPT Body",   tags: { uk: ["ультраформер для тіла"], ru: ["ultraformer mrt тело"], en: ["ultraformer body"] } },
  { locator: { type: "service", slug: "exion-body" },                  label: "EXION Body",             tags: { uk: ["exion body"], ru: ["exion body"], en: ["exion body"] } },
  { locator: { type: "service", slug: "m22-stellar-black" },           label: "M22 Stellar Black",      tags: { uk: ["m22 stellar black"], ru: ["m22 stellar black"], en: ["m22 stellar black"] } },
  { locator: { type: "service", slug: "splendor-x" },                  label: "Splendor X",             tags: { uk: ["splendor x"], ru: ["splendor x"], en: ["splendor x"] } },
  { locator: { type: "service", slug: "hydrafacial" },                 label: "HydraFacial",            tags: { uk: ["hydrafacial"], ru: ["hydrafacial"], en: ["hydrafacial"] } },
  { locator: { type: "service", slug: "acupulse-co2" },                label: "AcuPulse CO₂",           tags: { uk: ["Acupuls co2"], ru: ["Acupuls co2"], en: ["Acupuls co2"] } },

  // ── Services: intimate rejuvenation ───────────────────────────────
  { locator: { type: "service", slug: "monopolar-rf-lifting" },        label: "Monopolar RF lifting",   tags: { uk: ["монополярний rf-ліфтинг"], ru: ["монополярный rf лифтинг"], en: ["monopolar rf lifting"] } },
  { locator: { type: "service", slug: "acupulse-co2-intimate" },       label: "AcuPulse CO₂ intimate",  tags: { uk: ["Acupulse CO2 інтимне відновлення"], ru: ["Acupulse CO2 интимное омоложение"], en: ["co2 rejuvenation"] } },

  // ── Services: laser hair removal ───────────────────────────────────
  { locator: { type: "service", slug: "laser-men" },                   label: "Laser hair removal — men",   tags: { uk: ["лазерна епіляція для чоловіків"], ru: ["лазерная эпиляция для мужчин"], en: ["laser hair removal for men"] } },
  { locator: { type: "service", slug: "laser-women" },                 label: "Laser hair removal — women", tags: { uk: ["лазерна жіноча епіляція"], ru: ["лазерная эпиляция для женщин"], en: ["laser hair removal for women"] } },

  // ── Services: longevity & anti-age ─────────────────────────────────
  { locator: { type: "service", slug: "check-up-40" },                 label: "Check-Up 40+",           tags: { uk: ["check up 40", "check up 41", "check up 42", "check up 43", "check up 44", "check up 45", "check up 46"], ru: ["check up 40"], en: ["check-up at 40"] } },
  { locator: { type: "service", slug: "longevity-program" },           label: "Longevity program",      tags: { uk: ["Longevity програма"], ru: ["Longevity программа"], en: ["longevity program"] } },
  { locator: { type: "service", slug: "hormonal-balance" },            label: "Hormonal balance",       tags: { uk: ["програма гормональний баланс"], ru: ["программа гормональный баланс"], en: ["hormonal balance program"] } },
  { locator: { type: "service", slug: "iv-therapy" },                  label: "IV therapy",             tags: { uk: ["iv терапія"], ru: ["iv терапия"], en: ["iv therapy"] } },
  { locator: { type: "service", slug: "nutraceuticals" },              label: "Nutraceuticals",         tags: { uk: ["нутриціолог"], ru: ["нутрицевтика"], en: ["nutritionist"] } },

  // ── Static pages ───────────────────────────────────────────────────
  { locator: { type: "static", slug: "laboratory" },                   label: "Laboratory",             tags: { uk: ["аналізи"], ru: ["лаборатория"], en: ["private lab"] } },
  { locator: { type: "static", slug: "stationary" },                   label: "Day hospital",           tags: { uk: ["стаціонар"], ru: ["стационар"], en: ["day hospital"] } },
];

/* ───────────────────── Locale-specific copy builders ──────────────── */

const CITY_GENITIVE: Record<Locale, string> = { uk: "у Дніпрі", ru: "в Днепре", en: "in Dnipro" };

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function buildTitle(primary: string, locale: Locale): string {
  const title = `${capitalizeFirst(primary)} ${CITY_GENITIVE[locale]} | GENEVITY`;
  return truncate(title, 60);
}

function buildDescription(primary: string, secondary: string[], locale: Locale): string {
  const p = capitalizeFirst(primary);
  const extras = secondary.slice(0, 2).map((s) => s).join(", ");
  const patterns: Record<Locale, string> = {
    uk: `${p} в GENEVITY ${CITY_GENITIVE.uk}. ${extras ? extras.charAt(0).toUpperCase() + extras.slice(1) + ". " : ""}Сучасне обладнання, досвідчені лікарі, індивідуальний підхід. Записуйтеся онлайн.`,
    ru: `${p} в GENEVITY ${CITY_GENITIVE.ru}. ${extras ? extras.charAt(0).toUpperCase() + extras.slice(1) + ". " : ""}Современное оборудование, опытные врачи, индивидуальный подход. Записывайтесь онлайн.`,
    en: `${p} at GENEVITY ${CITY_GENITIVE.en}. ${extras ? extras.charAt(0).toUpperCase() + extras.slice(1) + ". " : ""}Modern equipment, experienced doctors, personalised care. Book online.`,
  };
  return truncate(patterns[locale], 160);
}

function buildKeywords(keywords: Keyword[]): string {
  // Dedupe (case-insensitive) + frequency sort, keep top 12.
  const seen = new Set<string>();
  const sorted = [...keywords].sort((a, b) => b.frequency - a.frequency);
  const out: string[] = [];
  for (const k of sorted) {
    const key = k.phrase.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(k.phrase.trim());
    if (out.length >= 12) break;
  }
  return out.join(", ");
}

/* ────────────────────────── Main pipeline ─────────────────────────── */

async function main() {
  const csvFiles: Record<Locale, string> = {
    uk: "semantics/genevity.com.ua _ Семантичне ядро - UA.csv",
    ru: "semantics/genevity.com.ua _ Семантичне ядро - RU.csv",
    en: "semantics/genevity.com.ua _ Семантичне ядро - EN.csv",
  };

  // Keyword pools keyed by "locale:tag" so lookups are O(1).
  const keywordsByLocaleTag: Map<string, Keyword[]> = new Map();
  const seenTags: Record<Locale, Set<string>> = { uk: new Set(), ru: new Set(), en: new Set() };

  for (const locale of Object.keys(csvFiles) as Locale[]) {
    const rows = loadCsv(csvFiles[locale]);
    for (const r of rows) {
      seenTags[locale].add(r.tag);
      const key = `${locale}:${r.tag}`;
      const arr = keywordsByLocaleTag.get(key) || [];
      arr.push(r);
      keywordsByLocaleTag.set(key, arr);
    }
  }

  // Resolve each PAGE's locator to a DB row id and write SEO columns.
  const report: {
    updated: string[];
    skipped: string[];
    missingPages: string[];
    unmappedTags: { locale: Locale; tag: string }[];
  } = { updated: [], skipped: [], missingPages: [], unmappedTags: [] };

  // Collect every tag referenced by PAGES so we can diff against the
  // seen-set at the end and surface the leftovers.
  const referencedTags: Record<Locale, Set<string>> = { uk: new Set(), ru: new Set(), en: new Set() };
  for (const p of PAGES) {
    for (const loc of ["uk", "ru", "en"] as Locale[]) {
      for (const t of p.tags[loc] || []) referencedTags[loc].add(t);
    }
  }

  for (const page of PAGES) {
    const rowId = await resolvePageId(page.locator);
    if (!rowId) {
      report.missingPages.push(`${page.label} (${JSON.stringify(page.locator)})`);
      continue;
    }

    // Build the three locales' copy from the cluster keywords.
    const seo: Record<Locale, { title: string; desc: string; keywords: string }> = {
      uk: { title: "", desc: "", keywords: "" },
      ru: { title: "", desc: "", keywords: "" },
      en: { title: "", desc: "", keywords: "" },
    };

    for (const locale of ["uk", "ru", "en"] as Locale[]) {
      const tags = page.tags[locale] || [];
      const pool: Keyword[] = [];
      for (const t of tags) {
        const arr = keywordsByLocaleTag.get(`${locale}:${t}`) || [];
        pool.push(...arr);
      }
      if (pool.length === 0) continue;
      const sorted = [...pool].sort((a, b) => b.frequency - a.frequency);
      const primary = sorted[0].phrase;
      const secondary = sorted.slice(1).map((k) => k.phrase);
      seo[locale] = {
        title: buildTitle(primary, locale),
        desc: buildDescription(primary, secondary, locale),
        keywords: buildKeywords(pool),
      };
    }

    // No-op when every locale is empty (no semantic data for this page).
    if (!seo.uk.title && !seo.ru.title && !seo.en.title) {
      report.skipped.push(`${page.label} — no keywords in any locale`);
      continue;
    }

    const writes = await applySeo(page, rowId, seo);
    if (writes.length > 0) {
      report.updated.push(`${page.label} — ${writes.join(", ")}`);
    } else {
      report.skipped.push(`${page.label} — all fields already set (use --force to overwrite)`);
    }
  }

  // Semantic clusters no PAGE registry entry covers — future content.
  for (const locale of ["uk", "ru", "en"] as Locale[]) {
    for (const t of seenTags[locale]) {
      if (!referencedTags[locale].has(t) && t) {
        report.unmappedTags.push({ locale, tag: t });
      }
    }
  }

  printReport(report);
  await sql.end();
}

async function resolvePageId(locator: Locator): Promise<string | null> {
  if (locator.type === "home") {
    const rows = await sql`SELECT id FROM static_pages WHERE slug = 'home' LIMIT 1`;
    return rows[0]?.id as string || null;
  }
  if (locator.type === "static") {
    const rows = await sql`SELECT id FROM static_pages WHERE slug = ${locator.slug} LIMIT 1`;
    return rows[0]?.id as string || null;
  }
  if (locator.type === "category") {
    const rows = await sql`SELECT id FROM service_categories WHERE slug = ${locator.slug} LIMIT 1`;
    return rows[0]?.id as string || null;
  }
  if (locator.type === "service") {
    const rows = await sql`SELECT id FROM services WHERE slug = ${locator.slug} LIMIT 1`;
    return rows[0]?.id as string || null;
  }
  return null;
}

async function applySeo(
  page: PageEntry,
  rowId: string,
  seo: Record<Locale, { title: string; desc: string; keywords: string }>,
): Promise<string[]> {
  const table = tableFor(page.locator.type);
  const current = await sql`SELECT * FROM ${sql(table)} WHERE id = ${rowId} LIMIT 1`;
  if (!current[0]) return [];
  const row = current[0];

  const writes: string[] = [];
  const updates: Record<string, string> = {};
  for (const locale of ["uk", "ru", "en"] as Locale[]) {
    const fields: { key: string; next: string }[] = [
      { key: `seo_title_${locale}`,    next: seo[locale].title },
      { key: `seo_desc_${locale}`,     next: seo[locale].desc },
      { key: `seo_keywords_${locale}`, next: seo[locale].keywords },
    ];
    for (const f of fields) {
      if (!f.next) continue;
      const currentVal = (row[f.key] as string | null) || "";
      if (currentVal.trim() && !FORCE) continue; // keep admin-set copy
      updates[f.key] = f.next;
      writes.push(f.key);
    }
  }

  if (writes.length === 0) return [];
  if (DRY) return writes;

  // Build the SET clause — postgres.js supports `${sql(obj)}` on updates.
  await sql`UPDATE ${sql(table)} SET ${sql(updates)} WHERE id = ${rowId}`;
  return writes;
}

function tableFor(type: Locator["type"]): string {
  switch (type) {
    case "home":
    case "static":   return "static_pages";
    case "category": return "service_categories";
    case "service":  return "services";
  }
}

function printReport(report: {
  updated: string[]; skipped: string[]; missingPages: string[];
  unmappedTags: { locale: Locale; tag: string }[];
}) {
  const mode = DRY ? " (DRY RUN — no DB writes)" : FORCE ? " (FORCE — overwrote existing)" : "";
  console.log(`\n════════════════════════════════════════════${mode}`);
  console.log(`  Updated: ${report.updated.length}`);
  for (const line of report.updated) console.log(`    ✓ ${line}`);
  console.log(`\n  Skipped: ${report.skipped.length}`);
  for (const line of report.skipped) console.log(`    · ${line}`);
  if (report.missingPages.length) {
    console.log(`\n  ⚠ Pages not in DB (semantic entry exists, but no row):`);
    for (const line of report.missingPages) console.log(`    · ${line}`);
  }
  if (report.unmappedTags.length) {
    console.log(`\n  ⚠ Semantic clusters with no URL mapping (${report.unmappedTags.length}):`);
    const byLocale: Record<string, string[]> = {};
    for (const { locale, tag } of report.unmappedTags) {
      byLocale[locale] = byLocale[locale] || [];
      byLocale[locale].push(tag);
    }
    for (const loc of Object.keys(byLocale)) {
      console.log(`    [${loc}] ${byLocale[loc].join(" · ")}`);
    }
  }
  console.log(`════════════════════════════════════════════\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Seed apparatus (equipment) certificates.
 *
 * Source: the client's "Сертификаты аппараты" folder — one sub-folder per
 * device brand, each holding scanned PDFs. Every PDF page is rasterised to a
 * **PNG** (the client asked for PNG, and these are legal documents where
 * lossless text matters), uploaded to Vercel Blob and written into
 * `equipment.certificates`.
 *
 * Certificates hang off the *device*, not the service: a single upload then
 * shows on every service page linked through `service_equipment`.
 *
 * Requires `pdftoppm` (poppler) on PATH — `brew install poppler`.
 *
 * Run:  npx tsx scripts/seed-equipment-certificates.ts [--dry]
 */
import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";
import postgres from "postgres";
import sharp from "sharp";
import { put, del, list } from "@vercel/blob";

/* ─── env ───────────────────────────────────────────────────────────────── */
const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
envContent.split("\n").forEach((l) => {
  const m = l.match(/^([^#=\s]+)=(.+)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

const sql = postgres(process.env.DATABASE_URL!);
const DRY = process.argv.includes("--dry");
const SRC = path.resolve(__dirname, "../Сертификаты аппараты");

/* ─── source documents ──────────────────────────────────────────────────── */

type L = { uk: string; ru: string; en: string };

interface SourceDoc {
  /** Stable key — also the Blob folder, so a re-run overwrites nothing stale. */
  key: string;
  /** PDF paths relative to SRC, concatenated in order into one document. */
  files: string[];
  /** 1-based pages to keep from each file, by index; omit to take every page. */
  pages?: (number[] | undefined)[];
  /** Human name of the document, per locale. */
  title: L;
  /** Issuing body, shown under the title. */
  issuer: L;
  /** Registry number as printed on the scan. */
  number: string;
  /** Validity as printed; empty when the document states none. */
  validUntil: L;
  /** `equipment.name` values this document covers. */
  equipment: string[];
}

const CERT = (uk: string, ru: string, en: string): L => ({ uk, ru, en });

const POLITEHMED = CERT(
  'ДУО «Політехмед», МОЗ України',
  'ГУО «Политехмед», МЗ Украины',
  "Ukrainian State Association “Politechmed”, Ministry of Health of Ukraine",
);

const DOCS: SourceDoc[] = [
  {
    key: "btl",
    files: ["BTL/BTL.pdf"],
    // p6 is a blank back-of-scan sheet.
    pages: [[1, 2, 3, 4, 5]],
    title: CERT(
      "Сертифікат відповідності на обладнання BTL",
      "Сертификат соответствия на оборудование BTL",
      "Certificate of conformity for BTL equipment",
    ),
    issuer: CERT(
      'ТОВ «Український центр медичної сертифікації та прогнозування»',
      'ООО «Украинский центр медицинской сертификации и прогнозирования»',
      "Ukrainian Centre for Medical Certification and Forecasting LLC",
    ),
    number: "UA.TR.098.0035-16",
    validUntil: CERT("30 червня 2026 р.", "30 июня 2026 г.", "30 June 2026"),
    equipment: ["EMFACE", "EMSCULPT NEO", "EXION", "EXION Body", "EXION Intimate"],
  },
  {
    key: "lumenis-stellar",
    files: ["Lumenis/ТР Lumenis Be_Stellar AES.pdf"],
    title: CERT(
      "Сертифікат відповідності на лазерну систему Stellar (Lumenis)",
      "Сертификат соответствия на лазерную систему Stellar (Lumenis)",
      "Certificate of conformity for the Stellar laser system (Lumenis)",
    ),
    issuer: POLITEHMED,
    number: "UA.101.MD.5.020326/01-26.00",
    validUntil: CERT("1 березня 2027 р.", "1 марта 2027 г.", "1 March 2027"),
    equipment: ["M22 STELLAR BLACK"],
  },
  {
    key: "lumenis-stellar-declaration",
    files: ["Stellar/ДЕКЛАРАЦІЯ_медгарант_Lumenis_Stellar AES.pdf"],
    title: CERT(
      "Декларація про відповідність технічному регламенту — Stellar (Lumenis)",
      "Декларация о соответствии техническому регламенту — Stellar (Lumenis)",
      "Declaration of conformity with the technical regulation — Stellar (Lumenis)",
    ),
    issuer: CERT('ТОВ «Медгарант»', 'ООО «Медгарант»', "Medgarant LLC"),
    number: "UA.101.MD.5.020326/01-26.00",
    validUntil: CERT("", "", ""),
    equipment: ["M22 STELLAR BLACK"],
  },
  {
    key: "lumenis-acupulse",
    files: ["AcuPulse/ТР_Lumenis Be_AcuPulse (1).pdf"],
    title: CERT(
      "Сертифікат відповідності на лазерну систему AcuPulse (Lumenis)",
      "Сертификат соответствия на лазерную систему AcuPulse (Lumenis)",
      "Certificate of conformity for the AcuPulse laser system (Lumenis)",
    ),
    issuer: POLITEHMED,
    number: "UA.101.MD.5.250425/01-25.00",
    validUntil: CERT("24 квітня 2026 р.", "24 апреля 2026 г.", "24 April 2026"),
    equipment: ["CO2 лазер (AcuPulse)"],
  },
  {
    key: "bios-splendor-x",
    files: ["Splendor/ТР BIOS_SPLENDОR X ALEX + ND YAG 2026.pdf"],
    title: CERT(
      "Сертифікат відповідності на лазерну систему SPLENDOR X (BIOS)",
      "Сертификат соответствия на лазерную систему SPLENDOR X (BIOS)",
      "Certificate of conformity for the SPLENDOR X laser system (BIOS)",
    ),
    issuer: POLITEHMED,
    number: "UA.101.MD.5.140426/04-26.00",
    validUntil: CERT("23 березня 2027 р.", "23 марта 2027 г.", "23 March 2027"),
    equipment: ["SPLENDOR X"],
  },
  {
    key: "classys",
    // Ultraformer_0001.pdf and Volnewmer_0001.pdf are scans of the *same*
    // Classys certificate (№ 003285) — seeded once, linked to both devices.
    files: ["Ultraformer/Ultraformer_0001.pdf"],
    title: CERT(
      "Сертифікат відповідності на обладнання Classys (Ultraformer MPT, Volnewmer)",
      "Сертификат соответствия на оборудование Classys (Ultraformer MPT, Volnewmer)",
      "Certificate of conformity for Classys equipment (Ultraformer MPT, Volnewmer)",
    ),
    issuer: POLITEHMED,
    number: "UA.101.MD.3.0600-24.00",
    validUntil: CERT("26 серпня 2029 р.", "26 августа 2029 г.", "26 August 2029"),
    equipment: ["ULTRAFORMER MPT", "ULTRAFORMER MPT Body", "VOLNEWMER", "VOLNEWMER Body"],
  },
  {
    key: "zemits",
    // The certificate (Zemits 1) and its three-sheet annex (Zemits 2–4) are one
    // document split across four scan files.
    files: [
      "Zemits/Zemits 1.pdf",
      "Zemits/Zemits 2.pdf",
      "Zemits/Zemits 3.pdf",
      "Zemits/Zemits 4.pdf",
    ],
    title: CERT(
      "Сертифікат відповідності на косметологічне обладнання ZEMITS",
      "Сертификат соответствия на косметологическое оборудование ZEMITS",
      "Certificate of conformity for ZEMITS cosmetology equipment",
    ),
    issuer: CERT(
      'ТОВ «ВСЦ «Південтест»',
      'ООО «ИСЦ «Пивдентест»',
      "Testing and Certification Centre “Pivdentest” LLC",
    ),
    number: "UA0.YT.111809-24",
    validUntil: CERT("17 листопада 2026 р.", "17 ноября 2026 г.", "17 November 2026"),
    equipment: ["Zemits Verstand Pro", "Zemits CryoCool"],
  },
  {
    key: "zemits-verstand-pro-fda",
    files: ["Zemits/Zemits PRO.pdf"],
    title: CERT(
      "Сертифікат реєстрації FDA — Zemits Verstand PRO",
      "Сертификат регистрации FDA — Zemits Verstand PRO",
      "FDA certificate of registration — Zemits Verstand PRO",
    ),
    issuer: CERT(
      "U.S. Food and Drug Administration (Registrar Corp)",
      "U.S. Food and Drug Administration (Registrar Corp)",
      "U.S. Food and Drug Administration (Registrar Corp)",
    ),
    number: "",
    validUntil: CERT("", "", ""),
    equipment: ["Zemits Verstand Pro"],
  },
];

/* ─── types written to the DB ───────────────────────────────────────────── */

interface CertEntry {
  url: string;
  type: "image";
  /** Stable source key + page — lets a re-run replace instead of duplicate. */
  source: string;
  /** Written by this script. Entries added later through the CMS lack it and
   *  are never pruned by a re-run. */
  seed: true;
  page: number;
  pageCount: number;
  doc_uk: string; doc_ru: string; doc_en: string;
  issuer_uk: string; issuer_ru: string; issuer_en: string;
  number: string;
  valid_until_uk: string; valid_until_ru: string; valid_until_en: string;
  alt_uk: string; alt_ru: string; alt_en: string;
}

/* ─── rasterise + upload ────────────────────────────────────────────────── */

const RENDER_DPI = 200;
/** Long edge cap — A4 at 200 dpi is 1654×2339, so this is effectively lossless. */
const MAX_W = 1700;
const MAX_H = 2400;

async function renderPagesToPng(pdfPath: string, wanted?: number[]): Promise<Buffer[]> {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genevity-cert-"));
  try {
    execFileSync("pdftoppm", ["-r", String(RENDER_DPI), "-png", pdfPath, path.join(tmp, "p")]);
    const files = fs
      .readdirSync(tmp)
      .filter((f) => f.endsWith(".png"))
      .sort((a, b) => pageNo(a) - pageNo(b));

    const picked = wanted ? files.filter((f) => wanted.includes(pageNo(f))) : files;
    if (wanted && picked.length !== wanted.length) {
      throw new Error(`${pdfPath}: wanted pages ${wanted.join(",")} but found ${files.map(pageNo).join(",")}`);
    }

    return await Promise.all(
      picked.map((f) =>
        sharp(path.join(tmp, f))
          .resize({ width: MAX_W, height: MAX_H, fit: "inside", withoutEnlargement: true })
          // Palette PNG: these are flat document scans, so 128 colours is
          // visually identical to truecolour at roughly a quarter the bytes.
          .png({ palette: true, colours: 128, effort: 10 })
          .toBuffer(),
      ),
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** `p-03.png` / `p-3.png` → 3 */
function pageNo(file: string): number {
  const m = file.match(/-(\d+)\.png$/);
  return m ? parseInt(m[1], 10) : 0;
}

/* ─── main ──────────────────────────────────────────────────────────────── */

async function main() {
  const raw = await sql`SELECT id, name, certificates FROM equipment`;
  // The driver hands jsonb back as text in some column configurations.
  const eqRows = raw.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    certificates: (typeof r.certificates === "string"
      ? JSON.parse(r.certificates)
      : r.certificates ?? []) as CertEntry[],
  }));
  // `equipment.name` is not unique — SPLENDOR X exists twice (skin + laser
  // categories), and both rows need the certificate.
  const byName = new Map<string, typeof eqRows>();
  for (const r of eqRows) byName.set(r.name, [...(byName.get(r.name) ?? []), r]);

  // Fail before any upload if the mapping has drifted from the equipment table.
  const missing = [...new Set(DOCS.flatMap((d) => d.equipment))].filter((n) => !byName.has(n));
  if (missing.length) throw new Error(`No equipment row named: ${missing.join(" | ")}`);

  /** equipment id → entries to write */
  const additions = new Map<string, CertEntry[]>();
  /** every source key we are (re)seeding — used to drop stale rows first */
  const seededKeys = new Set(DOCS.map((d) => d.key));

  for (const doc of DOCS) {
    // Pages are numbered across the whole document, not per source file, so a
    // certificate split over four scans still reads "page 3 of 4".
    const pngs: Buffer[] = [];
    for (let f = 0; f < doc.files.length; f++) {
      const pdfPath = path.join(SRC, doc.files[f]);
      if (!fs.existsSync(pdfPath)) throw new Error(`Missing source PDF: ${pdfPath}`);
      pngs.push(...(await renderPagesToPng(pdfPath, doc.pages?.[f])));
    }
    console.log(`▸ ${doc.key}: ${pngs.length} page(s) from ${doc.files.join(", ")}`);

    const uploaded: { url: string; page: number }[] = [];
    for (let i = 0; i < pngs.length; i++) {
      const pageLabel = i + 1;
      if (DRY) {
        uploaded.push({ url: `dry://${doc.key}/${pageLabel}.png`, page: pageLabel });
        console.log(`    page ${pageLabel}: ${(pngs[i].length / 1024).toFixed(0)} KB (dry run)`);
        continue;
      }
      const { url } = await put(
        `equipment/certificates/${doc.key}/${randomUUID()}.png`,
        pngs[i],
        { access: "public", contentType: "image/png" },
      );
      uploaded.push({ url, page: pageLabel });
      console.log(`    page ${pageLabel}: ${(pngs[i].length / 1024).toFixed(0)} KB → ${url}`);
    }

    for (const eqName of doc.equipment) {
      for (const eq of byName.get(eqName)!) {
      const list = additions.get(eq.id) ?? [];
      uploaded.forEach(({ url, page }, i) => {
        const pageSuffix = (l: "uk" | "ru" | "en") =>
          uploaded.length > 1
            ? l === "en" ? `, page ${i + 1} of ${uploaded.length}`
              : l === "ru" ? `, страница ${i + 1} из ${uploaded.length}`
              : `, сторінка ${i + 1} з ${uploaded.length}`
            : "";
        list.push({
          url,
          type: "image",
          source: doc.key,
          seed: true,
          page,
          pageCount: uploaded.length,
          doc_uk: doc.title.uk, doc_ru: doc.title.ru, doc_en: doc.title.en,
          issuer_uk: doc.issuer.uk, issuer_ru: doc.issuer.ru, issuer_en: doc.issuer.en,
          number: doc.number,
          valid_until_uk: doc.validUntil.uk,
          valid_until_ru: doc.validUntil.ru,
          valid_until_en: doc.validUntil.en,
          alt_uk: `${doc.title.uk} — ${eqName}${pageSuffix("uk")}`,
          alt_ru: `${doc.title.ru} — ${eqName}${pageSuffix("ru")}`,
          alt_en: `${doc.title.en} — ${eqName}${pageSuffix("en")}`,
        });
      });
      additions.set(eq.id, list);
      }
    }
  }

  if (DRY) {
    for (const [id, list] of additions) {
      const name = eqRows.find((r) => r.id === id)!.name;
      console.log(`${name}: ${list.length} certificate page(s)`);
    }
    console.log("\nDry run — nothing uploaded, nothing written.");
    await sql.end();
    return;
  }

  for (const row of eqRows) {
    const next = additions.get(row.id);
    if (!next) continue;
    // Idempotent and self-healing: drop everything this script wrote before —
    // including documents that have since been merged or renamed — then append
    // the current run. Anything added through the CMS has no `seed` flag and
    // survives untouched.
    const kept = (row.certificates ?? []).filter((c) => !c.seed && !seededKeys.has(c.source));
    const merged = [...kept, ...next];
    // `sql.json` — passing a pre-stringified value to a jsonb column stores a
    // JSON *string scalar*, not an array, and every read then fails.
    await sql`
      UPDATE equipment
      SET certificates = ${sql.json(merged as unknown as object)}, updated_at = now()
      WHERE id = ${row.id}
    `;
    // Bump the service pages that surface this device so their ISR cache and
    // Last-Modified pick the new block up.
    await sql`
      UPDATE services SET updated_at = now()
      WHERE id IN (SELECT service_id FROM service_equipment WHERE equipment_id = ${row.id})
    `;
    console.log(`✓ ${row.name}: ${merged.length} certificate page(s)`);
  }

  // Sweep Blob entries from earlier runs that nothing references any more.
  const referenced = new Set<string>();
  for (const row of await sql`SELECT certificates FROM equipment`) {
    const list_ = (typeof row.certificates === "string"
      ? JSON.parse(row.certificates)
      : row.certificates ?? []) as CertEntry[];
    for (const c of list_) referenced.add(c.url);
  }
  const { blobs } = await list({ prefix: "equipment/certificates/" });
  const orphans = blobs.filter((b) => !referenced.has(b.url));
  if (orphans.length) {
    await del(orphans.map((b) => b.url));
    console.log(`\nRemoved ${orphans.length} orphaned blob(s) from earlier runs.`);
  }

  await sql.end();
  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Seed doctor certificates: convert PDF pages + JPGs → WebP, upload to Vercel Blob,
 * update certificate_images JSON in DB.
 *
 * Doctors: kyrylenko-anzhela, detsyk-dmytro, danylevsky-kostiantyn
 *
 * Run: npx tsx scripts/seed-certificates.ts
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
process.env.DATABASE_URL = env.DATABASE_URL;

import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

const sql = neon(env.DATABASE_URL!);

const CERT_DIR = path.resolve(__dirname, "../Сертификаты врачи");

interface CertImg {
  url: string;
  type: "image";
  alt_uk: string;
  alt_ru: string;
  alt_en: string;
}

/** Convert PDF → array of PNG buffers using pdftoppm (250 DPI) */
async function pdfToBuffers(pdfPath: string): Promise<Buffer[]> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "certs-"));
  const prefix = path.join(tmpDir, "page");
  execFileSync("/opt/homebrew/bin/pdftoppm", ["-r", "250", "-png", pdfPath, prefix], { stdio: "pipe" });
  const files = fs.readdirSync(tmpDir).filter(f => f.endsWith(".png")).sort();
  const buffers = files.map(f => fs.readFileSync(path.join(tmpDir, f)));
  fs.rmSync(tmpDir, { recursive: true });
  return buffers;
}

/** Convert HEIC file to JPEG buffer via sips (macOS) */
async function heicToBuffer(filePath: string): Promise<Buffer> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "heic-"));
  const outPath = path.join(tmpDir, "out.jpg");
  execFileSync("/usr/bin/sips", ["-s", "format", "jpeg", filePath, "--out", outPath], { stdio: "pipe" });
  const buf = fs.readFileSync(outPath);
  fs.rmSync(tmpDir, { recursive: true });
  return buf;
}

/** Process image buffer → high-quality WebP */
async function toWebP(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // auto-rotate from EXIF
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 5 })
    .toBuffer();
}

/** Upload WebP buffer to Vercel Blob, return URL */
async function upload(slug: string, webp: Buffer): Promise<string> {
  const { url } = await put(
    `doctors/certificates/${slug}/${randomUUID()}.webp`,
    webp,
    { access: "public", addRandomSuffix: false, contentType: "image/webp" },
  );
  return url;
}

/** Process and upload a single JPG/PNG/HEIC file */
async function processFile(filePath: string, slug: string, label: string): Promise<string> {
  const isHeic = /\.heic$/i.test(filePath);
  const buf = isHeic ? await heicToBuffer(filePath) : fs.readFileSync(filePath);
  const webp = await toWebP(buf);
  const url = await upload(slug, webp);
  console.log(`    ✓ ${label} → ${url.slice(-40)}`);
  return url;
}

/** Process and upload all pages of a PDF */
async function processPdf(pdfPath: string, slug: string): Promise<string[]> {
  console.log(`    📄 Converting PDF: ${path.basename(pdfPath)}`);
  const buffers = await pdfToBuffers(pdfPath);
  console.log(`       ${buffers.length} page(s)`);
  const urls: string[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const webp = await toWebP(buffers[i]);
    const url = await upload(slug, webp);
    urls.push(url);
    console.log(`       page ${i + 1} → ${url.slice(-40)}`);
  }
  return urls;
}

// ─── Doctor definitions ───────────────────────────────────────────────────────

interface DoctorCertDef {
  slug: string;
  alt_uk: string;
  alt_ru: string;
  alt_en: string;
  /** Files to upload: relative to CERT_DIR/{folder}/ */
  folder: string;
  jpgs: string[];
  pdfs: string[];
}

const DOCTORS: DoctorCertDef[] = [
  {
    slug: "kyrylenko-anzhela",
    folder: "Кириленко",
    alt_uk: "Сертифікат Кириленко Анжели В'ячеславівни",
    alt_ru: "Сертификат Кириленко Анжелы Вячеславовны",
    alt_en: "Certificate of Anzhela Kyrylenko",
    jpgs: [
      "2026-05-06 09.36.54.jpg",
      "2026-05-06 09.36.59.jpg",
      "2026-05-06 09.37.02.jpg",
      "2026-05-06 09.37.05.jpg",
      "2026-05-06 09.37.09.jpg",
      "2026-05-06 09.37.12.jpg",
      "2026-05-06 09.37.16.jpg",
      "2026-05-06 09.37.20.jpg",
      "2026-05-06 09.37.24.jpg",
    ],
    pdfs: [],
  },
  {
    slug: "detsyk-dmytro",
    folder: "децик",
    alt_uk: "Сертифікат Децика Дмитра Анатолійовича",
    alt_ru: "Сертификат Децика Дмитрия Анатольевича",
    alt_en: "Certificate of Dmytro Detsyk",
    jpgs: [
      "Децик сертифікат хірургія фото.jpg",
      "Децик хірургія категорія фото.jpg",
      "Диплом Децик фото.jpg",
      "Довыдка пластика лазер.jpg",
    ],
    pdfs: [
      "Децик сертифікати.pdf",
      "Децик лазер.pdf",
      "Децик рубці.pdf",
    ],
  },
  {
    slug: "danylevsky-kostiantyn",
    folder: "Данилевский",
    alt_uk: "Сертифікат Данилевського Костянтина Анатолійовича",
    alt_ru: "Сертификат Данилевского Константина Анатольевича",
    alt_en: "Certificate of Kostiantyn Danylevsky",
    jpgs: [],
    pdfs: ["Данилевский.pdf"],
  },
  {
    slug: "kroshka-iryna",
    folder: "Крошка",
    alt_uk: "Сертифікат Крошки Ірини",
    alt_ru: "Сертификат Крошки Ирины",
    alt_en: "Certificate of Iryna Kroshka",
    jpgs: [],
    pdfs: ["Крошка.pdf"],
  },
  {
    slug: "pastarush-larysa",
    folder: "Пастарус",
    alt_uk: "Сертифікат Пастарущ Лариси",
    alt_ru: "Сертификат Пастарущ Ларисы",
    alt_en: "Certificate of Larysa Pastarush",
    jpgs: ["0_02_05_1322d9cc43f5f014df24a253ae44e62cc9554ef51e6054df518d2d5df5a0269f.jpg"],
    pdfs: ["scan_20260511104213.pdf"],
  },
  {
    slug: "poleshko-kateryna",
    folder: "Poleshko",
    alt_uk: "Сертифікат Полешко Катерини Володимирівни",
    alt_ru: "Сертификат Полешко Екатерины Владимировны",
    alt_en: "Certificate of Kateryna Poleshko",
    jpgs: [
      "IMG_0806.JPG",
      "IMG_0807.JPG",
      "IMG_0808.JPG",
      "IMG_0809.JPG",
      "IMG_0810.JPG",
      "IMG_0811.JPG",
      "IMG_0812.JPG",
      "IMG_0813.JPG",
      "IMG_0814.JPG",
    ],
    pdfs: [],
  },
  {
    slug: "polunina-veronika",
    folder: "Polunina",
    alt_uk: "Сертифікат Полуніної Вероніки Вадимівни",
    alt_ru: "Сертификат Полуниной Вероники Вадимовны",
    alt_en: "Certificate of Veronika Polunina",
    jpgs: [
      "IMG_4147.HEIC",
      "IMG_4148.HEIC",
      "IMG_4149.HEIC",
      "IMG_4150.HEIC",
      "IMG_4151.HEIC",
      "IMG_4152.HEIC",
      "IMG_4154.HEIC",
      "IMG_4155.HEIC",
      "IMG_4156.HEIC",
      "IMG_4157.HEIC",
      "IMG_4158.HEIC",
      "IMG_4160.HEIC",
      "IMG_4161.HEIC",
      "IMG_4162.HEIC",
      "IMG_4165.HEIC",
      "IMG_4166.HEIC",
      "IMG_4167.HEIC",
      "IMG_4168.HEIC",
      "IMG_4169.HEIC",
      "IMG_4170.HEIC",
      "IMG_4171.HEIC",
      "IMG_4172.HEIC",
      "IMG_4173.HEIC",
      "IMG_4174.HEIC",
      "IMG_4175.HEIC",
      "IMG_4176.HEIC",
      "IMG_4177.HEIC",
    ],
    pdfs: [],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const TARGET_SLUGS = process.argv[2] ? process.argv[2].split(",") : null;

async function main() {
  for (const doc of DOCTORS) {
    if (TARGET_SLUGS && !TARGET_SLUGS.includes(doc.slug)) continue;
    console.log(`\n🩺 ${doc.slug}`);

    const folderPath = path.join(CERT_DIR, doc.folder);
    const newImages: CertImg[] = [];

    // Upload JPGs
    for (const jpg of doc.jpgs) {
      const filePath = path.join(folderPath, jpg);
      if (!fs.existsSync(filePath)) { console.warn(`  ⚠ Not found: ${jpg}`); continue; }
      const url = await processFile(filePath, doc.slug, jpg);
      newImages.push({ url, type: "image", alt_uk: doc.alt_uk, alt_ru: doc.alt_ru, alt_en: doc.alt_en });
    }

    // Upload PDF pages
    for (const pdf of doc.pdfs) {
      const filePath = path.join(folderPath, pdf);
      if (!fs.existsSync(filePath)) { console.warn(`  ⚠ Not found: ${pdf}`); continue; }
      const urls = await processPdf(filePath, doc.slug);
      for (const url of urls) {
        newImages.push({ url, type: "image", alt_uk: doc.alt_uk, alt_ru: doc.alt_ru, alt_en: doc.alt_en });
      }
    }

    if (newImages.length === 0) { console.warn(`  ⚠ No images to upload for ${doc.slug}`); continue; }

    // Fetch existing + merge
    const rows = await sql`SELECT id, certificate_images FROM doctors WHERE slug = ${doc.slug}`;
    if (!rows.length) { console.error(`  ❌ Doctor not found in DB: ${doc.slug}`); continue; }
    const existing: CertImg[] = (rows[0].certificate_images as CertImg[] | null) ?? [];
    const merged = [...existing, ...newImages];

    await sql`UPDATE doctors SET certificate_images = ${JSON.stringify(merged)}::jsonb WHERE slug = ${doc.slug}`;
    console.log(`  ✅ ${doc.slug}: ${existing.length} existing + ${newImages.length} new = ${merged.length} total`);
  }

  console.log("\n✅ Done!");
}

main().catch((err) => { console.error("❌ Fatal:", err); process.exit(1); });

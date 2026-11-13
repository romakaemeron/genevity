/**
 * ТЗ #19 — turn the photos extracted from the client's Word documents into the
 * webp assets the site actually serves.
 *
 * The client pasted full-resolution stock photography (1–2 MB PNGs). Heroes are
 * capped at 1920px wide, in-body images at 1280px, both re-encoded to webp —
 * the same treatment the existing /images/surgery assets had.
 *
 * Image 1 of each document is the procedure-specific hero; image 2, where the
 * document has one, is an in-body illustration used by a later section.
 *
 * Run: node scripts/tz19/convert-images.mjs
 * Out: public/images/surgery/tz19/<slug>-{hero,inline}.webp
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "scripts/tz19/images";
const OUT = "public/images/surgery/tz19";

const manifest = JSON.parse(fs.readFileSync(path.join(SRC, "images.json"), "utf-8"));
fs.mkdirSync(OUT, { recursive: true });

const ROLES = [
  { suffix: "hero", width: 1920, quality: 82 },
  { suffix: "inline", width: 1280, quality: 80 },
];

const result = {};
let total = 0;

for (const [slug, images] of Object.entries(manifest)) {
  result[slug] = {};
  for (const [i, img] of images.entries()) {
    const role = ROLES[i];
    if (!role) break; // never more than a hero and one inline image
    const name = `${slug}-${role.suffix}.webp`;
    const input = sharp(path.join(SRC, img.file));
    const { width, height } = await input.metadata();
    await input
      .resize({ width: Math.min(width, role.width), withoutEnlargement: true })
      .webp({ quality: role.quality })
      .toFile(path.join(OUT, name));
    const out = fs.statSync(path.join(OUT, name));
    result[slug][role.suffix] = `/images/surgery/tz19/${name}`;
    total++;
    console.log(
      `${slug.padEnd(34)} ${role.suffix.padEnd(6)} ${width}x${height} ` +
      `${(img.bytes / 1024 / 1024).toFixed(1)}MB -> ${(out.size / 1024).toFixed(0)}KB`,
    );
  }
}

fs.writeFileSync(path.join(SRC, "converted.json"), JSON.stringify(result, null, 1));
console.log(`\n${total} images written to ${OUT}`);

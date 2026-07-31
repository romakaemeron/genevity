/**
 * Verify slugifyUk output shape.
 * Run: npx tsx scripts/check-slugify.ts
 */
import { slugifyUk } from "../src/lib/slugify-uk";
import { SLUG_RE } from "../src/app/(admin)/admin/blog/_schema";

const cases: [string, string][] = [
  ["Ботокс чи диспорт: що обрати?", "botoks-chy-dysport-shcho-obraty"],
  ["Їжа для довголіття", "yizha-dlia-dovholittia"],
  ["  Подвійні   пробіли  ", "podviini-probily"],
  ["Anti-age 2026", "anti-age-2026"],
  ["!!!", ""],
  // зг → zgh (Resolution No. 55): must not collapse to z+h, which would be
  // indistinguishable from ж → zh.
  ["Розгон", "rozghon"],
  ["розгляд", "rozghliad"],
  // Control case: ж alone must still map to plain "zh", proving зг → zgh
  // and ж → zh no longer collide.
  ["Жанна", "zhanna"],
];

let failures = 0;
for (const [input, expected] of cases) {
  const got = slugifyUk(input);
  const shapeOk = got === "" || SLUG_RE.test(got);
  const ok = got === expected && shapeOk;
  console.log(ok ? `✓ ${input} → ${got}` : `✗ ${input} → ${got} (expected ${expected})`);
  if (!ok) failures++;
}
process.exit(failures === 0 ? 0 : 1);

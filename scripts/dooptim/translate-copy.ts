/**
 * Translates the extracted "дооптимізація" RU copy (scripts/dooptim/copy-ru.json)
 * into UK and EN, producing scripts/dooptim/copy-i18n.json with the same
 * structure but every user-visible string replaced by { uk, ru, en }.
 *
 * Usage: npx tsx scripts/dooptim/translate-copy.ts
 *
 * Notes on the translation helpers used:
 * - `translateHeadline`/`translateHtml` from src/lib/translate.ts only support
 *   target "en" (their RU output is a pass-through echo, and they don't accept
 *   "uk" at all — they were built for the CMS flow where UK is the *source*
 *   language and RU/EN are derived from it). Our source here is RU, and RU is
 *   never translated (`ru` is set to the original per the task spec), so we
 *   use `translateHeadline(text, "en")` / `translateHtml(html, "en")` as-is
 *   for English.
 * - For Ukrainian there is no matching helper in src/lib/translate.ts, and
 *   this task must not touch anything under src/. So this file defines local
 *   RU → UK equivalents (`translateHeadlineUk`, `translateHtmlUk`) that mirror
 *   the same model, the same "never throw, return '' on failure" contract,
 *   and — for HTML — the same tag-signature verification/retry from
 *   src/lib/translate.ts (reused via the exported `tagSignature`).
 */
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
config({ path: ".env.local" });

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { translateHeadline, translateHtml, tagSignature } from "@/lib/translate";

const IN = path.join(process.cwd(), "scripts/dooptim/copy-ru.json");
const OUT = path.join(process.cwd(), "scripts/dooptim/copy-i18n.json");

// ---------------------------------------------------------------- types (input)

type SectionRu =
  | { type: "bullets"; heading: string; items: string[]; after?: string }
  | {
      type: "indicationsContraindications";
      title: string;
      indicationsHeading: string;
      indications: string[];
      contraindicationsHeading: string;
      contraindications: string[];
      after?: string;
    }
  | {
      type: "priceTable";
      heading: string;
      rows: { label: string; price: string }[];
      note: string;
      after?: string;
    }
  | {
      type: "compareTable";
      heading: string;
      columns: string[];
      rows: { label: string; values: string[] }[];
      after?: string;
    }
  | { type: "richText"; heading: string; body: string; after?: string };

type PageRu = { slug: string; sections: SectionRu[] };
type DataRu = { pages: PageRu[] };

// ---------------------------------------------------------------- types (output)

type Tri = { uk: string; ru: string; en: string };

type SectionI18n =
  | { type: "bullets"; heading: Tri; items: Tri[]; after?: string }
  | {
      type: "indicationsContraindications";
      title: Tri;
      indicationsHeading: Tri;
      indications: Tri[];
      contraindicationsHeading: Tri;
      contraindications: Tri[];
      after?: string;
    }
  | {
      type: "priceTable";
      heading: Tri;
      rows: { label: Tri; price: Tri }[];
      note: Tri;
      after?: string;
    }
  | {
      type: "compareTable";
      heading: Tri;
      columns: Tri[];
      rows: { label: Tri; values: Tri[] }[];
      after?: string;
    }
  | { type: "richText"; heading: Tri; body: Tri; after?: string };

type PageI18n = { slug: string; sections: SectionI18n[] };
type DataI18n = { pages: PageI18n[] };

// ---------------------------------------------------------------- RU -> UK helpers
// Local equivalents of src/lib/translate.ts's translateHeadline/translateHtml,
// for the "en" target file provides. src/ is off-limits for this task, so the
// UK direction is implemented here, matching the same contract (never throws,
// returns "" on failure) and — for HTML — reusing the exported tagSignature
// to run the same structural verify/retry.

async function translateHeadlineUk(text: string): Promise<string> {
  const src = text.trim();
  if (!src) return "";
  try {
    const { text: out } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt:
        `Translate this Russian aesthetic-medicine clinic website text into Ukrainian.\n` +
        `Use accurate, natural Ukrainian medical/clinical terminology — never transliterated ` +
        `Russian. For example: "Онкологія" (not "Онкология"), "Вагітність та лактація" (not ` +
        `"Беременность и лактация"), "Епілепсія" (not "Эпилепсия"), "Порушення згортання крові" ` +
        `(not "Порушення свертываемости крові").\n` +
        `Preserve the meaning and a natural editorial register. Keep any numbers, prices and ` +
        `units exactly as given.\n` +
        `Return ONLY the translation, no quotes, no extra text.\n\n${src}`,
    });
    return out.trim();
  } catch (e) {
    console.error("translateHeadlineUk failed:", e);
    return "";
  }
}

function stripFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:html)?\s*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

async function translateHtmlUk(html: string): Promise<string> {
  const src = html.trim();
  if (!src) return "";
  if (src.length > 50_000) {
    console.error(`translateHtmlUk: body of ${src.length} chars exceeds the 50000 limit`);
    return "";
  }
  const want = tagSignature(src);

  const basePrompt =
    `Translate the text content of this Russian aesthetic-medicine article into Ukrainian.\n` +
    `Rules:\n` +
    `- Keep the HTML markup byte-for-byte identical: same tags, same order, same attributes.\n` +
    `- Translate ONLY the text between tags, and alt/title attribute values.\n` +
    `- Never change src or href values.\n` +
    `- Do not add, remove, merge or reorder any element.\n` +
    `- Use accurate, natural Ukrainian medical terminology — never transliterated Russian — ` +
    `and keep the register editorial.\n` +
    `- Keep any numbers, prices and units exactly as given.\n` +
    `- Return ONLY the resulting HTML, with no code fence and no commentary.\n\n${src}`;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt:
          attempt === 0
            ? basePrompt
            : `${basePrompt}\n\nIMPORTANT: your previous attempt changed the tag structure. ` +
              `Copy the markup across unchanged and translate only the visible text.`,
      });
      const out = stripFence(text);
      if (out && tagSignature(out) === want) return out;
    }
    console.error("translateHtmlUk: tag structure not preserved after 2 attempts");
    return "";
  } catch (e) {
    console.error("translateHtmlUk failed:", e);
    return "";
  }
}

// ---------------------------------------------------------------- numeric-cell detection
// Table/price cells that are purely numbers, ranges, or a number + a known
// unit (mm, %, currency, ...) must never be sent to the model: no translation
// risk, no wasted calls. Anything with other words (e.g. "3–7 дней") still
// goes through normal headline translation.

const UNIT_RE = /^(мм|см|мл|кг|грн\.?|евро|євро|usd|eur|uah|%)$/i;

function isNumericCell(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (t === "-" || t === "—" || t === "–") return true;
  const m = t.match(/^([\d][\d\s.,–—-]*)(?:\s+(\S+))?$/);
  if (!m) return false;
  const unit = m[2];
  return unit === undefined || UNIT_RE.test(unit);
}

function normalizeCurrencyEn(raw: string): string {
  return raw.replace(/\bгрн\.?\b/gi, "UAH").replace(/\b(евро|євро)\b/gi, "EUR");
}

// ---------------------------------------------------------------- job queue

type Job = { text: string; target: "uk" | "en"; kind: "headline" | "html" };

const headlineResults = new Map<string, string>(); // `${target}::${text}` -> translated
const htmlResults = new Map<string, string>(); // `${target}::${text}` -> translated

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i;

async function runJob(job: Job): Promise<void> {
  const { text, target, kind } = job;
  const key = `${target}::${text}`;
  let out: string;
  // Several "richText.body" values turn out to be plain text (no markup at
  // all) rather than actual HTML. translateHtml's tag-signature check then
  // spuriously fails whenever the model wraps plain text in e.g. <p> out of
  // habit. Route those through the plain-text path instead — there is no
  // structure to preserve, so a straight translation is both correct and
  // more reliable.
  const isPlainText = kind === "html" && !HTML_TAG_RE.test(text);
  if (kind === "headline" || isPlainText) {
    out = target === "uk" ? await translateHeadlineUk(text) : await translateHeadline(text, "en");
  } else {
    out = target === "uk" ? await translateHtmlUk(text) : await translateHtml(text, "en");
  }
  if (kind === "headline") headlineResults.set(key, out);
  else htmlResults.set(key, out);
  if (!out) console.error(`  [FAIL] ${target}/${kind}: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`);
}

async function runPool(jobs: Job[], concurrency: number): Promise<void> {
  let idx = 0;
  let done = 0;
  async function worker() {
    for (;;) {
      const i = idx++;
      if (i >= jobs.length) return;
      await runJob(jobs[i]);
      done++;
      if (done % 20 === 0 || done === jobs.length) {
        console.log(`  translated ${done}/${jobs.length} jobs`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
}

// ---------------------------------------------------------------- collect distinct strings

function collectHeadlineStrings(data: DataRu): Set<string> {
  const set = new Set<string>();
  const add = (s: string | undefined) => {
    if (s && s.trim() && !isNumericCell(s)) set.add(s);
  };
  for (const page of data.pages) {
    for (const s of page.sections) {
      switch (s.type) {
        case "bullets":
          add(s.heading);
          s.items.forEach(add);
          break;
        case "indicationsContraindications":
          add(s.title);
          add(s.indicationsHeading);
          s.indications.forEach(add);
          add(s.contraindicationsHeading);
          s.contraindications.forEach(add);
          break;
        case "priceTable":
          add(s.heading);
          add(s.note);
          for (const r of s.rows) {
            add(r.label);
            add(r.price);
          }
          break;
        case "compareTable":
          add(s.heading);
          s.columns.forEach(add);
          for (const r of s.rows) {
            add(r.label);
            r.values.forEach(add);
          }
          break;
        case "richText":
          add(s.heading);
          break;
      }
    }
  }
  return set;
}

function collectHtmlStrings(data: DataRu): Set<string> {
  const set = new Set<string>();
  for (const page of data.pages) {
    for (const s of page.sections) {
      if (s.type === "richText" && s.body.trim()) set.add(s.body);
    }
  }
  return set;
}

// ---------------------------------------------------------------- build output

function tri(text: string | undefined): Tri {
  const src = (text ?? "").trim() ? (text as string) : "";
  if (!src) return { uk: "", ru: "", en: "" };
  if (isNumericCell(src)) return { uk: src, ru: src, en: normalizeCurrencyEn(src) };
  return {
    uk: headlineResults.get(`uk::${src}`) ?? "",
    ru: src,
    en: headlineResults.get(`en::${src}`) ?? "",
  };
}

function triHtml(text: string | undefined): Tri {
  const src = (text ?? "").trim() ? (text as string) : "";
  if (!src) return { uk: "", ru: "", en: "" };
  return {
    uk: htmlResults.get(`uk::${src}`) ?? "",
    ru: src,
    en: htmlResults.get(`en::${src}`) ?? "",
  };
}

function buildSection(s: SectionRu): SectionI18n {
  switch (s.type) {
    case "bullets":
      return { type: "bullets", heading: tri(s.heading), items: s.items.map(tri), after: s.after };
    case "indicationsContraindications":
      return {
        type: "indicationsContraindications",
        title: tri(s.title),
        indicationsHeading: tri(s.indicationsHeading),
        indications: s.indications.map(tri),
        contraindicationsHeading: tri(s.contraindicationsHeading),
        contraindications: s.contraindications.map(tri),
        after: s.after,
      };
    case "priceTable":
      return {
        type: "priceTable",
        heading: tri(s.heading),
        rows: s.rows.map((r) => ({ label: tri(r.label), price: tri(r.price) })),
        note: tri(s.note),
        after: s.after,
      };
    case "compareTable":
      return {
        type: "compareTable",
        heading: tri(s.heading),
        columns: s.columns.map(tri),
        rows: s.rows.map((r) => ({ label: tri(r.label), values: r.values.map(tri) })),
        after: s.after,
      };
    case "richText":
      return { type: "richText", heading: tri(s.heading), body: triHtml(s.body), after: s.after };
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const data: DataRu = JSON.parse(fs.readFileSync(IN, "utf-8"));

  const headlineStrings = [...collectHeadlineStrings(data)];
  const htmlStrings = [...collectHtmlStrings(data)];

  console.log(`Distinct headline-type strings: ${headlineStrings.length}`);
  console.log(`Distinct richText bodies: ${htmlStrings.length}`);

  const jobs: Job[] = [];
  for (const t of headlineStrings) {
    jobs.push({ text: t, target: "uk", kind: "headline" });
    jobs.push({ text: t, target: "en", kind: "headline" });
  }
  for (const t of htmlStrings) {
    jobs.push({ text: t, target: "uk", kind: "html" });
    jobs.push({ text: t, target: "en", kind: "html" });
  }

  console.log(`Running ${jobs.length} translation jobs at concurrency 8...`);
  await runPool(jobs, 8);

  const distinctStrings = headlineStrings.length + htmlStrings.length;
  const failedUk = headlineStrings.filter((t) => !headlineResults.get(`uk::${t}`)).length +
    htmlStrings.filter((t) => !htmlResults.get(`uk::${t}`)).length;
  const failedEn = headlineStrings.filter((t) => !headlineResults.get(`en::${t}`)).length +
    htmlStrings.filter((t) => !htmlResults.get(`en::${t}`)).length;

  console.log(`\nDistinct strings translated: ${distinctStrings}`);
  console.log(`Failures — uk: ${failedUk}, en: ${failedEn}`);

  const out: DataI18n = {
    pages: data.pages.map((p) => ({ slug: p.slug, sections: p.sections.map(buildSection) })),
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * ТЗ #19 — assemble the seedable page records from three inputs:
 *
 *   scripts/tz19/raw/<slug>.json    Russian copy, extracted from the client's .docx
 *   scripts/tz19/plans/<slug>.json  the page plan: structure + uk/en translations
 *   scripts/tz19/meta.json          titles and descriptions from the metatag sheet
 *
 * A plan never repeats the Russian text. Wherever Russian is needed it points at
 * the extracted document instead — `{"$": 12}` is node 12's paragraph, `{"$":
 * [12,13]}` joins several into one body, `{"$list": 14}` is node 14's bullets.
 * Keeping the one copy means the published Russian is, by construction, the copy
 * the client signed off in Word.
 *
 * Run: node scripts/tz19/build-pages.mjs [slug...]
 * Out: scripts/data/plastic-surgery-tz19.json
 */
import fs from "node:fs";
import path from "node:path";

const RAW = "scripts/tz19/raw";
const PLANS = "scripts/tz19/plans";
const OUT = "scripts/data/plastic-surgery-tz19.json";

const meta = JSON.parse(fs.readFileSync("scripts/tz19/meta.json", "utf-8"));
const images = JSON.parse(fs.readFileSync("scripts/tz19/images/converted.json", "utf-8"));

/** Hero for a page with no photo in its Word document. */
const FALLBACK_HERO = "/images/surgery/operating-room.webp";

class Doc {
  constructor(slug) {
    this.slug = slug;
    this.nodes = JSON.parse(fs.readFileSync(path.join(RAW, `${slug}.json`), "utf-8")).nodes;
    this.used = new Set();
  }
  text(ref) {
    const idxs = Array.isArray(ref) ? ref : [ref];
    return idxs.map((i) => {
      const n = this.nodes[i];
      if (!n) throw new Error(`${this.slug}: no node ${i}`);
      if (n.kind === "list") throw new Error(`${this.slug}: node ${i} is a list, use $list`);
      this.used.add(i);
      return n.text;
    }).join("\n\n");
  }
  list(i) {
    const n = this.nodes[i];
    if (!n || n.kind !== "list") throw new Error(`${this.slug}: node ${i} is not a list`);
    this.used.add(i);
    return n.items;
  }
}

/** Resolve a {uk, ru, en} where `ru` may be a reference into the document. */
function loc(doc, v, where) {
  if (!v || typeof v !== "object") throw new Error(`${doc.slug}: ${where} is not a localised value`);
  const ru = typeof v.ru === "object" && v.ru !== null
    ? doc.text(v.ru.$ ?? (() => { throw new Error(`${doc.slug}: ${where} bad ru ref`); })())
    : v.ru;
  for (const [l, s] of [["uk", v.uk], ["en", v.en], ["ru", ru]]) {
    if (typeof s !== "string" || !s.trim()) throw new Error(`${doc.slug}: ${where} missing ${l}`);
  }
  return { uk: v.uk, ru, en: v.en };
}

/** Resolve a bullet list: Russian from the document, uk/en authored alongside. */
function locList(doc, v, where) {
  // $list: a bullet list node. $lines: one paragraph node per item, for the
  // documents whose lists lost their list formatting in Word. Otherwise the
  // Russian is given inline, for lists the plan derives rather than quotes.
  const ru = v.$list !== undefined ? doc.list(v.$list)
    : v.$lines !== undefined ? v.$lines.map((i) => doc.text(i))
    : v.ru;
  if (!Array.isArray(ru) || !Array.isArray(v.uk) || !Array.isArray(v.en)) {
    throw new Error(`${doc.slug}: ${where} must have uk/en arrays`);
  }
  if (ru.length !== v.uk.length || ru.length !== v.en.length) {
    throw new Error(
      `${doc.slug}: ${where} length mismatch ru=${ru.length} uk=${v.uk.length} en=${v.en.length}`);
  }
  return ru.map((s, i) => ({ uk: v.uk[i], ru: s, en: v.en[i] }));
}

// `alternatives` is deliberately unsupported: its shape pairs a rival approach
// against ours, which does not describe the method comparisons in these
// documents. Those are rendered as plain bullet lists instead.
function buildSection(doc, s, i) {
  const at = (k) => `section ${i} (${s.type}).${k}`;
  const d = {};
  switch (s.type) {
    case "richText":
      d.heading = loc(doc, s.heading, at("heading"));
      d.body = loc(doc, s.body, at("body"));
      if (s.calloutBody) d.calloutBody = loc(doc, s.calloutBody, at("calloutBody"));
      if (s.image) { d.heroImage = s.image; d.heroImageFocalPoint = s.focalPoint ?? "50% 50%"; }
      break;
    case "bullets":
      d.heading = loc(doc, s.heading, at("heading"));
      d.items = locList(doc, s.items, at("items"));
      break;
    case "indicationsContraindications":
      d.indicationsHeading = loc(doc, s.indicationsHeading, at("indicationsHeading"));
      d.indications = locList(doc, s.indications, at("indications"));
      d.contraindicationsHeading = loc(doc, s.contraindicationsHeading, at("contraindicationsHeading"));
      d.contraindications = locList(doc, s.contraindications, at("contraindications"));
      break;
    case "callout":
      d.tone = s.tone ?? "info";
      d.body = loc(doc, s.body, at("body"));
      break;
    case "steps":
      d.heading = loc(doc, s.heading, at("heading"));
      // StepsSection prints its own 01, 02… so a source heading like
      // "1. Консультация" would show its number twice.
      d.steps = s.steps.map((st, j) => ({
        title: Object.fromEntries(Object.entries(loc(doc, st.title, at(`steps[${j}].title`)))
          .map(([l, t]) => [l, t.replace(/^\s*\d+[.)]\s*/, "")])),
        description: loc(doc, st.description, at(`steps[${j}].description`)),
      }));
      break;
    default:
      throw new Error(`${doc.slug}: unknown section type "${s.type}"`);
  }
  return { type: s.type, data: d };
}

function buildPage(slug) {
  const plan = JSON.parse(fs.readFileSync(path.join(PLANS, `${slug}.json`), "utf-8"));
  const doc = new Doc(slug);
  const m = meta[slug];
  if (!m) throw new Error(`${slug}: no metatag row`);

  const hero = plan.heroImage ?? images[slug]?.hero ?? FALLBACK_HERO;
  const page = {
    slug,
    sortOrder: plan.sortOrder,
    related: plan.related,
    h1: { uk: m.name.uk, ru: m.name.ru, en: m.name.en },
    title: loc(doc, plan.title, "title"),
    summary: loc(doc, plan.summary, "summary"),
    seoTitle: m.seoTitle,
    seoDescription: m.seoDescription,
    heroImage: hero,
    sections: plan.sections.map((s, i) => buildSection(doc, s, i)),
    faq: plan.faq.map((f, i) => ({
      question: loc(doc, f.question, `faq[${i}].question`),
      answer: loc(doc, f.answer, `faq[${i}].answer`),
    })),
  };

  const coverage = Math.round((doc.used.size / doc.nodes.length) * 100);
  return { page, coverage, used: doc.used.size, nodes: doc.nodes.length };
}

const only = process.argv.slice(2);
const slugs = fs.readdirSync(PLANS).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5))
  .filter((s) => !only.length || only.includes(s))
  .sort((a, b) => a.localeCompare(b));

const pages = [];
for (const slug of slugs) {
  const { page, coverage, used, nodes } = buildPage(slug);
  pages.push(page);
  console.log(
    `${slug.padEnd(34)} ${String(page.sections.length).padStart(2)} sections  ` +
    `${String(page.faq.length).padStart(2)} FAQ  ${used}/${nodes} source nodes (${coverage}%)`,
  );
}
pages.sort((a, b) => a.sortOrder - b.sortOrder);

if (!only.length) {
  fs.writeFileSync(OUT, JSON.stringify({ categorySlug: "plastic-surgery", pages }, null, 1));
  console.log(`\n${pages.length} pages -> ${OUT}`);
} else {
  console.log(`\n${pages.length} page(s) built (partial run, ${OUT} not written)`);
}

/**
 * Extracts the Inweb "дооптимізація" RU copy (exported Google Doc, HTML) into
 * structured JSON consumed by the translate + seed tasks.
 *
 * Usage: npx tsx scripts/dooptim/extract-copy.ts
 *
 * The source is a hand-made document, not a schema, so block boundaries are
 * hard-coded per page from the headings (see PAGES below) rather than inferred.
 */
import * as fs from "fs";
import * as path from "path";

const SRC = path.join(
  process.cwd(),
  "tasks_inweb/genevity.com.ua _ Тексти №1 _ Дооптимізація _ 14 000/genevity.com.ua114000.html",
);
const OUT = path.join(process.cwd(), "scripts/dooptim/copy-ru.json");

const CELL = " ||| ";

// ---------------------------------------------------------------- types

type Section =
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

// ---------------------------------------------------------------- flatten

const NAMED: Record<string, string> = {
  nbsp: " ", lt: "<", gt: ">", quot: '"', apos: "'",
  mdash: "—", ndash: "–", hellip: "…", laquo: "«", raquo: "»",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", sbquo: "‚", bdquo: "„",
  reg: "®", copy: "©", trade: "™", deg: "°", minus: "−", plusmn: "±",
  times: "×", divide: "÷", middot: "·", bull: "•", euro: "€", sect: "§",
  frac12: "½", frac14: "¼", frac34: "¾", sup2: "²", sup3: "³", shy: "",
};

function unescapeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, name: string) =>
      name in NAMED ? NAMED[name] : name.toLowerCase() === "amp" ? "&" : m,
    )
    .replace(/&amp;/g, "&");
}

const BLOCK_TAGS = "p|div|br|li|ul|ol|h[1-6]|tr|table|tbody|thead|caption";

/**
 * Flattens the exported HTML into one logical line per paragraph / table row.
 * Block tags *inside* table cells become spaces first — otherwise a paragraph
 * inside a cell would shatter the row across several lines.
 */
function flatten(html: string): string[] {
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");

  // images -> marker (dropped later, kept so the dump is diffable)
  s = s.replace(/<img\b[^>]*>/gi, "\n[IMG]\n");

  // cells: neutralise inner block tags, then emit the cell separator
  s = s.replace(
    /<(t[dh])\b[^>]*>([\s\S]*?)<\/\1>/gi,
    (_m, _tag, inner: string) =>
      inner.replace(new RegExp(`</?(?:${BLOCK_TAGS})\\b[^>]*>`, "gi"), " ") + CELL,
  );

  s = s.replace(/<\/tr\s*>/gi, "\n");
  s = s.replace(new RegExp(`</?(?:${BLOCK_TAGS})\\b[^>]*>`, "gi"), "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = unescapeEntities(s);
  s = s.replace(/ /g, " ");

  return s
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .map((l) => l.replace(/(\s*\|\|\|\s*)+$/, "").trim())
    .filter((l) => l.length > 0);
}

// ------------------------------------------------------------ page split

const PAGE_MARKER = /^№(\d+)\s+(https?:\S+)/;

function isNoise(line: string): boolean {
  return (
    line === "…" ||
    line === "[IMG]" ||
    /^\d+\s+сбп$/.test(line) ||
    /^Итог: символов без пробелов/.test(line)
  );
}

// ------------------------------------------------------------ block table

type Block =
  | { kind: "bullets"; heading: string; out: string; after?: string }
  | { kind: "richText"; heading: string; out?: string; after?: string }
  | { kind: "priceTable"; heading: string; note?: string; after?: string }
  | { kind: "compareTable"; heading: string; after?: string }
  | {
      kind: "ic";
      heading: string; // indications heading
      contraHeading: string;
      title: string;
      after?: string;
    };

interface PageSpec {
  slug: string;
  /** Every heading in the page, in document order, that terminates a block. */
  boundaries: string[];
  blocks: Block[];
}

const EMS = "EMSCULPT NEO";
const ULT = "Ultraformer MPT";
const EXI = "Exion Body";

const PAGES: PageSpec[] = [
  {
    slug: "body",
    boundaries: [
      "Длительность",
      "Эффект",
      "Стоимость",
      "Как проходит процедура",
      "Результаты",
      "Результат",
      "Курс",
      "Зоны",
      "Показания",
      "Противопоказания",
      "Фото “До и после”",
      "Цена",
      "Ultraformer MPT для тела – ультразвуковой лифтинг кожи",
      "Exion Body – RF-коррекция текстуры и целлюлита",
      "Подготовка и рекомендации после аппаратных процедур для тела",
    ],
    blocks: [
      {
        kind: "ic",
        heading: "Показания",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
        after: EMS,
      },
      { kind: "richText", heading: "Цена", after: EMS },
      {
        kind: "ic",
        heading: "Показания",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
        after: ULT,
      },
      { kind: "richText", heading: "Цена", after: ULT },
      {
        kind: "ic",
        heading: "Показания",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
        after: EXI,
      },
      { kind: "richText", heading: "Цена", after: EXI },
      {
        kind: "bullets",
        heading: "Подготовка и рекомендации после аппаратных процедур для тела",
        out: "",
      },
    ],
  },
  {
    slug: "splendor-x",
    boundaries: [
      "Стоимость",
      "Подготовка к процедуре",
      "Показания к Splendor X",
      "Противопоказания",
      "Splendor X – единственный лазер", // callout, already on the page
      "Рекомендации после процедуры",
      "Как проходит лазерная эпиляция Splendor X",
      "Поэтапные результаты после сеансов Splendor X",
      "Преимущества лазерной эпиляции Splendor X",
      "Полный прайс по зонам (за один сеанс)",
    ],
    blocks: [
      { kind: "richText", heading: "Подготовка к процедуре" },
      {
        kind: "ic",
        heading: "Показания к Splendor X",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
      },
      { kind: "richText", heading: "Рекомендации после процедуры" },
      { kind: "richText", heading: "Поэтапные результаты после сеансов Splendor X" },
      { kind: "compareTable", heading: "Полный прайс по зонам (за один сеанс)" },
    ],
  },
  {
    slug: "emsculpt-neo",
    boundaries: [
      "Стоимость",
      "Показания к EMSCULPT NEO",
      "Противопоказания",
      "EMSCULPT NEO за один сеанс заменяет", // callout, already on the page
      "Результат процедуры",
      "Стоимость процедуры",
      "Как проходит процедура EMSCULPT NEO",
    ],
    blocks: [
      {
        kind: "ic",
        heading: "Показания к EMSCULPT NEO",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
      },
      { kind: "richText", heading: "Результат процедуры" },
      { kind: "priceTable", heading: "Стоимость процедуры", note: "" },
    ],
  },
  {
    slug: "ultraformer-mpt-body",
    boundaries: [
      "Стоимость",
      "Показания к Ultraformer MPT для тела",
      "Противопоказания",
      "Ультраформер для тела – это подтяжка кожи", // callout, already on the page
      "Сравнение методов",
      "Цены",
      "Фото “До и после”",
      "Результаты по этапам курса",
      "Как проходит процедура Ultraformer MPT для тела",
    ],
    blocks: [
      {
        kind: "ic",
        heading: "Показания к Ultraformer MPT для тела",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
      },
      { kind: "compareTable", heading: "Сравнение методов" },
      { kind: "compareTable", heading: "Цены" },
      { kind: "richText", heading: "Результаты по этапам курса" },
    ],
  },
  {
    slug: "exion-body",
    boundaries: [
      "Стоимость",
      "Показания к Exion Body",
      "Противопоказания",
      "Exion Body – единственная RF-процедура", // callout, already on the page
      "Фото “До и после”",
      "Результаты процедуры",
      "Цены",
      "Этапы процедуры Exion Body",
    ],
    blocks: [
      {
        kind: "ic",
        heading: "Показания к Exion Body",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
      },
      { kind: "richText", heading: "Результаты процедуры" },
    ],
  },
  {
    slug: "m22-stellar-black",
    boundaries: [
      "Стоимость",
      "Фото “До и После”",
      "Когда лучше всего делать процедуру",
      "Показания к M22 Stellar Black",
      "Противопоказания",
      "M22 Stellar Black – единственный аппарат", // callout, already on the page
      "Как проходит процедура M22 Stellar Black",
      "Рекомендации после проведения процедуры",
      "Поэтапные результаты",
      "Цены",
      "Преимущества и особенности M22 Stellar Black",
    ],
    blocks: [
      { kind: "richText", heading: "Когда лучше всего делать процедуру" },
      {
        kind: "ic",
        heading: "Показания к M22 Stellar Black",
        contraHeading: "Противопоказания",
        title: "Показания и противопоказания",
      },
      { kind: "richText", heading: "Рекомендации после проведения процедуры" },
      { kind: "richText", heading: "Поэтапные результаты" },
    ],
  },
];

// ---------------------------------------------------------------- parsing

const isBoundary = (line: string, boundaries: string[]) =>
  boundaries.some((b) => line === b || line.startsWith(b));

/** Finds `heading` at or after `from`; returns [headingIndex, bodyLines, nextIndex]. */
function takeBlock(
  lines: string[],
  from: number,
  heading: string,
  boundaries: string[],
  slug: string,
): { body: string[]; next: number } {
  let i = from;
  while (i < lines.length && lines[i] !== heading) i++;
  if (i >= lines.length) throw new Error(`[${slug}] heading not found after line ${from}: "${heading}"`);
  const body: string[] = [];
  let j = i + 1;
  for (; j < lines.length; j++) {
    if (isBoundary(lines[j], boundaries)) break;
    body.push(lines[j]);
  }
  return { body, next: j };
}

function tableRows(body: string[], heading: string, slug: string): string[][] {
  const rows: string[][] = [];
  for (const line of body) {
    if (!line.includes(CELL.trim())) break; // table ends at the first prose line
    rows.push(line.split(CELL.trim()).map((c) => c.trim()));
  }
  if (rows.length < 2) throw new Error(`[${slug}] table "${heading}" has ${rows.length} row(s)`);
  const width = rows[0].length;
  for (const r of rows)
    if (r.length !== width)
      throw new Error(`[${slug}] table "${heading}": row [${r.join(" | ")}] has ${r.length} cells, header has ${width}`);
  return rows;
}

function parsePage(spec: PageSpec, lines: string[]): { slug: string; sections: Section[] } {
  const sections: Section[] = [];
  let cursor = 0;

  for (const block of spec.blocks) {
    const { body, next } = takeBlock(lines, cursor, block.heading, spec.boundaries, spec.slug);
    cursor = next;

    switch (block.kind) {
      case "bullets": {
        sections.push({ type: "bullets", heading: block.heading, items: body, ...(block.after ? { after: block.after } : {}) });
        break;
      }
      case "richText": {
        sections.push({ type: "richText", heading: block.heading, body: body.join("\n\n"), ...(block.after ? { after: block.after } : {}) });
        break;
      }
      case "ic": {
        const contra = takeBlock(lines, cursor, block.contraHeading, spec.boundaries, spec.slug);
        cursor = contra.next;
        sections.push({
          type: "indicationsContraindications",
          title: block.title,
          indicationsHeading: block.heading,
          indications: body,
          contraindicationsHeading: block.contraHeading,
          contraindications: contra.body,
          ...(block.after ? { after: block.after } : {}),
        });
        break;
      }
      case "priceTable": {
        const rows = tableRows(body, block.heading, spec.slug);
        if (rows[0].length !== 2)
          throw new Error(`[${spec.slug}] priceTable "${block.heading}" expects 2 columns, got ${rows[0].length}`);
        sections.push({
          type: "priceTable",
          heading: block.heading,
          rows: rows.slice(1).map(([label, price]) => ({ label, price })),
          note: block.note ?? "",
          ...(block.after ? { after: block.after } : {}),
        });
        break;
      }
      case "compareTable": {
        const rows = tableRows(body, block.heading, spec.slug);
        sections.push({
          type: "compareTable",
          heading: block.heading,
          columns: rows[0].slice(1),
          rows: rows.slice(1).map((r) => ({ label: r[0], values: r.slice(1) })),
          ...(block.after ? { after: block.after } : {}),
        });
        break;
      }
    }
  }
  return { slug: spec.slug, sections };
}

// ------------------------------------------------------------------ main

function main() {
  const html = fs.readFileSync(SRC, "utf-8");
  const all = flatten(html);

  if (process.argv.includes("--dump")) {
    fs.writeFileSync(
      path.join(process.cwd(), "scripts/dooptim/.flat.txt"),
      all.map((l, i) => `${String(i).padStart(4)}| ${l}`).join("\n") + "\n",
    );
  }

  // split on the "№N <url>" page markers
  const chunks: string[][] = [];
  let current: string[] | null = null;
  for (const line of all) {
    if (PAGE_MARKER.test(line)) {
      current = [];
      chunks.push(current);
      continue;
    }
    if (current) current.push(line);
  }
  if (chunks.length !== PAGES.length)
    throw new Error(`expected ${PAGES.length} page markers, found ${chunks.length}`);

  const out = {
    pages: PAGES.map((spec, i) => parsePage(spec, chunks[i].filter((l) => !isNoise(l)))),
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

  console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
  for (const p of out.pages) {
    console.log(`  ${p.slug}: ${p.sections.length} sections — ${p.sections.map((s) => s.type).join(", ")}`);
  }
}

main();

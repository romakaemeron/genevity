import ExcelJS from "exceljs";

/** The only sheet in the Геліос workbook that belongs to GENEVITY. */
export const GENEVITY_SHEET = "прайс GENEVITY (Гончара)";

export interface ParsedItem {
  roappServiceId: string | null;
  nameUk: string;
  duration: string | null;
  price: string;
  priceNumeric: number | null;
  noteUk: string | null;
}

export interface ParsedSubcategory {
  labelUk: string;
  items: ParsedItem[];
}

export interface ParsedCategory {
  index: number;
  labelUk: string;
  subcategories: ParsedSubcategory[];
}

/**
 * The sheet mixes "40 000" (spaced thousands, sometimes NBSP), Excel floats
 * like "950.0", and bare "10". Keep a clean display string, derive an integer
 * for structured data. Returns numeric: null when nothing parses.
 */
export function parsePrice(raw: string): { display: string; numeric: number | null } {
  const normalized = String(raw).replace(/ /g, " ").trim();
  const digits = normalized.replace(/[\s]/g, "");
  const asFloat = Number(digits.replace(",", "."));
  if (!Number.isFinite(asFloat)) return { display: normalized, numeric: null };
  const numeric = Math.round(asFloat);
  // "950.0" should display as "950"; "40 000" should keep its spacing.
  const display = /\.\d+$/.test(normalized) ? String(numeric) : normalized;
  return { display, numeric };
}

function cellText(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  const v = cell.value;
  if (typeof v === "object" && "richText" in v) {
    return (v.richText as { text: string }[]).map((t) => t.text).join("").trim();
  }
  if (typeof v === "object" && "text" in v) return String((v as { text: string }).text).trim();
  if (typeof v === "object" && "result" in v) return String((v as { result: unknown }).result ?? "").trim();
  return String(v).trim();
}

/** Excel stores the duration 90 as "90.0"; keep "15/30" as written. */
function normalizeDuration(raw: string): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isFinite(n)) return String(Math.round(n));
  return raw;
}

/** Column A holds a service id like 10001, or a category index 1–8. */
function normalizeServiceId(raw: string): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return String(Math.round(n));
}

export async function parseGenevitySheet(buffer: Buffer): Promise<ParsedCategory[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = wb.getWorksheet(GENEVITY_SHEET);
  if (!sheet) throw new Error(`Sheet not found: ${GENEVITY_SHEET}`);

  const categories: ParsedCategory[] = [];
  let currentCategory: ParsedCategory | null = null;
  let currentSub: ParsedSubcategory | null = null;
  // The sheet opens with a "Консультації лікарів" block (col A = 0, a header
  // row followed by 24 items) that sits before category 1's header row. It
  // isn't one of the 8 numbered categories, but its rows are real items and
  // must not be dropped. Buffer them here and splice them in as category 1's
  // first subcategory once category 1's header row is seen.
  let pendingSub: ParsedSubcategory | null = null;

  sheet.eachRow((row) => {
    const a = cellText(row.getCell(1));
    const b = cellText(row.getCell(2));
    const c = cellText(row.getCell(3));
    const d = cellText(row.getCell(4));
    const e = cellText(row.getCell(5));

    if (!b) return;                       // blank or spacer row

    const aNum = a ? Number(a) : NaN;
    const hasPrice = d !== "" && /\d/.test(d);

    // Category header: small integer index in A, no price.
    if (!hasPrice && Number.isFinite(aNum) && aNum >= 1 && aNum <= 8 && Number.isInteger(aNum)) {
      currentCategory = { index: aNum, labelUk: b, subcategories: [] };
      if (pendingSub) {
        currentCategory.subcategories.push(pendingSub);
        pendingSub = null;
      }
      currentSub = null;
      categories.push(currentCategory);
      return;
    }

    // Subcategory header: text in B alone, no price.
    if (!hasPrice) {
      const sub: ParsedSubcategory = { labelUk: b, items: [] };
      currentSub = sub;
      if (currentCategory) {
        currentCategory.subcategories.push(sub);
      } else {
        // Header appears before any numbered category (e.g. the leading
        // "Консультації лікарів" block) — buffer it for the next category.
        pendingSub = sub;
      }
      return;
    }

    // Item.
    if (!currentSub) {
      currentSub = { labelUk: "", items: [] };
      if (currentCategory) {
        currentCategory.subcategories.push(currentSub);
      } else {
        pendingSub = currentSub;
      }
    }
    const { display, numeric } = parsePrice(d);
    currentSub.items.push({
      roappServiceId: normalizeServiceId(a),
      nameUk: b,
      duration: normalizeDuration(c),
      price: display,
      priceNumeric: numeric,
      noteUk: e || null,
    });
  });

  // Drop header-only subcategories left empty by spacer rows.
  for (const cat of categories) {
    cat.subcategories = cat.subcategories.filter((s) => s.items.length > 0);
  }
  return categories;
}

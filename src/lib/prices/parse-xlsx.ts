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

/** Column A holds a service id like 10001, or a category index 0–8. */
function normalizeServiceId(raw: string): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return String(Math.round(n));
}

/**
 * A cell only counts as a price if it actually contains a numeric value.
 * The consultations block's header row puts the unit label "грн" in column D
 * — that must not be mistaken for a price (it has no digits, so this already
 * excludes it, but the check is written explicitly so the intent is clear).
 */
function isPriceCell(raw: string): boolean {
  return raw !== "" && /\d/.test(raw);
}

export async function parseGenevitySheet(buffer: Buffer): Promise<ParsedCategory[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = wb.getWorksheet(GENEVITY_SHEET);
  if (!sheet) throw new Error(`Sheet not found: ${GENEVITY_SHEET}`);

  const categories: ParsedCategory[] = [];
  let currentCategory: ParsedCategory | null = null;
  let currentSub: ParsedSubcategory | null = null;

  sheet.eachRow((row) => {
    const a = cellText(row.getCell(1));
    const b = cellText(row.getCell(2));
    const c = cellText(row.getCell(3));
    const d = cellText(row.getCell(4));
    const e = cellText(row.getCell(5));

    if (!b) return;                       // blank or spacer row

    const aNum = a ? Number(a) : NaN;
    const hasPrice = isPriceCell(d);

    // Category header: small integer index in A (0–8, 0 is the "Консультації
    // лікарів" block that precedes the 8 numbered categories), no price.
    if (!hasPrice && Number.isFinite(aNum) && aNum >= 0 && aNum <= 8 && Number.isInteger(aNum)) {
      currentCategory = { index: aNum, labelUk: b, subcategories: [] };
      currentSub = null;
      categories.push(currentCategory);
      return;
    }

    // Subcategory header: text in B alone, no price.
    if (!hasPrice) {
      if (!currentCategory) return;       // headers above category 0 are ignored
      currentSub = { labelUk: b, items: [] };
      currentCategory.subcategories.push(currentSub);
      return;
    }

    // Item.
    if (!currentCategory) return;
    if (!currentSub) {
      currentSub = { labelUk: "", items: [] };
      currentCategory.subcategories.push(currentSub);
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

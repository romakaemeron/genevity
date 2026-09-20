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
  /**
   * The sheet has a third, unlabelled hierarchy level: a header row followed
   * immediately by another header row rather than by items — "Exion" above
   * "1. Фракційний мікроігольчастий RF", "Естетична хірургія" above "Пластика".
   * Such a group header owns no items, so unless it is carried on its children
   * its text is lost entirely. taxonomy.ts decides how to present it; the
   * parser only records it.
   */
  groupUk: string | null;
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
  const normalized = String(raw).replace(/\u00A0/g, " ").trim();
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
  // The sheet encodes its third hierarchy level in bold, not position: a
  // bold header row (e.g. "Exion", "RF-ліфтінг") sets the group that any
  // following *non-bold* header rows belong to, until the next bold header
  // supersedes it or the category ends. A bold header that goes on to own
  // items itself (SMAS-ліфтінг ULTRAFORMER, EmFace, Volnewmer, ...) is an
  // ordinary subcategory — groupUk: null — it IS the group, not a member.
  let currentGroup: string | null = null;

  sheet.eachRow((row) => {
    const a = cellText(row.getCell(1));
    const bCell = row.getCell(2);
    const b = cellText(bCell);
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
      currentGroup = null;                // groups never cross a category boundary
      categories.push(currentCategory);
      return;
    }

    // Subcategory header: text in B alone, no price.
    if (!hasPrice) {
      if (!currentCategory) return;       // headers above category 0 are ignored

      const bold = bCell.font?.bold === true;
      let groupUk: string | null;
      if (bold) {
        // Either a group umbrella (if it turns out to own no items — dropped
        // by the empty-subcategory filter below) or an ordinary subcategory
        // that happens to be bold. Either way it does not belong to a group.
        groupUk = null;
        currentGroup = b;
      } else {
        groupUk = currentGroup;
      }

      const sub: ParsedSubcategory = { labelUk: b, groupUk, items: [] };
      currentSub = sub;
      currentCategory.subcategories.push(sub);
      return;
    }

    // Item.
    if (!currentCategory) return;
    if (!currentSub) {
      currentSub = { labelUk: "", groupUk: null, items: [] };
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

  // Drop header-only subcategories left empty by spacer rows or bare group
  // titles — their text has already been carried onto their children's
  // groupUk above, so nothing is lost here.
  for (const cat of categories) {
    cat.subcategories = cat.subcategories.filter((s) => s.items.length > 0);
  }
  return categories;
}

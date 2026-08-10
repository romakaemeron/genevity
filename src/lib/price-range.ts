/**
 * Price-range extraction for the `AggregateOffer` schema on service pages
 * (SEO TZ #11 §6 — "Розмітка «Діапазон цін» для сторінок послуг").
 *
 * Prices live in `section.priceTable` rows as free-form localized strings —
 * "9 500 грн", "від 1 500 грн", "від 5 000 до 45 000 грн залежно від зони",
 * "89 евро". This parses those into numbers so we can emit lowPrice /
 * highPrice / offerCount without asking editors to maintain a second,
 * machine-readable copy of every price.
 */

import type { ContentSection } from "@/lib/db/types";

/** ISO 4217 code inferred from the currency word/symbol in a price string. */
type Currency = "UAH" | "EUR" | "USD";

const CURRENCY_PATTERNS: [Currency, RegExp][] = [
  ["UAH", /грн|₴|\buah\b|гривень|гривні/i],
  ["EUR", /евро|євро|€|\beur\b/i],
  ["USD", /долар|доллар|\$|\busd\b/i],
];

/** Space characters used as thousands separators in the CMS copy. */
const GROUP_SEPARATORS = /[\s   ']/g;

/** Matches "9 500", "1100", "45 000" — digits optionally grouped by spaces. */
const NUMBER_TOKEN = /\d[\d\s   ']*\d|\d/g;

function detectCurrency(text: string): Currency | null {
  for (const [code, re] of CURRENCY_PATTERNS) {
    if (re.test(text)) return code;
  }
  return null;
}

/**
 * All monetary amounts mentioned in one price string. A range like
 * "від 5 000 до 45 000 грн" yields both ends so the page's low/high widen
 * correctly.
 */
export function parseAmounts(price: string): number[] {
  const matches = price.match(NUMBER_TOKEN);
  if (!matches) return [];
  const out: number[] = [];
  for (const m of matches) {
    const n = Number(m.replace(GROUP_SEPARATORS, ""));
    // Guard against years, room numbers and other stray digits sneaking in
    // from a note ("до 45 000 грн залежно від 3 зон").
    if (Number.isFinite(n) && n > 0) out.push(n);
  }
  return out;
}

export interface PriceRange {
  currency: Currency;
  lowPrice: number;
  highPrice: number;
  /** Number of priced rows — "кількість різних видів послуг з цінами". */
  offerCount: number;
}

/**
 * Derive a single price range from every `priceTable` section on a page.
 *
 * Rows are grouped by the currency named in the row itself; the currency
 * with the most rows wins so a page priced entirely in euro (emsculpt-neo)
 * doesn't get labelled UAH, and a stray euro row on a hryvnia page doesn't
 * corrupt the range. Returns null when the page has no price block at all —
 * the TZ only asks for this markup on pages that show prices.
 */
export function getPriceRange(sections: ContentSection[]): PriceRange | null {
  const byCurrency = new Map<Currency, number[]>();

  for (const section of sections) {
    if (section._type !== "section.priceTable") continue;
    for (const row of section.rows || []) {
      const raw = (row?.price || "").trim();
      if (!raw) continue;
      const amounts = parseAmounts(raw);
      if (!amounts.length) continue;
      // No currency word on the row (rare) — assume the site default.
      const currency = detectCurrency(raw) ?? "UAH";
      const bucket = byCurrency.get(currency) ?? [];
      // One entry per row, holding that row's min and max, so offerCount
      // counts rows while low/high see every endpoint of a range.
      bucket.push(Math.min(...amounts), Math.max(...amounts));
      byCurrency.set(currency, bucket);
    }
  }

  if (!byCurrency.size) return null;

  let best: { currency: Currency; amounts: number[] } | null = null;
  for (const [currency, amounts] of byCurrency) {
    if (!best || amounts.length > best.amounts.length) best = { currency, amounts };
  }
  if (!best) return null;

  return {
    currency: best.currency,
    lowPrice: Math.min(...best.amounts),
    highPrice: Math.max(...best.amounts),
    // Two amounts were pushed per row (min + max of that row).
    offerCount: best.amounts.length / 2,
  };
}

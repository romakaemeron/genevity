import type { ParsedCategory, ParsedItem, ParsedSubcategory } from "./parse-xlsx";

export interface CatalogueItem extends ParsedItem {
  isVisible: boolean;
}
export interface CatalogueSubcategory {
  slug: string;
  labelUk: string;
  isVisible: boolean;
  items: CatalogueItem[];
}
export interface CatalogueCategory {
  slug: string;
  labelUk: string;
  isVisible: boolean;
  subcategories: CatalogueSubcategory[];
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya", ъ: "", ы: "y", э: "e", ё: "e",
};

/** Stable URL key for a Ukrainian label. Latin characters pass through. */
export function slugify(uk: string): string {
  return uk
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/['’ʼ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Rows that must not appear on a public aesthetic-medicine price list:
 * oncological excision, biopsy, circumcision and intimate injections.
 * Matched as case-insensitive substrings of the Ukrainian name.
 */
const HIDDEN_ITEM_PATTERNS = [
  "базально-клітинної карциноми",
  "панч-біопсія",
  "циркумцизія",
  "статевого члена",
];

/**
 * Rows whose name in the spreadsheet is internal shorthand that would be
 * meaningless — or actively broken — on a public page. The sheet files three
 * PolyPhil variants under the "PolyPhil" subcategory as bare "hair", "eye" and
 * "next", which would render as price rows called "next — 7 800 ₴".
 *
 * Renaming is safe across re-imports because the diff matches on
 * roapp_service_id first, and all three rows carry one.
 */
const ITEM_RENAMES: Record<string, string> = {
  hair: "PolyPhil Hair",
  eye: "PolyPhil Eye",
  next: "PolyPhil Next",
};

/** Category-8 subcategories that belong with the injectables instead. */
const MOVE_TO_INJECTABLES = ["Нітковий ліфтинг", "Ліпофілінг"];

const INJECTABLES_INDEX = 3;
const MIXED_INDEX = 8;
/** The consultations block at the top of the sheet. Never imported: the
 *  consultations category on the site is curated by hand and carries prices
 *  the spreadsheet deliberately disagrees with. */
const CONSULTATIONS_INDEX = 0;

function isHidden(name: string): boolean {
  const lower = name.toLowerCase();
  return HIDDEN_ITEM_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

/** The sheet numbers some subcategories ("1. Фракційний…"); that is a
 *  spreadsheet artifact, not part of the name. */
function stripNumberPrefix(label: string): string {
  return label.replace(/^\s*\d+\.\s*/, "");
}

/**
 * Compose the display label. A group header ("Exion") is folded into its
 * child ("1. Фракційний мікроігольчастий RF") so the device name survives:
 * "Exion — Фракційний мікроігольчастий RF". Without this the user sees a bare
 * numbered fragment and no way to tell which device it belongs to.
 */
function composeLabel(sub: ParsedSubcategory): string {
  const own = stripNumberPrefix(sub.labelUk);
  if (!sub.groupUk) return own;
  if (!own) return sub.groupUk;
  return `${sub.groupUk} — ${own}`;
}

/**
 * `dropGroup` is for a subcategory being relocated out of its source category:
 * once "Ліпофілінг" sits under Ін'єкційна косметологія, prefixing it with its
 * old umbrella ("Естетична медицина — Ліпофілінг") describes where it came
 * from rather than what it is.
 */
function toCatalogueSub(
  sub: ParsedSubcategory,
  visible: boolean,
  dropGroup = false,
): CatalogueSubcategory {
  const labelUk = dropGroup ? stripNumberPrefix(sub.labelUk) : composeLabel(sub);
  return {
    slug: slugify(labelUk) || "inshe",
    labelUk,
    isVisible: visible,
    items: sub.items.map((i) => ({
      ...i,
      nameUk: ITEM_RENAMES[i.nameUk] ?? i.nameUk,
      isVisible: visible && !isHidden(i.nameUk),
    })),
  };
}

export function applyTaxonomy(parsed: ParsedCategory[]): CatalogueCategory[] {
  const out: CatalogueCategory[] = [];
  const mixed = parsed.find((c) => c.index === MIXED_INDEX);

  for (const cat of parsed) {
    if (cat.index === CONSULTATIONS_INDEX) continue;   // never imported
    if (cat.index === MIXED_INDEX) continue;           // handled below

    const subs = cat.subcategories.map((s) => toCatalogueSub(s, true));

    if (cat.index === INJECTABLES_INDEX && mixed) {
      for (const name of MOVE_TO_INJECTABLES) {
        const moved = mixed.subcategories.find((s) => s.labelUk === name);
        if (moved) subs.push(toCatalogueSub(moved, true, true));
      }
    }

    out.push({
      slug: slugify(cat.labelUk),
      labelUk: cat.labelUk,
      isVisible: true,
      subcategories: subs,
    });
  }

  if (mixed) {
    const drips: CatalogueSubcategory[] = [];
    const surgery: CatalogueSubcategory[] = [];

    for (const sub of mixed.subcategories) {
      if (MOVE_TO_INJECTABLES.includes(sub.labelUk)) continue;   // already moved
      // The sheet's category-8 heading row itself carries the single drip item.
      if (sub.labelUk === "" || sub.labelUk === mixed.labelUk) {
        drips.push(toCatalogueSub(sub, false));
        continue;
      }
      surgery.push(toCatalogueSub(sub, true));
    }

    if (surgery.length) {
      out.push({
        slug: slugify("Естетична хірургія"),
        labelUk: "Естетична хірургія",
        isVisible: true,
        subcategories: surgery,
      });
    }
    if (drips.length) {
      out.push({
        slug: slugify("Крапельниці"),
        labelUk: "Крапельниці",
        isVisible: false,
        subcategories: drips,
      });
    }
  }

  return out;
}

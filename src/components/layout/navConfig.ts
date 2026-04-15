// Navigation config for the mega menu + footer.
// URL policy (locked 2026-04-15 with client):
//   - Latin, English-semantic, human-readable
//   - Single slug per page, shared across all locales (UA/RU/EN)
//   - Locale prefix provided by next-intl routing
// See docs/superpowers/plans/2026-04-15-genevity-v2-site.md §5.

export type Locale = "ua" | "ru" | "en";

type Translated = Record<Locale, string>;

export type NavLeaf = {
  key: string;
  label: Translated;
  href: string;
};

export type NavCategory = {
  key: string;
  label: Translated;
  href: string;
  items: NavLeaf[];
};

export type NavTop = {
  key: string;
  label: Translated;
  href: string;
  mega?: {
    categories: NavCategory[];
    extra?: {
      label: Translated;
      items: NavLeaf[];
    };
  };
};

const L = (ua: string, ru: string, en: string): Translated => ({ ua, ru, en });

// --- Route constants (single source of truth) ---
const R = {
  home: "/",
  about: "/about",
  prices: "/prices",
  services: "/services",
  stationary: "/stationary",
  laboratory: "/laboratory",
  doctors: "/doctors",
  contacts: "/contacts",

  injectable: "/services/injectable-cosmetology",
  injectableBotulinum: "/services/injectable-cosmetology/botulinum-therapy",
  injectableContour: "/services/injectable-cosmetology/contour-plasty",
  injectableBioreval: "/services/injectable-cosmetology/biorevitalisation",
  injectableMeso: "/services/injectable-cosmetology/mesotherapy",
  injectablePrp: "/services/injectable-cosmetology/prp-therapy",
  injectableExosomes: "/services/injectable-cosmetology/exosomes",
  injectableStemCells: "/services/injectable-cosmetology/stem-cell-therapy",
  injectableRejuran: "/services/injectable-cosmetology/rejuran",
  injectableJuvederm: "/services/injectable-cosmetology/juvederm",
  injectablePolyphil: "/services/injectable-cosmetology/polyphil",

  apparatus: "/services/apparatus-cosmetology",
  apparatusFace: "/services/apparatus-cosmetology/face",
  apparatusFaceEmface: "/services/apparatus-cosmetology/face/emface",
  apparatusFaceVolnewmer: "/services/apparatus-cosmetology/face/volnewmer",
  apparatusFaceExion: "/services/apparatus-cosmetology/face/exion",
  apparatusFaceUltraformer: "/services/apparatus-cosmetology/face/ultraformer-mpt",
  apparatusBody: "/services/apparatus-cosmetology/body",
  apparatusBodyEmsculpt: "/services/apparatus-cosmetology/body/emsculpt-neo",
  apparatusBodyUltraformer: "/services/apparatus-cosmetology/body/ultraformer-mpt-body",
  apparatusBodyExion: "/services/apparatus-cosmetology/body/exion-body",
  apparatusM22: "/services/apparatus-cosmetology/m22-stellar-black",
  apparatusSplendor: "/services/apparatus-cosmetology/splendor-x",
  apparatusHydrafacial: "/services/apparatus-cosmetology/hydrafacial",
  apparatusAcupulse: "/services/apparatus-cosmetology/acupulse-co2",
  apparatusIntimate: "/services/apparatus-cosmetology/intimate-zone",
  apparatusSkin: "/services/apparatus-cosmetology/skin",

  intimateRf: "/services/intimate-rejuvenation/monopolar-rf-lifting",
  intimateAcupulse: "/services/intimate-rejuvenation/acupulse-co2-intimate",

  laser: "/services/laser-hair-removal",
  laserMen: "/services/laser-hair-removal/men",
  laserWomen: "/services/laser-hair-removal/women",

  longevityCheckup: "/services/longevity/check-up-40",
  longevityProgram: "/services/longevity/longevity-program",
  longevityHormonal: "/services/longevity/hormonal-balance",
  longevityIv: "/services/longevity/iv-therapy",
  longevityNutraceuticals: "/services/longevity/nutraceuticals",

  skincare: "/services/skincare",
  podology: "/services/podology",
  diagnostics: "/services/diagnostics",
  plastic: "/services/plastic-surgery",
};

const injectable: NavCategory = {
  key: "injectable",
  label: L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"),
  href: R.injectable,
  items: [
    { key: "botulinum", label: L("Ботулінотерапія", "Ботулинотерапия", "Botulinum therapy"), href: R.injectableBotulinum },
    { key: "contour", label: L("Контурна пластика", "Контурная пластика", "Dermal fillers"), href: R.injectableContour },
    { key: "bioreval", label: L("Біоревіталізація", "Биоревитализация", "Biorevitalisation"), href: R.injectableBioreval },
    { key: "meso", label: L("Мезотерапія", "Мезотерапия", "Mesotherapy"), href: R.injectableMeso },
    { key: "prp", label: L("PRP-терапія", "PRP-терапия", "PRP therapy"), href: R.injectablePrp },
    { key: "exosomes", label: L("Екзосоми", "Экзосомы", "Exosomes"), href: R.injectableExosomes },
    { key: "stem-cells", label: L("Терапія стовбуровими клітинами", "Стволовые клетки", "Stem cell therapy"), href: R.injectableStemCells },
  ],
};

const apparatus: NavCategory = {
  key: "apparatus",
  label: L("Апаратна косметологія", "Аппаратная косметология", "Apparatus cosmetology"),
  href: R.apparatus,
  items: [
    { key: "face", label: L("Апаратна для обличчя", "Аппаратная для лица", "For the face"), href: R.apparatusFace },
    { key: "body", label: L("Апаратна для тіла", "Аппаратная для тела", "For the body"), href: R.apparatusBody },
    { key: "skin", label: L("Шкіра (скоро)", "Кожа (скоро)", "Skin (coming soon)"), href: R.apparatusSkin },
  ],
};

const intimate: NavCategory = {
  key: "intimate",
  label: L("Інтимне відновлення", "Интимное восстановление", "Intimate rejuvenation"),
  href: R.apparatusIntimate,
  items: [
    { key: "rf-lifting", label: L("Монополярний RF-ліфтинг", "Монополярный RF-лифтинг", "Monopolar RF lifting"), href: R.intimateRf },
    { key: "acupulse-co2", label: L("Інтимне омолодження AcuPulse CO₂", "Интимное омоложение AcuPulse CO₂", "Intimate AcuPulse CO₂ rejuvenation"), href: R.intimateAcupulse },
  ],
};

const laser: NavCategory = {
  key: "laser",
  label: L("Лазерна епіляція", "Лазерная эпиляция", "Laser hair removal"),
  href: R.laser,
  items: [
    { key: "men", label: L("Чоловіча лазерна епіляція", "Мужская лазерная эпиляция", "For men"), href: R.laserMen },
    { key: "women", label: L("Жіноча лазерна епіляція", "Женская лазерная эпиляция", "For women"), href: R.laserWomen },
  ],
};

const longevity: NavCategory = {
  key: "longevity",
  label: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
  href: R.services + "/longevity",
  items: [
    { key: "check-up-40", label: L("Check-Up 40+", "Check-Up 40+", "Check-Up 40+"), href: R.longevityCheckup },
    { key: "longevity-program", label: L("Longevity програма", "Longevity программа", "Longevity programme"), href: R.longevityProgram },
    { key: "hormonal", label: L("Гормональний баланс", "Гормональный баланс", "Hormonal balance"), href: R.longevityHormonal },
    { key: "iv-therapy", label: L("IV-терапія", "IV-терапия", "IV therapy"), href: R.longevityIv },
    { key: "nutraceuticals", label: L("Нутрицевтика", "Нутрицевтика", "Nutraceuticals"), href: R.longevityNutraceuticals },
  ],
};

const extraServices: NavLeaf[] = [
  { key: "care", label: L("Доглядові процедури", "Уходовые процедуры", "Skincare treatments"), href: R.skincare },
  { key: "podology", label: L("Подологія", "Подология", "Podology"), href: R.podology },
  { key: "diagnostics", label: L("Діагностичні послуги", "Диагностические услуги", "Diagnostic services"), href: R.diagnostics },
  { key: "plastic", label: L("Пластична хірургія", "Пластическая хирургия", "Plastic surgery"), href: R.plastic },
];

export const navTop: NavTop[] = [
  {
    key: "about",
    label: L("Про центр", "О центре", "About"),
    href: R.about,
  },
  {
    key: "prices",
    label: L("Ціни", "Цены", "Prices"),
    href: R.prices,
  },
  {
    key: "services",
    label: L("Послуги", "Услуги", "Services"),
    href: R.services,
    mega: {
      categories: [injectable, apparatus, intimate, laser, longevity],
      extra: {
        label: L("Інші послуги", "Другие услуги", "More services"),
        items: extraServices,
      },
    },
  },
  {
    key: "stationary",
    label: L("Стаціонар", "Стационар", "Stationary"),
    href: R.stationary,
  },
  {
    key: "lab",
    label: L("Лабораторія", "Лаборатория", "Laboratory"),
    href: R.laboratory,
  },
  {
    key: "doctors",
    label: L("Лікарі", "Врачи", "Doctors"),
    href: R.doctors,
  },
  {
    key: "contacts",
    label: L("Контакти", "Контакты", "Contacts"),
    href: R.contacts,
  },
];

// Convenience for footer Послуги column — top 5 categories
export const serviceCategoriesForFooter: NavCategory[] = [
  injectable,
  apparatus,
  intimate,
  laser,
  longevity,
];

// Convenience for footer Info column
export const infoLinksForFooter: NavLeaf[] = [
  { key: "about", label: L("Про центр", "О центре", "About"), href: R.about },
  { key: "prices", label: L("Ціни", "Цены", "Prices"), href: R.prices },
  { key: "stationary", label: L("Стаціонар", "Стационар", "Stationary"), href: R.stationary },
  { key: "lab", label: L("Лабораторія", "Лаборатория", "Laboratory"), href: R.laboratory },
  { key: "doctors", label: L("Лікарі", "Врачи", "Doctors"), href: R.doctors },
  { key: "contacts", label: L("Контакти", "Контакты", "Contacts"), href: R.contacts },
];

export function t(trans: Translated, locale: string): string {
  return trans[(locale as Locale)] ?? trans.ua;
}

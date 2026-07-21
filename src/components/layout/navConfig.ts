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
  faq: "/faq",
  media: "/media",

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
  apparatusBody: "/services/apparatus-cosmetology/body",
  apparatusSkin: "/services/apparatus-cosmetology/skin",

  apparatusEmface:          "/services/apparatus-cosmetology/emface",
  apparatusUltraformerMpt:  "/services/apparatus-cosmetology/ultraformer-mpt",
  apparatusExionFace:       "/services/apparatus-cosmetology/exion-face",
  apparatusVolnewmer:       "/services/apparatus-cosmetology/volnewmer",
  apparatusEmsculptNeo:     "/services/apparatus-cosmetology/emsculpt-neo",
  apparatusUltraformerBody: "/services/apparatus-cosmetology/ultraformer-mpt-body",
  apparatusExionBody:       "/services/apparatus-cosmetology/exion-body",
  apparatusM22:             "/services/apparatus-cosmetology/m22-stellar-black",
  apparatusSplendorX:       "/services/apparatus-cosmetology/splendor-x",
  apparatusHydrafacial:     "/services/apparatus-cosmetology/hydrafacial",
  apparatusAcupulseCo2:     "/services/apparatus-cosmetology/acupulse-co2",

  intimateRf: "/services/intimate-rejuvenation/monopolar-rf-lifting",
  intimateAcupulse: "/services/intimate-rejuvenation/acupulse-co2-intimate",

  laser: "/services/laser-hair-removal",
  laserMen: "/services/laser-hair-removal/laser-men",
  laserWomen: "/services/laser-hair-removal/laser-women",

  longevity: "/services/longevity",
  longevityCheckup: "/services/longevity/check-up-40",
  longevityProgram: "/services/longevity/longevity-program",
  longevityHormonal: "/services/longevity/hormonal-balance",
  longevityIv: "/services/longevity/iv-therapy",
  longevityNutraceuticals: "/services/longevity/nutraceuticals",

  skincare: "/services/skincare",
  podology: "/services/podology",
  diagnostics: "/services/diagnostics",
  plastic: "/services/plastic-surgery",

  diagBioimpedance:           "/services/diagnostics/bioimpedance",
  diagUltrasound:             "/services/diagnostics/ultrasound",
  diagEndocrinologist:        "/services/diagnostics/endocrinologist",
  diagCosmetologist:          "/services/diagnostics/cosmetologist",
  diagUltrasoundDiagnostician:"/services/diagnostics/ultrasound-diagnostician",
  diagPlasticSurgeon:         "/services/diagnostics/plastic-surgeon",

  // TZ-v8 new service pages
  apparatusLaserRejuv:   "/services/apparatus-cosmetology/laser-rejuvenation",
  apparatusPhotorejuv:   "/services/apparatus-cosmetology/photorejuvenation",
  injectableLipAug:      "/services/injectable-cosmetology/lip-augmentation",
  injectableJawContour:  "/services/injectable-cosmetology/jaw-contouring",
  injectableNoseContour: "/services/injectable-cosmetology/nose-contouring",
  injectableHairMeso:    "/services/injectable-cosmetology/hair-mesotherapy",
  longevityExosomeIv:    "/services/longevity/exosome-iv-drip",
  laserBikini:           "/services/laser-hair-removal/laser-bikini",
  laserLegs:             "/services/laser-hair-removal/laser-legs",
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
    { key: "lip-augmentation", label: L("Збільшення губ", "Увеличение губ", "Lip augmentation"), href: R.injectableLipAug },
    { key: "jaw-contouring", label: L("Контурна пластика щелепи", "Контурная пластика челюсти", "Jaw contouring"), href: R.injectableJawContour },
    { key: "nose-contouring", label: L("Контурна пластика носа", "Контурная пластика носа", "Nose contouring"), href: R.injectableNoseContour },
    { key: "hair-mesotherapy", label: L("Мезотерапія волосся", "Мезотерапия волос", "Hair mesotherapy"), href: R.injectableHairMeso },
  ],
};

const apparatusFaceNav: NavCategory = {
  key: "apparatusFace",
  label: L("Апарати для обличчя", "Аппараты для лица", "Face Devices"),
  href: R.apparatusFace,
  items: [
    { key: "emface",            label: L("EMFACE",          "EMFACE",          "EMFACE"),          href: R.apparatusEmface },
    { key: "ultraformer-mpt",   label: L("Ultraformer MPT", "Ultraformer MPT", "Ultraformer MPT"), href: R.apparatusUltraformerMpt },
    { key: "exion-face",        label: L("EXION Face",      "EXION Face",      "EXION Face"),      href: R.apparatusExionFace },
    { key: "volnewmer",         label: L("VOLNEWMER",       "VOLNEWMER",       "VOLNEWMER"),       href: R.apparatusVolnewmer },
    { key: "hydrafacial",       label: L("HydraFacial",     "HydraFacial",     "HydraFacial"),     href: R.apparatusHydrafacial },
    { key: "acupulse-co2",      label: L("AcuPulse CO₂",   "AcuPulse CO₂",   "AcuPulse CO₂"),   href: R.apparatusAcupulseCo2 },
    { key: "laser-rejuvenation",label: L("Лазерне омолодження", "Лазерное омоложение", "Laser rejuvenation"), href: R.apparatusLaserRejuv },
    { key: "photorejuvenation", label: L("Фотоомолодження",  "Фотоомоложение",  "Photorejuvenation"), href: R.apparatusPhotorejuv },
  ],
};

const apparatusBodyNav: NavCategory = {
  key: "apparatusBody",
  label: L("Апарати для тіла", "Аппараты для тела", "Body Devices"),
  href: R.apparatusBody,
  items: [
    { key: "emsculpt-neo",          label: L("Emsculpt Neo",          "Emsculpt Neo",          "Emsculpt Neo"),          href: R.apparatusEmsculptNeo },
    { key: "ultraformer-mpt-body",  label: L("Ultraformer MPT для тіла", "Ultraformer MPT для тела", "Ultraformer MPT Body"), href: R.apparatusUltraformerBody },
    { key: "exion-body",            label: L("EXION Body",            "EXION Body",            "EXION Body"),            href: R.apparatusExionBody },
    { key: "m22",                   label: L("M22 Stellar Black",     "M22 Stellar Black",     "M22 Stellar Black"),     href: R.apparatusM22 },
    { key: "splendor-x",            label: L("Splendor X",            "Splendor X",            "Splendor X"),            href: R.apparatusSplendorX },
  ],
};

const intimate: NavCategory = {
  key: "intimate",
  label: L("Інтимне відновлення", "Интимное восстановление", "Intimate rejuvenation"),
  href: "/services/intimate-rejuvenation",
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
    { key: "bikini", label: L("Епіляція бікіні", "Эпиляция бикини", "Bikini"), href: R.laserBikini },
    { key: "legs", label: L("Епіляція ніг", "Эпиляция ног", "Legs"), href: R.laserLegs },
  ],
};

const longevity: NavCategory = {
  key: "longevity",
  label: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
  href: R.longevity,
  items: [
    { key: "check-up-40", label: L("Check-Up 40+", "Check-Up 40+", "Check-Up 40+"), href: R.longevityCheckup },
    { key: "longevity-program", label: L("Longevity програма", "Longevity программа", "Longevity programme"), href: R.longevityProgram },
    { key: "hormonal", label: L("Гормональний баланс", "Гормональный баланс", "Hormonal balance"), href: R.longevityHormonal },
    { key: "iv-therapy", label: L("IV-терапія", "IV-терапия", "IV therapy"), href: R.longevityIv },
    { key: "nutraceuticals", label: L("Нутрицевтика", "Нутрицевтика", "Nutraceuticals"), href: R.longevityNutraceuticals },
    { key: "exosome-iv-drip", label: L("Крапельниця з екзосомами", "Капельница с экзосомами", "Exosome IV drip"), href: R.longevityExosomeIv },
  ],
};

const diagnosticsNav: NavCategory = {
  key: "diagnosticsNav",
  label: L("Діагностика", "Диагностика", "Diagnostics"),
  href: R.diagnostics,
  items: [
    { key: "bioimpedance",             label: L("InBody (склад тіла)",   "InBody (состав тела)",   "InBody (body composition)"), href: R.diagBioimpedance },
    { key: "ultrasound",               label: L("УЗД",                   "УЗИ",                    "Ultrasound"),                href: R.diagUltrasound },
    { key: "endocrinologist",          label: L("Ендокринолог",          "Эндокринолог",           "Endocrinologist"),           href: R.diagEndocrinologist },
    { key: "cosmetologist",            label: L("Косметолог",            "Косметолог",             "Cosmetologist"),             href: R.diagCosmetologist },
    { key: "ultrasound-diagnostician", label: L("Лікар УЗД",            "Врач УЗД",               "Ultrasound Doctor"),         href: R.diagUltrasoundDiagnostician },
    { key: "plastic-surgeon",          label: L("Пластичний хірург",     "Пластический хирург",    "Plastic surgeon"),           href: R.diagPlasticSurgeon },
  ],
};

const extraServices: NavLeaf[] = [
  { key: "care", label: L("Доглядові процедури", "Уходовые процедуры", "Skincare treatments"), href: R.skincare },
  { key: "podology", label: L("Подологія", "Подология", "Podology"), href: R.podology },
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
      categories: [injectable, { key: "apparatus", label: L("Апаратна косметологія", "Аппаратная косметология", "Apparatus cosmetology"), href: R.apparatus, items: [] }, apparatusFaceNav, apparatusBodyNav, intimate, laser, longevity, diagnosticsNav],
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
  apparatusFaceNav,
  apparatusBodyNav,
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
  { key: "faq", label: L("Питання та відповіді", "Вопросы и ответы", "FAQ"), href: R.faq },
  { key: "media", label: L("ЗМІ про нас", "СМИ о нас", "Media about us"), href: R.media },
];

export function t(trans: Translated, locale: string): string {
  return trans[(locale as Locale)] ?? trans.ua;
}

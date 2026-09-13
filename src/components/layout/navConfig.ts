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
  /** Rendered as a smaller sub-heading under the block above it. */
  compact?: boolean;
  /**
   * Sub-heading used inside the mega-menu detail pane. Set it when `label`
   * would just repeat the section title shown directly above the group.
   */
  paneLabel?: Translated;
};

/**
 * One entry in the mega-menu's left rail. Selecting it shows `groups` in the
 * detail pane; a section with several groups renders them as sub-headings.
 */
export type NavSection = {
  key: string;
  label: Translated;
  href: string;
  groups: NavCategory[];
};


export type NavTop = {
  key: string;
  label: Translated;
  href: string;
  mega?: {
    /** Left rail of the desktop panel, in order. */
    sections: NavSection[];
    /** Flattened view of every group — used by the mobile sub-panel and footer. */
    categories: NavCategory[];
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

  // Injectable pages that existed but were never linked from the menu
  injectableRejuranX:      "/services/injectable-cosmetology/rejuran",
  injectableJuvedermX:     "/services/injectable-cosmetology/juvederm",
  injectablePolyphilX:     "/services/injectable-cosmetology/polyphil",
  injectableLipBioreval:   "/services/injectable-cosmetology/lip-biorevitalisation",
  injectableNeckBioreval:  "/services/injectable-cosmetology/neck-biorevitalisation",
  injectableIntimateBio:   "/services/injectable-cosmetology/intimate-biorevitalisation",
  injectableIntimateZone:  "/services/injectable-cosmetology/intimate-zone-biorevitalisation",
  injectableUnderarmBtx:   "/services/injectable-cosmetology/underarm-botulinum",

  // Skin-correction pages under apparatus cosmetology
  apparatusLaserResurf:     "/services/apparatus-cosmetology/laser-resurfacing",
  apparatusPostAcne:        "/services/apparatus-cosmetology/laser-resurfacing-post-acne",
  apparatusLaserPeel:       "/services/apparatus-cosmetology/laser-peel",
  apparatusCouperose:       "/services/apparatus-cosmetology/couperose-treatment",
  apparatusAcne:            "/services/apparatus-cosmetology/acne-treatment",
  apparatusPigmentation:    "/services/apparatus-cosmetology/pigmentation-removal",
  apparatusRosacea:         "/services/apparatus-cosmetology/rosacea-treatment",
  apparatusScars:           "/services/apparatus-cosmetology/scar-resurfacing",
  apparatusStretchMarks:    "/services/apparatus-cosmetology/stretch-marks-removal",
  apparatusPores:           "/services/apparatus-cosmetology/pore-tightening",

  // TZ #12 pages
  apparatusSmas:            "/services/apparatus-cosmetology/smas-lifting",
  apparatusRfLifting:       "/services/apparatus-cosmetology/rf-lifting",
  apparatusMicroneedlingRf: "/services/apparatus-cosmetology/microneedling-rf-lifting",
  apparatus3d:              "/services/apparatus-cosmetology/3d-rejuvenation",
  apparatusAcnePhoto:       "/services/apparatus-cosmetology/acne-phototherapy",
  apparatusPigmentPhoto:    "/services/apparatus-cosmetology/pigmentation-photo-removal",
  laserAbdomen:             "/services/laser-hair-removal/laser-abdomen",
  laserFace:                "/services/laser-hair-removal/laser-face",
  laserUnderarms:           "/services/laser-hair-removal/laser-underarms",
  laserArms:                "/services/laser-hair-removal/laser-arms",
  laserBack:                "/services/laser-hair-removal/laser-back",

  // Consultation pages
  diagDermatologist:      "/services/diagnostics/dermatologist",
  diagGastroenterologist: "/services/diagnostics/gastroenterologist",
  diagDietician:          "/services/diagnostics/dietician",
  diagTherapist:          "/services/diagnostics/therapist",
  diagNeurologist:        "/services/diagnostics/neurologist",
  diagReproductologist:   "/services/diagnostics/reproductologist",

  intimateWhitening: "/services/intimate-rejuvenation/intimate-whitening",
  gynaecology:       "/services/gynaecology",
};


// ─── Column 1: injectable cosmetology ──────────────────────────────────────
const injectable: NavCategory = {
  key: "injectable",
  label: L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"),
  paneLabel: L("Методики", "Методики", "Methods"),
  href: R.injectable,
  items: [
    { key: "botulinum", label: L("Ботулінотерапія", "Ботулинотерапия", "Botulinum therapy"), href: R.injectableBotulinum },
    { key: "contour", label: L("Контурна пластика", "Контурная пластика", "Dermal fillers"), href: R.injectableContour },
    { key: "bioreval", label: L("Біоревіталізація", "Биоревитализация", "Biorevitalisation"), href: R.injectableBioreval },
    { key: "meso", label: L("Мезотерапія", "Мезотерапия", "Mesotherapy"), href: R.injectableMeso },
    { key: "prp", label: L("PRP-терапія", "PRP-терапия", "PRP therapy"), href: R.injectablePrp },
    { key: "exosomes", label: L("Екзосоми", "Экзосомы", "Exosomes"), href: R.injectableExosomes },
    { key: "stem-cells", label: L("Терапія стовбуровими клітинами", "Стволовые клетки", "Stem cell therapy"), href: R.injectableStemCells },
    { key: "nav-rejuran", label: L("Rejuran", "Rejuran", "Rejuran"), href: R.injectableRejuranX },
    { key: "nav-juvederm", label: L("Juvederm", "Juvederm", "Juvederm"), href: R.injectableJuvedermX },
    { key: "nav-polyphil", label: L("PolyPhil", "PolyPhil", "PolyPhil"), href: R.injectablePolyphilX },
  ],
};

const injectableZones: NavCategory = {
  key: "nav-injectable-zones",
  label: L("Зони та ділянки", "Зоны и участки", "By area"),
  href: R.injectable,
  compact: true,
  items: [
    { key: "lip-augmentation", label: L("Збільшення губ", "Увеличение губ", "Lip augmentation"), href: R.injectableLipAug },
    { key: "jaw-contouring", label: L("Контурна пластика щелепи", "Контурная пластика челюсти", "Jaw contouring"), href: R.injectableJawContour },
    { key: "nose-contouring", label: L("Контурна пластика носа", "Контурная пластика носа", "Nose contouring"), href: R.injectableNoseContour },
    { key: "hair-mesotherapy", label: L("Мезотерапія волосся", "Мезотерапия волос", "Hair mesotherapy"), href: R.injectableHairMeso },
    { key: "nav-lip-bioreval", label: L("Біоревіталізація губ", "Биоревитализация губ", "Lip biorevitalisation"), href: R.injectableLipBioreval },
    { key: "nav-neck-bioreval", label: L("Біоревіталізація шиї і декольте", "Биоревитализация шеи и декольте", "Neck and décolletage"), href: R.injectableNeckBioreval },
    { key: "nav-intimate-bioreval", label: L("Інтимна біоревіталізація", "Интимная биоревитализация", "Intimate biorevitalisation"), href: R.injectableIntimateBio },
    { key: "nav-intimate-zone-bioreval", label: L("Біоревіталізація інтимної зони", "Биоревитализация интимной зоны", "Intimate zone biorevitalisation"), href: R.injectableIntimateZone },
    { key: "nav-underarm-botulinum", label: L("Ботулінотерапія під пахвами", "Ботулинотерапия подмышками", "Underarm botulinum therapy"), href: R.injectableUnderarmBtx },
  ],
};

// ─── Column 2: apparatus cosmetology, by device ────────────────────────────
const apparatusHub: NavCategory = {
  key: "apparatus",
  label: L("Апаратна косметологія", "Аппаратная косметология", "Apparatus cosmetology"),
  href: R.apparatus,
  items: [],
};


const apparatusFaceNav: NavCategory = {
  key: "apparatusFace",
  label: L("Апарати для обличчя", "Аппараты для лица", "Face Devices"),
  href: R.apparatusFace,
  compact: true,
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
  compact: true,
  items: [
    { key: "emsculpt-neo",          label: L("Emsculpt Neo",          "Emsculpt Neo",          "Emsculpt Neo"),          href: R.apparatusEmsculptNeo },
    { key: "ultraformer-mpt-body",  label: L("Ultraformer MPT для тіла", "Ultraformer MPT для тела", "Ultraformer MPT Body"), href: R.apparatusUltraformerBody },
    { key: "exion-body",            label: L("EXION Body",            "EXION Body",            "EXION Body"),            href: R.apparatusExionBody },
    { key: "m22",                   label: L("M22 Stellar Black",     "M22 Stellar Black",     "M22 Stellar Black"),     href: R.apparatusM22 },
    { key: "splendor-x",            label: L("Splendor X",            "Splendor X",            "Splendor X"),            href: R.apparatusSplendorX },
  ],
};

// ─── Column 3: skin correction, by concern ─────────────────────────────────
// Note: a `skin` nav_mega string is seeded as "Шкіра (скоро)" from before these
// pages existed, so this block deliberately uses its own key.
const skinLifting: NavCategory = {
  key: "nav-skin",
  label: L("Корекція шкіри", "Коррекция кожи", "Skin correction"),
  paneLabel: L("Ліфтинг та шліфовка", "Лифтинг и шлифовка", "Lifting and resurfacing"),
  href: R.apparatusSkin,
  items: [
    { key: "nav-smas-lifting", label: L("SMAS-ліфтинг", "SMAS-лифтинг", "SMAS lifting"), href: R.apparatusSmas },
    { key: "nav-rf-lifting", label: L("RF-ліфтинг", "RF-лифтинг", "RF lifting"), href: R.apparatusRfLifting },
    { key: "nav-microneedling-rf", label: L("Мікроголковий RF-ліфтинг", "Микроигольчатый RF-лифтинг", "Microneedling RF lifting"), href: R.apparatusMicroneedlingRf },
    { key: "nav-3d-rejuvenation", label: L("3D-омолодження", "3D-омоложение", "3D rejuvenation"), href: R.apparatus3d },
    { key: "nav-laser-resurfacing", label: L("Лазерна шліфовка", "Лазерная шлифовка", "Laser resurfacing"), href: R.apparatusLaserResurf },
    { key: "nav-post-acne", label: L("Шліфовка постакне", "Шлифовка постакне", "Post-acne resurfacing"), href: R.apparatusPostAcne },
    { key: "nav-laser-peel", label: L("Лазерний пілінг", "Лазерный пилинг", "Laser peel"), href: R.apparatusLaserPeel },
    { key: "nav-pore-tightening", label: L("Звуження пор", "Сужение пор", "Pore tightening"), href: R.apparatusPores },
  ],
};

const skinTreatment: NavCategory = {
  key: "nav-skin-treatment",
  label: L("Лікування шкіри", "Лечение кожи", "Skin treatment"),
  href: R.apparatusSkin,
  compact: true,
  items: [
    { key: "nav-acne-treatment", label: L("Лікування акне", "Лечение акне", "Acne treatment"), href: R.apparatusAcne },
    { key: "nav-acne-phototherapy", label: L("Фототерапія акне", "Фототерапия акне", "Acne phototherapy"), href: R.apparatusAcnePhoto },
    { key: "nav-pigmentation", label: L("Видалення пігментації", "Удаление пигментации", "Pigmentation removal"), href: R.apparatusPigmentation },
    { key: "nav-pigment-photo", label: L("Фотовидалення пігментації", "Фотоудаление пигментации", "Pigmentation photo-removal"), href: R.apparatusPigmentPhoto },
    { key: "nav-couperose", label: L("Лікування куперозу", "Лечение купероза", "Couperose treatment"), href: R.apparatusCouperose },
    { key: "nav-rosacea", label: L("Лікування розацеа", "Лечение розацеа", "Rosacea treatment"), href: R.apparatusRosacea },
    { key: "nav-scars", label: L("Шрами і рубці", "Шрамы и рубцы", "Scars"), href: R.apparatusScars },
    { key: "nav-stretch-marks", label: L("Розтяжки", "Растяжки", "Stretch marks"), href: R.apparatusStretchMarks },
  ],
};

// ─── Column 4: laser hair removal, longevity, intimate ─────────────────────
const laser: NavCategory = {
  key: "laser",
  label: L("Лазерна епіляція", "Лазерная эпиляция", "Laser hair removal"),
  href: R.laser,
  items: [
    { key: "men", label: L("Чоловіча лазерна епіляція", "Мужская лазерная эпиляция", "For men"), href: R.laserMen },
    { key: "women", label: L("Жіноча лазерна епіляція", "Женская лазерная эпиляция", "For women"), href: R.laserWomen },
    { key: "bikini", label: L("Епіляція бікіні", "Эпиляция бикини", "Bikini"), href: R.laserBikini },
    { key: "legs", label: L("Епіляція ніг", "Эпиляция ног", "Legs"), href: R.laserLegs },
    { key: "nav-laser-abdomen", label: L("Епіляція живота", "Эпиляция живота", "Abdomen"), href: R.laserAbdomen },
    { key: "nav-laser-face", label: L("Епіляція обличчя", "Эпиляция лица", "Face"), href: R.laserFace },
    { key: "nav-laser-underarms", label: L("Епіляція пахв", "Эпиляция подмышек", "Underarms"), href: R.laserUnderarms },
    { key: "nav-laser-arms", label: L("Епіляція рук", "Эпиляция рук", "Arms"), href: R.laserArms },
    { key: "nav-laser-back", label: L("Епіляція спини", "Эпиляция спины", "Back"), href: R.laserBack },
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

const intimate: NavCategory = {
  key: "intimate",
  label: L("Інтимне відновлення", "Интимное восстановление", "Intimate rejuvenation"),
  href: "/services/intimate-rejuvenation",
  items: [
    { key: "rf-lifting", label: L("Монополярний RF-ліфтинг", "Монополярный RF-лифтинг", "Monopolar RF lifting"), href: R.intimateRf },
    { key: "acupulse-co2", label: L("Інтимне омолодження AcuPulse CO₂", "Интимное омоложение AcuPulse CO₂", "Intimate AcuPulse CO₂ rejuvenation"), href: R.intimateAcupulse },
    { key: "nav-intimate-whitening", label: L("Відбілювання інтимних зон", "Отбеливание интимных зон", "Intimate area whitening"), href: R.intimateWhitening },
  ],
};

// ─── Column 5: diagnostics, consultations, everything else ─────────────────
const diagnosticsNav: NavCategory = {
  key: "diagnosticsNav",
  label: L("Діагностика", "Диагностика", "Diagnostics"),
  paneLabel: L("Обстеження", "Обследования", "Investigations"),
  href: R.diagnostics,
  items: [
    { key: "bioimpedance",             label: L("InBody (склад тіла)",   "InBody (состав тела)",   "InBody (body composition)"), href: R.diagBioimpedance },
    { key: "ultrasound",               label: L("УЗД",                   "УЗИ",                    "Ultrasound"),                href: R.diagUltrasound },
    { key: "ultrasound-diagnostician", label: L("Лікар УЗД",            "Врач УЗД",               "Ultrasound Doctor"),         href: R.diagUltrasoundDiagnostician },
  ],
};

const consultationsNav: NavCategory = {
  key: "nav-consultations",
  label: L("Консультації лікарів", "Консультации врачей", "Consultations"),
  href: R.diagnostics,
  compact: true,
  items: [
    { key: "cosmetologist",       label: L("Косметолог",       "Косметолог",        "Cosmetologist"),      href: R.diagCosmetologist },
    { key: "nav-dermatologist",   label: L("Дерматолог",       "Дерматолог",        "Dermatologist"),      href: R.diagDermatologist },
    { key: "endocrinologist",     label: L("Ендокринолог",     "Эндокринолог",      "Endocrinologist"),    href: R.diagEndocrinologist },
    { key: "nav-gastroenterologist", label: L("Гастроентеролог", "Гастроэнтеролог", "Gastroenterologist"), href: R.diagGastroenterologist },
    { key: "nav-dietician",       label: L("Дієтолог",         "Диетолог",          "Dietician"),          href: R.diagDietician },
    { key: "nav-therapist",       label: L("Терапевт",         "Терапевт",          "General practitioner"), href: R.diagTherapist },
    { key: "nav-neurologist",     label: L("Невролог",         "Невролог",          "Neurologist"),        href: R.diagNeurologist },
    { key: "nav-reproductologist",label: L("Репродуктолог",    "Репродуктолог",     "Fertility specialist"), href: R.diagReproductologist },
    { key: "plastic-surgeon",     label: L("Пластичний хірург","Пластический хирург","Plastic surgeon"),    href: R.diagPlasticSurgeon },
  ],
};

const extraServices: NavLeaf[] = [
  { key: "care", label: L("Доглядові процедури", "Уходовые процедуры", "Skincare treatments"), href: R.skincare },
  { key: "podology", label: L("Подологія", "Подология", "Podology"), href: R.podology },
  { key: "nav-gynaecology", label: L("Гінекологія", "Гинекология", "Gynaecology"), href: R.gynaecology },
  { key: "plastic", label: L("Пластична хірургія", "Пластическая хирургия", "Plastic surgery"), href: R.plastic },
];

const otherServices: NavCategory = {
  key: "more",
  label: L("Інші послуги", "Другие услуги", "More services"),
  href: R.services,
  items: extraServices,
};

const megaSections: NavSection[] = [
  { key: "injectable",       label: injectable.label,        href: R.injectable,   groups: [injectable, injectableZones] },
  { key: "apparatus",        label: apparatusHub.label,      href: R.apparatus,    groups: [apparatusFaceNav, apparatusBodyNav] },
  { key: "nav-skin",         label: skinLifting.label,       href: R.apparatusSkin, groups: [skinLifting, skinTreatment] },
  { key: "laser",            label: laser.label,             href: R.laser,        groups: [laser] },
  { key: "longevity",        label: longevity.label,         href: R.longevity,    groups: [longevity] },
  { key: "intimate",         label: intimate.label,          href: "/services/intimate-rejuvenation", groups: [intimate] },
  { key: "diagnosticsNav",   label: diagnosticsNav.label,    href: R.diagnostics,  groups: [diagnosticsNav, consultationsNav] },
  { key: "more",             label: otherServices.label,     href: R.services,     groups: [otherServices] },
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
      sections: megaSections,
      categories: megaSections.flatMap((s) => s.groups),
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

/**
 * Footer service columns. Named exports rather than a positional array — the
 * previous version destructured five names off a six-element array, which
 * shifted every column after the first onto the wrong category.
 */
export const footerServiceColumns = {
  injectable,
  apparatusFace: apparatusFaceNav,
  apparatusBody: apparatusBodyNav,
  skin: skinLifting,
  laser,
  longevity,
  intimate,
} as const;

export const serviceCategoriesForFooter: NavCategory[] = [
  injectable,
  apparatusFaceNav,
  apparatusBodyNav,
  skinLifting,
  laser,
  longevity,
  intimate,
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

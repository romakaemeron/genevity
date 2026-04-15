// Navigation config for the mega menu + footer.
// Placeholder hrefs (#) — slug decision is pending (see plan §5.3).
// Labels hardcoded in 3 locales here; will migrate to Sanity `navigation` doc after slug decision.

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

const PH = "#"; // href placeholder until slugs are locked

const L = (ua: string, ru: string, en: string): Translated => ({ ua, ru, en });

const injectable: NavCategory = {
  key: "injectable",
  label: L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"),
  href: PH,
  items: [
    { key: "botulinoterapiya", label: L("Ботулінотерапія", "Ботулинотерапия", "Botulinum therapy"), href: PH },
    { key: "konturna-plastyka", label: L("Контурна пластика", "Контурная пластика", "Dermal fillers"), href: PH },
    { key: "biorevitalizatsiia", label: L("Біоревіталізація", "Биоревитализация", "Biorevitalisation"), href: PH },
    { key: "mezoterapiya", label: L("Мезотерапія", "Мезотерапия", "Mesotherapy"), href: PH },
    { key: "prp", label: L("PRP-терапія", "PRP-терапия", "PRP therapy"), href: PH },
    { key: "ekzosomy", label: L("Екзосоми", "Экзосомы", "Exosomes"), href: PH },
    { key: "stem-cells", label: L("Терапія стовбуровими клітинами", "Стволовые клетки", "Stem cell therapy"), href: PH },
  ],
};

const apparatus: NavCategory = {
  key: "apparatus",
  label: L("Апаратна косметологія", "Аппаратная косметология", "Apparatus cosmetology"),
  href: PH,
  items: [
    { key: "face", label: L("Апаратна для обличчя", "Аппаратная для лица", "For the face"), href: PH },
    { key: "body", label: L("Апаратна для тіла", "Аппаратная для тела", "For the body"), href: PH },
    { key: "skin", label: L("Шкіра (скоро)", "Кожа (скоро)", "Skin (coming soon)"), href: PH },
  ],
};

const intimate: NavCategory = {
  key: "intimate",
  label: L("Інтимне відновлення", "Интимное восстановление", "Intimate rejuvenation"),
  href: PH,
  items: [
    { key: "rf-lifting", label: L("Монополярний RF-ліфтинг", "Монополярный RF-лифтинг", "Monopolar RF lifting"), href: PH },
    { key: "acupulse-co2", label: L("Інтимне омолодження AcuPulse CO₂", "Интимное омоложение AcuPulse CO₂", "Intimate AcuPulse CO₂ rejuvenation"), href: PH },
  ],
};

const laser: NavCategory = {
  key: "laser",
  label: L("Лазерна епіляція", "Лазерная эпиляция", "Laser hair removal"),
  href: PH,
  items: [
    { key: "men", label: L("Чоловіча лазерна епіляція", "Мужская лазерная эпиляция", "For men"), href: PH },
    { key: "women", label: L("Жіноча лазерна епіляція", "Женская лазерная эпиляция", "For women"), href: PH },
  ],
};

const longevity: NavCategory = {
  key: "longevity",
  label: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
  href: PH,
  items: [
    { key: "check-up-40", label: L("Check-Up 40+", "Check-Up 40+", "Check-Up 40+"), href: PH },
    { key: "longevity-program", label: L("Longevity програма", "Longevity программа", "Longevity programme"), href: PH },
    { key: "hormonal", label: L("Гормональний баланс", "Гормональный баланс", "Hormonal balance"), href: PH },
    { key: "iv-therapy", label: L("IV-терапія", "IV-терапия", "IV therapy"), href: PH },
    { key: "nutraceuticals", label: L("Нутрицевтика", "Нутрицевтика", "Nutraceuticals"), href: PH },
  ],
};

const extraServices: NavLeaf[] = [
  { key: "care", label: L("Доглядові процедури", "Уходовые процедуры", "Skincare treatments"), href: PH },
  { key: "podology", label: L("Подологія", "Подология", "Podology"), href: PH },
  { key: "diagnostics", label: L("Діагностичні послуги", "Диагностические услуги", "Diagnostic services"), href: PH },
  { key: "plastic", label: L("Пластична хірургія", "Пластическая хирургия", "Plastic surgery"), href: PH },
];

export const navTop: NavTop[] = [
  {
    key: "about",
    label: L("Про центр", "О центре", "About"),
    href: PH,
  },
  {
    key: "prices",
    label: L("Ціни", "Цены", "Prices"),
    href: PH,
  },
  {
    key: "services",
    label: L("Послуги", "Услуги", "Services"),
    href: PH,
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
    href: PH,
  },
  {
    key: "lab",
    label: L("Лабораторія", "Лаборатория", "Laboratory"),
    href: PH,
  },
  {
    key: "doctors",
    label: L("Лікарі", "Врачи", "Doctors"),
    href: PH,
  },
  {
    key: "contacts",
    label: L("Контакти", "Контакты", "Contacts"),
    href: PH,
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
  { key: "about", label: L("Про центр", "О центре", "About"), href: PH },
  { key: "prices", label: L("Ціни", "Цены", "Prices"), href: PH },
  { key: "stationary", label: L("Стаціонар", "Стационар", "Stationary"), href: PH },
  { key: "lab", label: L("Лабораторія", "Лаборатория", "Laboratory"), href: PH },
  { key: "doctors", label: L("Лікарі", "Врачи", "Doctors"), href: PH },
  { key: "contacts", label: L("Контакти", "Контакты", "Contacts"), href: PH },
];

export function t(trans: Translated, locale: string): string {
  return trans[(locale as Locale)] ?? trans.ua;
}

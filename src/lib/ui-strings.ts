/** Shared UI strings used across templates and components. Trilingual. */

type L = { ua: string; ru: string; en: string };

const strings = {
  home: { ua: "Головна", ru: "Главная", en: "Home" },
  services: { ua: "Послуги", ru: "Услуги", en: "Services" },
  procedures: { ua: "Процедури", ru: "Процедуры", en: "Procedures" },
  faq: { ua: "Часті запитання", ru: "Часто задаваемые вопросы", en: "FAQ" },
  bookConsultation: { ua: "Записатися на консультацію", ru: "Записаться на консультацию", en: "Book a consultation" },
  book: { ua: "Записатися", ru: "Записаться", en: "Book now" },
  bookCta: { ua: "Запишіться на консультацію", ru: "Запишитесь на консультацию", en: "Book a consultation" },
  ctaSubtitle: { ua: "Наші спеціалісти підберуть оптимальну програму саме для вас", ru: "Наши специалисты подберут оптимальную программу именно для вас", en: "Our specialists will create the optimal program for you" },
  ourSpecialists: { ua: "Наші спеціалісти", ru: "Наши специалисты", en: "Our specialists" },
  alsoInteresting: { ua: "Вас також може зацікавити", ru: "Вас также может заинтересовать", en: "You may also be interested in" },
  learnMore: { ua: "Детальніше", ru: "Подробнее", en: "Learn more" },
  toc: { ua: "Зміст", ru: "Содержание", en: "Contents" },
  meetDoctors: { ua: "Познайомтеся з нашими лікарями", ru: "Познакомьтесь с нашими врачами", en: "Meet our doctors" },
  allDoctors: { ua: "Всі лікарі", ru: "Все врачи", en: "All doctors" },
  viewAllProcedures: { ua: "Всі процедури", ru: "Все процедуры", en: "All procedures" },
  typesOfProcedures: { ua: "Види процедур", ru: "Виды процедур", en: "Types of Procedures" },
  viewProcedures: { ua: "Дивитися процедури", ru: "Смотреть процедуры", en: "View procedures" },
} satisfies Record<string, L>;

export type UiStringKey = keyof typeof strings;

/** Get a UI string for the given locale. */
export function ui(key: UiStringKey, locale: string): string {
  const l = locale as "ua" | "ru" | "en";
  return strings[key][l] ?? strings[key].ua;
}

import { getLocale } from "next-intl/server";
// The not-found boundary renders outside every root layout, so it carries its
// own stylesheet and font variables — otherwise the page arrives unstyled.
import "../globals.css";
import { fontVariables, htmlLang } from "@/components/layout/RootHtml";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import Button from "@/components/ui/Button";

const COPY = {
  ua: {
    kicker: "Сторінка не знайдена",
    text: "Схоже, ця сторінка не існує або була переміщена. Поверніться на головну або скористайтеся навігацією.",
    home: "На головну",
    services: "Послуги",
  },
  ru: {
    kicker: "Страница не найдена",
    text: "Похоже, эта страница не существует или была перемещена. Вернитесь на главную или воспользуйтесь навигацией.",
    home: "На главную",
    services: "Услуги",
  },
  en: {
    kicker: "Page not found",
    text: "This page doesn't exist or has been moved. Head back to the homepage or use the navigation.",
    home: "Go to homepage",
    services: "Services",
  },
} as const;

export default async function NotFound() {
  let locale: keyof typeof COPY = "ua";
  try {
    const l = await getLocale();
    if (l === "ru" || l === "en") locale = l;
  } catch {
    // No request locale (e.g. a path the proxy skipped) — Ukrainian is canonical.
  }
  const t = COPY[locale];
  const prefix = locale === "ua" ? "" : `/${locale}`;

  return (
    // The boundary renders outside any root layout, so <html> carries no lang
    // of its own — declare it on the wrapper instead.
    <div lang={htmlLang(locale)} className={`${fontVariables} antialiased`}>
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="min-h-screen bg-champagne flex flex-col items-center justify-center px-6 text-center pt-24 pb-20">
        <p className="body-s text-muted mb-4 tracking-widest uppercase">{t.kicker}</p>
        <h1
          className="text-black mb-6"
          style={{
            fontFamily: "var(--font-heading, serif)",
            fontSize: "clamp(80px, 18vw, 160px)",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <p className="body-l text-muted max-w-md mb-10">{t.text}</p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button href={`${prefix}/`} variant="primary" size="lg">
            {t.home}
          </Button>
          <Button href={`${prefix}/services`} variant="outline" size="lg">
            {t.services}
          </Button>
        </div>
      </div>
    </div>
  );
}

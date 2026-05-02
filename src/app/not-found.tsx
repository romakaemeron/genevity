import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessagesForLocale } from "@/lib/db/queries/ui-strings";
import { getLegalDocs, getSiteSettingsData } from "@/lib/db/queries";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

const tenorSans = localFont({
  src: "../../public/fonts/TenorSans-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
});

const mulish = localFont({
  src: [
    { path: "../../public/fonts/Mulish-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Mulish-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Mulish-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});

export default async function RootNotFound() {
  const [messages, legalDocs, settings] = await Promise.all([
    getMessagesForLocale("ua"),
    getLegalDocs("ua"),
    getSiteSettingsData("ua"),
  ]);

  return (
    <div className={`${tenorSans.variable} ${mulish.variable} antialiased`}>
      <NextIntlClientProvider locale="uk" messages={messages}>
        <SiteSettingsProvider settings={settings}>
          <MegaMenuHeader variant="solid" position="fixed" />
          <main className="min-h-screen bg-champagne flex flex-col items-center justify-center px-6 text-center pt-24 pb-20">
            <p className="body-s text-muted mb-4 tracking-widest uppercase">
              Сторінка не знайдена
            </p>
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
            <p className="body-l text-muted max-w-md mb-10">
              Схоже, ця сторінка не існує або була переміщена. Поверніться на головну або скористайтеся навігацією.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button href="/" variant="primary" size="lg">
                На головну
              </Button>
              <Button href="/services" variant="outline" size="lg">
                Послуги
              </Button>
            </div>
          </main>
          <Footer legalDocs={legalDocs} settings={settings} />
        </SiteSettingsProvider>
      </NextIntlClientProvider>
    </div>
  );
}

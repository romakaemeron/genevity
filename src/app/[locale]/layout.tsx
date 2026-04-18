import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Footer from "@/components/layout/Footer";
import ImageProtection from "@/components/ui/ImageProtection";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { WebSiteSchema } from "@/components/seo/WebSiteSchema";
import { getLegalDocs } from "@/sanity/queries";
import "../globals.css";

const tenorSans = localFont({
  src: "../../../public/fonts/TenorSans-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
});

const mulish = localFont({
  src: [
    { path: "../../../public/fonts/Mulish-Regular.ttf", weight: "400" },
    { path: "../../../public/fonts/Mulish-Medium.ttf", weight: "500" },
    { path: "../../../public/fonts/Mulish-SemiBold.ttf", weight: "600" },
    { path: "../../../public/fonts/Mulish-Bold.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

const titles: Record<string, string> = {
  ua: "GENEVITY — Медичний центр довголіття та естетичної медицини у Дніпрі",
  ru: "GENEVITY — Медицинский центр долголетия и эстетической медицины в Днепре",
  en: "GENEVITY — Luxury Longevity & Aesthetic Medicine Center in Dnipro",
};

const descriptions: Record<string, string> = {
  ua: "Преміальний медичний центр довголіття та естетичної медицини у Дніпрі. Персоналізовані програми здоров'я та омолодження. ☎ +380 73 000 0150",
  ru: "Премиальный медицинский центр долголетия и эстетической медицины в Днепре. Персонализированные программы здоровья и омоложения. ☎ +380 73 000 0150",
  en: "Premium longevity and aesthetic medicine center in Dnipro, Ukraine. Personalized health and rejuvenation programs. ☎ +380 73 000 0150",
};

const ogLocales: Record<string, string> = {
  ua: "uk_UA",
  ru: "ru_UA",
  en: "en_US",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale as "ua" | "ru" | "en";

  return {
    metadataBase: new URL("https://genevity.com.ua"),
    title: {
      default: titles[lang] || titles.ua,
      template: "%s | GENEVITY",
    },
    description: descriptions[lang] || descriptions.ua,
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    keywords: [
      "GENEVITY",
      "медичний центр довголіття",
      "естетична медицина",
      "Дніпро",
      "косметологія",
      "апаратна косметологія",
      "longevity medicine",
      "anti-aging",
      "HydraFacial",
      "EMFACE",
      "EMSCULPT NEO",
    ],
    alternates: {
      canonical: locale === "ua" ? "/" : `/${locale}`,
      languages: {
        "uk": "/",
        "ru": "/ru",
        "en": "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: titles[lang] || titles.ua,
      description: descriptions[lang] || descriptions.ua,
      type: "website",
      locale: ogLocales[lang] || "uk_UA",
      siteName: "GENEVITY",
      images: [
        {
          url: "/og/genevity-og.jpg",
          width: 1200,
          height: 630,
          alt: "GENEVITY — медичний центр довголіття у Дніпрі",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[lang] || titles.ua,
      description: descriptions[lang] || descriptions.ua,
      images: ["/og/genevity-og.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    other: {
      "geo.region": "UA-12",
      "geo.placename": "Dnipro",
      "geo.position": "48.4647;35.0461",
      "ICBM": "48.4647, 35.0461",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ua" | "ru" | "en")) {
    notFound();
  }

  const [messages, legalDocs] = await Promise.all([
    getMessages(),
    getLegalDocs(locale),
  ]);

  return (
    <html lang={locale === "ua" ? "uk" : locale} className={`${tenorSans.variable} ${mulish.variable}`}>
      <body className="antialiased">
        <ImageProtection />
        <OrganizationSchema />
        <WebSiteSchema />
        <NextIntlClientProvider messages={messages}>
          <main>{children}</main>
          <Footer legalDocs={legalDocs} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ImageProtection from "@/components/ui/ImageProtection";
import "../globals.css";

export const metadata: Metadata = {
  title: "Genevity — Медичний центр довголіття у Дніпрі",
  description:
    "Медицина довголіття та якості життя. Поєднуємо швейцарські стандарти безпеки та преміальний сервіс.",
  metadataBase: new URL("https://genevity.ua"),
  openGraph: {
    title: "Genevity — Медичний центр довголіття",
    description: "Поєднуємо швейцарські стандарти безпеки та преміальний сервіс",
    type: "website",
    locale: "uk_UA",
  },
};

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

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <ImageProtection />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

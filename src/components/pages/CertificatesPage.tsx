"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CertificateGallery from "@/components/certificates/CertificateGallery";
import type { CertificateDocument } from "@/lib/db/queries";
import type { Locale } from "@/i18n/routing";

const COPY = {
  ua: {
    h1: "Сертифікати на обладнання",
    intro:
      "Усі апарати GENEVITY мають чинні документи про відповідність Технічному регламенту щодо медичних виробів. Нижче — скани на кожен апарат: натисніть, щоб переглянути сторінку у збільшенні.",
    empty: "Незабаром тут з'являться документи.",
    devices: "Апарати",
    usedFor: "Процедури на цих апаратах",
    home: "Головна",
    crumb: "Сертифікати",
    number: "№",
    validUntil: "Дійсний до",
    issuedBy: "Виданий",
  },
  ru: {
    h1: "Сертификаты на оборудование",
    intro:
      "Все аппараты GENEVITY имеют действующие документы о соответствии Техническому регламенту о медицинских изделиях. Ниже — сканы на каждый аппарат: нажмите, чтобы посмотреть страницу в увеличении.",
    empty: "Скоро здесь появятся документы.",
    devices: "Аппараты",
    usedFor: "Процедуры на этих аппаратах",
    home: "Главная",
    crumb: "Сертификаты",
    number: "№",
    validUntil: "Действителен до",
    issuedBy: "Выдан",
  },
  en: {
    h1: "Equipment certificates",
    intro:
      "Every device at GENEVITY holds valid documentation of conformity with Ukraine's technical regulation on medical devices. Below are the scans for each apparatus — tap any page to enlarge it.",
    empty: "Documents will appear here soon.",
    devices: "Devices",
    usedFor: "Procedures performed on these devices",
    home: "Home",
    crumb: "Certificates",
    number: "No.",
    validUntil: "Valid until",
    issuedBy: "Issued by",
  },
} as const;

export default function CertificatesPage({
  documents,
  locale,
}: {
  documents: CertificateDocument[];
  locale: Locale;
}) {
  const t = COPY[(locale as keyof typeof COPY)] ?? COPY.ua;

  return (
    <main className="pt-[140px] pb-[120px]">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
        <Breadcrumbs
          items={[
            { label: t.home, href: "/" },
            { label: t.crumb, href: "/certificates" },
          ]}
          locale={locale}
        />
        <header className="mb-block max-w-[760px]">
          <h1 className="heading-1">{t.h1}</h1>
          <p className="body-l mt-element text-main/70">{t.intro}</p>
        </header>
      </div>

      {documents.length === 0 ? (
        <p className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 body-m text-main/60">
          {t.empty}
        </p>
      ) : (
        <div className="flex flex-col">
          {documents.map((doc) => (
            <section key={doc.key} id={doc.key} aria-labelledby={`cert-${doc.key}`}>
              <CertificateGallery
                items={doc.pages.map((p) => ({
                  url: p.url,
                  alt: p.alt,
                  caption: [doc.doc, doc.number && `${t.number} ${doc.number}`, doc.issuer]
                    .filter(Boolean)
                    .join(" · "),
                }))}
                title={doc.doc}
                headingId={`cert-${doc.key}`}
              />

              <div className="bg-champagne pb-12 lg:pb-16">
                <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-6">
                  <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr] body-m">
                    {doc.number && (
                      <>
                        <dt className="text-muted">{t.number}</dt>
                        <dd className="text-black">{doc.number}</dd>
                      </>
                    )}
                    {doc.issuer && (
                      <>
                        <dt className="text-muted">{t.issuedBy}</dt>
                        <dd className="text-black">{doc.issuer}</dd>
                      </>
                    )}
                    {doc.validUntil && (
                      <>
                        <dt className="text-muted">{t.validUntil}</dt>
                        <dd className="text-black">{doc.validUntil}</dd>
                      </>
                    )}
                    <dt className="text-muted">{t.devices}</dt>
                    <dd className="text-black">{doc.devices.join(" · ")}</dd>
                  </dl>

                  {doc.services.length > 0 && (
                    <div>
                      <h3 className="body-strong text-black mb-3">{t.usedFor}</h3>
                      <ul className="flex flex-wrap gap-2">
                        {doc.services.map((s) => (
                          <li key={`${s.categorySlug}/${s.slug}`}>
                            <Link
                              href={
                                s.slug === s.categorySlug
                                  ? `/services/${s.categorySlug}`
                                  : `/services/${s.categorySlug}/${s.slug}`
                              }
                            >
                              <Button variant="outline" size="sm">
                                {s.title}
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

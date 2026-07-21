"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import type { MediaMentionPublic } from "@/lib/db/queries/media";

const COPY = {
  ua: { h1: "ЗМІ про нас",
    intro: "Публікації, інтерв'ю та згадки про центр GENEVITY та наших експертів у зовнішніх джерелах.",
    empty: "Незабаром тут з'являться публікації.", read: "Читати" },
  ru: { h1: "СМИ о нас",
    intro: "Публикации, интервью и упоминания о центре GENEVITY и наших экспертах во внешних источниках.",
    empty: "Скоро здесь появятся публикации.", read: "Читать" },
  en: { h1: "Media Coverage of Us",
    intro: "Publications, interviews and mentions of the GENEVITY center and our experts in external sources.",
    empty: "Publications will appear here soon.", read: "Read" },
} as const;

function formatDate(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const tag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB";
  try { return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(iso)); } catch { return null; }
}

export default function MediaPage({
  mentions, locale,
}: { mentions: MediaMentionPublic[]; locale: string }) {
  const t = COPY[(locale as keyof typeof COPY)] ?? COPY.ua;

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-[120px] pt-[140px]">
      <header className="mb-block max-w-[720px]">
        <h1 className="heading-1">{t.h1}</h1>
        <p className="body-l mt-element text-main/70">{t.intro}</p>
      </header>

      {mentions.length === 0 ? (
        <p className="body-m text-main/60">{t.empty}</p>
      ) : (
        <motion.ul
          variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {mentions.map((m) => {
            const date = formatDate(m.publishedAt, locale);
            return (
              <motion.li key={m.id} variants={fadeInUp}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-main/10 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-champagne">
                    {m.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt="" loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-rosegold/40 to-champagne" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-card">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.logo} alt="" width={20} height={20}
                        loading="lazy" className="h-5 w-5 rounded-sm"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      <span className="body-s font-medium text-main/70">{m.publisherName}</span>
                    </div>
                    <h2 className="body-strong line-clamp-3 text-main">{m.title}</h2>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {date && <time className="body-s text-main/50">{date}</time>}
                      <span className="body-s font-medium text-rosegold group-hover:underline">
                        {t.read} →
                      </span>
                    </div>
                  </div>
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </main>
  );
}

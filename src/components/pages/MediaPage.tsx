"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import MediaCard from "@/components/media/MediaCard";
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
          {mentions.map((m) => (
            <motion.li key={m.id} variants={fadeInUp}>
              <MediaCard mention={m} locale={locale} readLabel={t.read} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </main>
  );
}

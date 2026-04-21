import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLegalDocBySlug } from "@/lib/db/queries";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

/* ---------- Content parser ---------- */

type Block =
  | { type: "h2"; number?: string; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "p"; text: string }
  | { type: "meta"; lines: string[] };

function parseContent(content: string): Block[] {
  // Split into lines, preserving structure
  const lines = content.split("\n").map((l) => l.trim());
  const blocks: Block[] = [];

  // First: group lines into "sections" separated by numbered headings or blank lines
  let currentParagraphLines: string[] = [];
  let sawIntro = false;

  const flushParagraph = () => {
    if (currentParagraphLines.length === 0) return;

    // If all lines look like list items (start after a heading), group as list
    const isListContext =
      blocks.length > 0 &&
      blocks[blocks.length - 1].type === "h2" &&
      currentParagraphLines.length > 2;

    if (isListContext && currentParagraphLines.every((l) => l.length < 400)) {
      blocks.push({ type: "list", items: [...currentParagraphLines] });
    } else {
      // Join into paragraph(s)
      blocks.push({
        type: "p",
        text: currentParagraphLines.join(" ").replace(/\s+/g, " ").trim(),
      });
    }
    currentParagraphLines = [];
    sawIntro = true;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      flushParagraph();
      continue;
    }

    // Numbered heading: "1.Title" or "1. Title"
    const numMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (numMatch && numMatch[2].length < 150) {
      flushParagraph();
      blocks.push({
        type: "h2",
        number: numMatch[1],
        text: numMatch[2],
      });
      continue;
    }

    // All-caps subheading (but not too long)
    const hasUkrainianOrLatin = /[А-ЯA-Z]/.test(line);
    const isAllCaps = hasUkrainianOrLatin && line === line.toUpperCase();
    if (isAllCaps && line.length < 150 && !sawIntro) {
      flushParagraph();
      blocks.push({ type: "h3", text: line });
      continue;
    }

    // "Додаток 1" / "до Наказу..." / "від ..." — metadata block
    if (
      !sawIntro &&
      /^(Додаток|до Наказу|від \d)/i.test(line) &&
      line.length < 80
    ) {
      // Collect into meta block
      const metaLines: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1] && lines[i + 1].length < 80) {
        const next = lines[i + 1];
        if (/^(Додаток|до Наказу|від \d|№\s)/i.test(next) || next.length < 50) {
          metaLines.push(next);
          i++;
        } else break;
      }
      blocks.push({ type: "meta", lines: metaLines });
      continue;
    }

    // "ФОП Харківська..." attribution — short line after title
    if (!sawIntro && /^ФОП\s/i.test(line) && line.length < 80) {
      blocks.push({ type: "h3", text: line });
      continue;
    }

    currentParagraphLines.push(line);
  }

  flushParagraph();

  return blocks;
}

/* ---------- Page ---------- */

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doc = await getLegalDocBySlug(locale, slug);

  if (!doc || !doc.body) notFound();
  // Alias for compatibility with content parser below
  const content = doc.body;

  const backLabel: Record<string, string> = {
    ua: "Повернутися на головну",
    ru: "Вернуться на главную",
    en: "Back to home",
  };

  const blocks = parseContent(content);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
    <div className="pt-32 pb-24 bg-champagne">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 body-s text-black-40 hover:text-main transition-colors mb-16"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel[locale] || backLabel.ua}
        </Link>

        <article className="max-w-[720px]">
          {/* Title */}
          <h1 className="heading-2 text-black mb-10 text-balance">{doc.title}</h1>

          {/* Blocks */}
          <div className="flex flex-col">
            {blocks.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="heading-3 text-black mt-14 mb-4 first:mt-0 flex items-baseline gap-4"
                  >
                    {block.number && (
                      <span className="body-s text-main font-semibold tabular-nums shrink-0">
                        {block.number.padStart(2, "0")}
                      </span>
                    )}
                    <span className="text-balance">{block.text}</span>
                  </h2>
                );
              }

              if (block.type === "h3") {
                return (
                  <p
                    key={i}
                    className="body-s text-main/80 uppercase tracking-[0.12em] font-semibold mt-2 mb-2 first:mt-0"
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === "meta") {
                return (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 mb-6 body-s text-black-40"
                  >
                    {block.lines.map((line, j) => (
                      <span key={j}>{line}</span>
                    ))}
                  </div>
                );
              }

              if (block.type === "list") {
                return (
                  <ul key={i} className="flex flex-col gap-2.5 mb-6 pl-1">
                    {block.items.map((item, j) => (
                      <li
                        key={j}
                        className="body-m text-black-60 flex items-start gap-3 leading-relaxed"
                      >
                        <span className="w-1 h-1 rounded-full bg-main mt-2.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={i}
                  className="body-m text-black-80 leading-[1.75] mb-5 last:mb-0"
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </article>
      </div>
    </div>
    </>
  );
}

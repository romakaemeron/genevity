import type { SectionSources } from "@/lib/db/types";

export default function SourcesSection({ section }: { section: SectionSources }) {
  if (!section.items?.length) return null;
  return (
    <section>
      {section.heading && <h2 className="heading-2 text-black mb-6"><span>{section.heading}</span></h2>}
      <ol className="list-decimal pl-6 space-y-2">
        {section.items.map((it, i) => (
          <li key={i} className="body-m text-muted">
            <a href={it.url} target="_blank" rel="nofollow noopener noreferrer" className="text-main hover:underline break-words">
              {it.label || it.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

import type { SectionSources } from "@/lib/db/types";

/** Allow only http(s) and mailto absolute URLs; everything else (javascript:,
 *  data:, vbscript:, malformed) is treated as unsafe and rendered as plain text. */
function safeHref(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:" ? url : null;
  } catch {
    return null;
  }
}

export default function SourcesSection({ section }: { section: SectionSources }) {
  if (!section.items?.length) return null;
  return (
    <section>
      {section.heading && <h2 className="heading-2 text-black mb-6"><span>{section.heading}</span></h2>}
      <ol className="list-decimal pl-6 space-y-2">
        {section.items.map((it, i) => {
          const href = safeHref(it.url);
          return (
            <li key={i} className="body-m text-muted">
              {href ? (
                <a href={href} target="_blank" rel="nofollow noopener noreferrer" className="text-main hover:underline break-words">
                  {it.label || it.url}
                </a>
              ) : (
                <span className="body-m text-muted">{it.label || it.url}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

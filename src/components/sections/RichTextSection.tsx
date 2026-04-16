import type { SectionRichText } from "@/sanity/types";

export default function RichTextSection({ heading, body }: SectionRichText) {
  return (
    <section>
      {heading && <h2 className="heading-2 text-black mb-6">{heading}</h2>}
      {body && (
        <div className="body-l text-muted whitespace-pre-line leading-relaxed">
          {body}
        </div>
      )}
    </section>
  );
}

import type { SectionBullets } from "@/sanity/types";

export default function BulletsSection({ heading, items }: SectionBullets) {
  return (
    <section>
      {heading && <h2 className="heading-2 text-black mb-6">{heading}</h2>}
      {items?.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 body-l text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-main mt-2.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

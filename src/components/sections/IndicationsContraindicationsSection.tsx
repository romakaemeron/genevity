import type { SectionIndicationsContraindications } from "@/sanity/types";

export default function IndicationsContraindicationsSection({
  indicationsHeading,
  indications,
  contraindicationsHeading,
  contraindications,
}: SectionIndicationsContraindications) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Indications */}
      <div>
        {indicationsHeading && (
          <h2 className="heading-3 text-black mb-4">{indicationsHeading}</h2>
        )}
        {indications?.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {indications.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 body-l text-muted">
                <span className="text-success mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contraindications */}
      <div>
        {contraindicationsHeading && (
          <h2 className="heading-3 text-black mb-4">{contraindicationsHeading}</h2>
        )}
        {contraindications?.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {contraindications.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 body-l text-muted">
                <span className="text-warning mt-0.5 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

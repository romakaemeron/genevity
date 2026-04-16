import type { SectionSteps } from "@/sanity/types";

export default function StepsSection({ heading, steps }: SectionSteps) {
  return (
    <section>
      {heading && <h2 className="heading-2 text-black mb-8">{heading}</h2>}
      {steps?.length > 0 && (
        <ol className="flex flex-col gap-8">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-main/10 text-main body-strong shrink-0">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1.5 pt-1.5">
                <h3 className="body-strong text-black">{step.title}</h3>
                {step.description && (
                  <p className="body-l text-muted">{step.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

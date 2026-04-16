import { defineType, defineField } from "sanity";

export const sectionCta = defineType({
  name: "section.cta",
  title: "CTA Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "body", title: "Body", type: "localeText" }),
    defineField({ name: "ctaLabel", title: "CTA Label", type: "localeString" }),
    defineField({ name: "ctaHref", title: "CTA Link", type: "string" }),
  ],
  preview: { select: { title: "heading.uk" } },
});

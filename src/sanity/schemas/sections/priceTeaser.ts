import { defineType, defineField } from "sanity";

export const sectionPriceTeaser = defineType({
  name: "section.priceTeaser",
  title: "Price Teaser Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "intro", title: "Intro", type: "localeText" }),
    defineField({ name: "ctaLabel", title: "CTA Label", type: "localeString" }),
  ],
  preview: { select: { title: "heading.uk" } },
});

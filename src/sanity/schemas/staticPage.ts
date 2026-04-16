import { defineType, defineField } from "sanity";

export const staticPage = defineType({
  name: "staticPage",
  title: "Static Page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      description: "Fixed identifier: home, about, prices, stationary, laboratory, contacts",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({ name: "h1", title: "H1", type: "localeString" }),
    defineField({ name: "summary", title: "Summary", type: "localeText" }),
    defineField({
      name: "sections",
      title: "Content Sections",
      type: "array",
      of: [
        { type: "section.richText" },
        { type: "section.bullets" },
        { type: "section.steps" },
        { type: "section.compareTable" },
        { type: "section.indicationsContraindications" },
        { type: "section.priceTeaser" },
        { type: "section.callout" },
        { type: "section.imageGallery" },
        { type: "section.relatedDoctors" },
        { type: "section.cta" },
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [{ type: "faqItem" }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "localeString" }),
        defineField({ name: "description", title: "Description", type: "localeText" }),
        defineField({ name: "ogImage", title: "OG Image", type: "image" }),
        defineField({ name: "noindex", title: "No Index", type: "boolean", initialValue: false }),
      ],
    }),
  ],
  preview: {
    select: { title: "title.uk", subtitle: "slug" },
  },
});

import { defineType, defineField } from "sanity";

export const serviceCategory = defineType({
  name: "serviceCategory",
  title: "Service Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "localeText",
      description: "Short description for index cards",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "serviceCategory" }],
      description: "For sub-categories (e.g. Апаратна → Обличчя)",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
    }),
    defineField({
      name: "clickable",
      title: "Clickable",
      type: "boolean",
      description: "Set to false for non-clickable parents like Longevity & Anti-Age",
      initialValue: true,
    }),
    defineField({
      name: "iconKey",
      title: "Icon Key",
      type: "string",
      description: "References a key in the local icon registry",
    }),
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
      ],
    }),
  ],
  preview: {
    select: { title: "title.uk", subtitle: "slug.current" },
  },
  orderings: [
    { title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
});

import { defineType, defineField } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "h1",
      title: "H1 Override",
      type: "localeString",
      description: "Distinct from menu title where useful for SEO",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "serviceCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "localeText",
      description: "Short hook (1-2 sentences) for cards & meta description",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "procedureLength", title: "Procedure Length", type: "localeString" }),
    defineField({ name: "effectDuration", title: "Effect Duration", type: "localeString" }),
    defineField({ name: "sessionsRecommended", title: "Sessions Recommended", type: "localeString" }),
    defineField({ name: "priceFrom", title: "Price From", type: "localeString" }),
    defineField({ name: "priceUnit", title: "Price Unit", type: "localeString" }),
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
      name: "relatedDoctors",
      title: "Related Doctors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "doctor" }] }],
    }),
    defineField({
      name: "relatedServices",
      title: "Related Services",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
    }),
    defineField({
      name: "relatedEquipment",
      title: "Related Equipment",
      type: "array",
      of: [{ type: "reference", to: [{ type: "equipment" }] }],
    }),
    defineField({
      name: "keywords",
      title: "Keywords (SEO)",
      type: "object",
      fields: [
        defineField({ name: "primary", title: "Primary", type: "localeStringArray" }),
        defineField({ name: "secondary", title: "Secondary", type: "localeStringArray" }),
      ],
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
    defineField({
      name: "order",
      title: "Order (within category)",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "title.uk", subtitle: "category.title.uk" },
  },
  orderings: [
    { title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
});

import { defineType, defineField } from "sanity";

export const legalDoc = defineType({
  name: "legalDoc",
  title: "Legal Documents",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Document Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: { source: "title.uk" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shortLabel",
      title: "Short Label (for footer)",
      type: "localeString",
      description: "Short label shown in the footer",
    }),
    defineField({
      name: "content",
      title: "Content (Markdown)",
      type: "localeText",
      description: "Full document content. Paragraphs separated by blank lines.",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
    }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title.uk" },
  },
});

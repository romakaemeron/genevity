import { defineType, defineField } from "sanity";

export const equipment = defineType({
  name: "equipment",
  title: "Equipment",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Face", value: "face" },
          { title: "Body", value: "body" },
          { title: "Skin", value: "skin" },
          { title: "Intimate", value: "intimate" },
          { title: "Laser", value: "laser" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "shortDescription", title: "Short Description", type: "localeString" }),
    defineField({ name: "description", title: "Full Description", type: "localeText" }),
    defineField({ name: "suits", title: "Suits (conditions)", type: "localeStringArray" }),
    defineField({ name: "results", title: "Results", type: "localeStringArray" }),
    defineField({ name: "note", title: "Note", type: "localeString" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});

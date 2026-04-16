import { defineType, defineField } from "sanity";

export const sectionBullets = defineType({
  name: "section.bullets",
  title: "Bullets Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "items", title: "Items", type: "localeStringArray" }),
  ],
  preview: { select: { title: "heading.uk" } },
});

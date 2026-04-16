import { defineType, defineField } from "sanity";

export const sectionRichText = defineType({
  name: "section.richText",
  title: "Rich Text Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "body", title: "Body", type: "localeText" }),
  ],
  preview: { select: { title: "heading.uk", subtitle: "body.uk" } },
});

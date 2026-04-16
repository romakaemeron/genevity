import { defineType, defineField } from "sanity";

export const sectionSteps = defineType({
  name: "section.steps",
  title: "Steps Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "localeString" }),
            defineField({ name: "description", title: "Description", type: "localeText" }),
          ],
          preview: { select: { title: "title.uk" } },
        },
      ],
    }),
  ],
  preview: { select: { title: "heading.uk" } },
});

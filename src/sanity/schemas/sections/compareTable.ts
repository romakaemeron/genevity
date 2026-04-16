import { defineType, defineField } from "sanity";

export const sectionCompareTable = defineType({
  name: "section.compareTable",
  title: "Compare Table Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({
      name: "columns",
      title: "Column Headers",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Row Label", type: "localeString" }),
            defineField({ name: "values", title: "Values", type: "localeStringArray" }),
          ],
          preview: { select: { title: "label.uk" } },
        },
      ],
    }),
  ],
  preview: { select: { title: "heading.uk" } },
});

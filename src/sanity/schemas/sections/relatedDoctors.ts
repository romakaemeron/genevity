import { defineType, defineField } from "sanity";

export const sectionRelatedDoctors = defineType({
  name: "section.relatedDoctors",
  title: "Related Doctors Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({
      name: "doctors",
      title: "Doctors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "doctor" }] }],
    }),
  ],
  preview: { select: { title: "heading.uk" } },
});

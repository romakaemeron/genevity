import { defineType, defineField } from "sanity";

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ Item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "localeText",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "question.uk" } },
});

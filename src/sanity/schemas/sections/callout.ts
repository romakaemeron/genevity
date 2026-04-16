import { defineType, defineField } from "sanity";

export const sectionCallout = defineType({
  name: "section.callout",
  title: "Callout Section",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      options: {
        list: [
          { title: "Info", value: "info" },
          { title: "Warning", value: "warning" },
          { title: "Success", value: "success" },
        ],
      },
      initialValue: "info",
    }),
    defineField({ name: "body", title: "Body", type: "localeText" }),
  ],
  preview: {
    select: { tone: "tone", body: "body.uk" },
    prepare: ({ tone, body }) => ({
      title: `Callout (${tone || "info"})`,
      subtitle: body,
    }),
  },
});

import { defineType, defineField } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Menu Items",
      type: "array",
      of: [{ type: "navItem" }],
    }),
    defineField({
      name: "cta",
      title: "CTA Button",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "localeString" }),
        defineField({ name: "href", title: "URL", type: "string" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Navigation" }),
  },
});

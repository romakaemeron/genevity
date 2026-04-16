import { defineType, defineField } from "sanity";

export const navItem = defineType({
  name: "navItem",
  title: "Navigation Item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "localeString",
      description: "Leave empty for non-clickable parents",
    }),
    defineField({
      name: "category",
      title: "Linked Category",
      type: "reference",
      to: [{ type: "serviceCategory" }],
      description: "If set, mega-menu pulls services from this category",
    }),
    defineField({
      name: "isMegaMenu",
      title: "Is Mega Menu",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "label.uk", order: "order" },
    prepare: ({ title, order }) => ({
      title: title || "Untitled",
      subtitle: order != null ? `Order: ${order}` : undefined,
    }),
  },
});

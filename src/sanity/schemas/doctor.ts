import { defineType, defineField } from "sanity";

export const doctor = defineType({
  name: "doctor",
  title: "Doctor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Role / Specialty", type: "localeString" }),
    defineField({ name: "experience", title: "Experience", type: "localeString" }),
    defineField({ name: "specialties", title: "Specialties List", type: "localeStringArray" }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "photoCard", title: "Photo (Card)", type: "image", options: { hotspot: true }, description: "Small version for carousel cards" }),
    defineField({ name: "photoModal", title: "Photo (Modal)", type: "image", options: { hotspot: true }, description: "High-quality version for detail modal" }),
    defineField({ name: "cardPosition", title: "Card Photo Position", type: "string", description: "CSS object-position, e.g. 'center 10%'" }),
    defineField({ name: "modalPosition", title: "Modal Photo Position", type: "string", description: "CSS object-position, e.g. 'center 20%'" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name.uk", subtitle: "role.uk", media: "photoCard" },
  },
});

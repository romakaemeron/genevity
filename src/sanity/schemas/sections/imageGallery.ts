import { defineType, defineField } from "sanity";

export const sectionImageGallery = defineType({
  name: "section.imageGallery",
  title: "Image Gallery Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
  preview: { select: { title: "heading.uk" } },
});

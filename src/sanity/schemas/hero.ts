import { defineType, defineField } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero Section",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({ name: "subtitle", title: "Subtitle", type: "localeText" }),
    defineField({ name: "cta", title: "CTA Button Text", type: "localeString" }),
    defineField({ name: "location", title: "Location Text", type: "localeString" }),
    defineField({ name: "backgroundImage", title: "Background Image", type: "image", options: { hotspot: true } }),
  ],
  preview: {
    prepare: () => ({ title: "Hero Section" }),
  },
});

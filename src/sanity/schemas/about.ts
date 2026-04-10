import { defineType, defineField } from "sanity";

export const about = defineType({
  name: "about",
  title: "About Section",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({ name: "text1", title: "Main Text", type: "localeText" }),
    defineField({ name: "text2", title: "Accent Text", type: "localeText" }),
    defineField({ name: "diagnostics", title: "Diagnostics Text", type: "localeText" }),
  ],
  preview: {
    prepare: () => ({ title: "About Section" }),
  },
});

import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "phone1", title: "Phone 1", type: "string" }),
    defineField({ name: "phone2", title: "Phone 2", type: "string" }),
    defineField({ name: "address", title: "Address", type: "localeString" }),
    defineField({ name: "instagram", title: "Instagram Handle", type: "string" }),
    defineField({ name: "hours", title: "Working Hours", type: "localeString" }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});

import { defineType } from "sanity";

export const localeString = defineType({
  name: "localeString",
  title: "Localized String",
  type: "object",
  fields: [
    { name: "uk", title: "Українська", type: "string" },
    { name: "ru", title: "Русский", type: "string" },
    { name: "en", title: "English", type: "string" },
  ],
});

export const localeText = defineType({
  name: "localeText",
  title: "Localized Text",
  type: "object",
  fields: [
    { name: "uk", title: "Українська", type: "text" },
    { name: "ru", title: "Русский", type: "text" },
    { name: "en", title: "English", type: "text" },
  ],
});

export const localeStringArray = defineType({
  name: "localeStringArray",
  title: "Localized String Array",
  type: "object",
  fields: [
    { name: "uk", title: "Українська", type: "array", of: [{ type: "string" }] },
    { name: "ru", title: "Русский", type: "array", of: [{ type: "string" }] },
    { name: "en", title: "English", type: "array", of: [{ type: "string" }] },
  ],
});

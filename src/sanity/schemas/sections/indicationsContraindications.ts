import { defineType, defineField } from "sanity";

export const sectionIndicationsContraindications = defineType({
  name: "section.indicationsContraindications",
  title: "Indications & Contraindications",
  type: "object",
  fields: [
    defineField({ name: "indicationsHeading", title: "Indications Heading", type: "localeString" }),
    defineField({ name: "indications", title: "Indications", type: "localeStringArray" }),
    defineField({ name: "contraindicationsHeading", title: "Contraindications Heading", type: "localeString" }),
    defineField({ name: "contraindications", title: "Contraindications", type: "localeStringArray" }),
  ],
  preview: {
    prepare: () => ({ title: "Показання / Протипоказання" }),
  },
});

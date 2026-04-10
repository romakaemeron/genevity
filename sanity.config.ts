import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemas";

export default defineConfig({
  name: "genevity",
  title: "GENEVITY CMS",
  projectId: "qzct6skk",
  dataset: "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});

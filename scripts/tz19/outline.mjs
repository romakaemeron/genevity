/** Print one extracted document as an indexed outline, for authoring page plans.
 *  Run: node scripts/tz19/outline.mjs <slug> */
import fs from "node:fs";
const slug = process.argv[2];
const d = JSON.parse(fs.readFileSync(`scripts/tz19/raw/${slug}.json`, "utf-8"));
console.log(`# ${d.docTitle}\n`);
d.nodes.forEach((n, i) => {
  const idx = String(i).padStart(3);
  if (n.kind === "heading") console.log(`${idx} H${n.level} ${n.text}`);
  else if (n.kind === "list") n.items.forEach((it, j) => console.log(`${idx}.${j} •  ${it}`));
  else console.log(`${idx}  p  ${n.text}`);
});

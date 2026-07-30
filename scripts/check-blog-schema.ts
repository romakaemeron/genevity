/**
 * Exercise parseBlogPostForm against the cases that matter.
 * Run: npx tsx scripts/check-blog-schema.ts
 */
import { parseBlogPostForm } from "../src/app/(admin)/admin/blog/_schema";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

const base = { slug: "my-post", titleUk: "Заголовок", readTimeMinutes: "5", isDraft: "false" };
let failures = 0;
function check(name: string, cond: boolean) {
  console.log(cond ? `✓ ${name}` : `✗ ${name}`);
  if (!cond) failures++;
}

const ok = parseBlogPostForm(fd({ ...base, publishedAt: "2026-01-01T10:00" }), "");
check("valid post parses", ok.ok === true);
check("published date kept", ok.ok && ok.data.publishedAt!.startsWith("2026-01-01"));

const noDate = parseBlogPostForm(fd({ ...base }), "");
check("published without date gets now", noDate.ok === true && noDate.data.publishedAt !== null);

const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);
const fut = parseBlogPostForm(fd({ ...base, publishedAt: future }), "");
check("future date on published post rejected", fut.ok === false);

const futDraft = parseBlogPostForm(fd({ ...base, isDraft: "true", publishedAt: future }), "");
check("future date allowed on draft", futDraft.ok === true);

const badSlug = parseBlogPostForm(fd({ ...base, slug: "Мій Пост!" }), "");
check("cyrillic/space slug rejected", badSlug.ok === false);

const upper = parseBlogPostForm(fd({ ...base, slug: "My-Post" }), "");
check("uppercase slug normalised", upper.ok === true && upper.data.slug === "my-post");

const noTitle = parseBlogPostForm(fd({ ...base, titleUk: "  " }), "");
check("empty UK title rejected", noTitle.ok === false);

const tags = parseBlogPostForm(fd({ ...base, tags: " ботокс , , омолодження " }), "");
check("tags trimmed and emptied", tags.ok === true && tags.data.tags.length === 2);

process.exit(failures === 0 ? 0 : 1);

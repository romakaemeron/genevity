import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const LANG: Record<"ru" | "en", string> = { ru: "Russian", en: "English" };

/**
 * Translate a single Ukrainian article headline into RU or EN.
 * One-shot, used at save-time and cached in DB. Never throws — returns ""
 * on empty input or any failure so callers can fall back to manual entry.
 */
export async function translateHeadline(text: string, target: "ru" | "en"): Promise<string> {
  const src = text.trim();
  if (!src) return "";
  try {
    const { text: out } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt:
        `Translate this Ukrainian aesthetic-medicine article headline into ${LANG[target]}. ` +
        `Preserve the meaning and a natural editorial register. ` +
        `Return ONLY the translation, no quotes, no extra text.\n\n${src}`,
    });
    return out.trim();
  } catch (e) {
    console.error("translateHeadline failed:", e);
    return "";
  }
}

/**
 * Fingerprint of the markup skeleton: every tag in document order, plus the
 * src/href values that must survive verbatim. Two documents with the same
 * signature have the same elements in the same nesting, so only text changed.
 */
function tagSignature(html: string): string {
  const parts: string[] = [];
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(html)) !== null) {
    const [, closing, name, attrs] = m;
    const urls = [...attrs.matchAll(/\b(src|href)\s*=\s*["']([^"']*)["']/g)]
      .map(a => `${a[1].toLowerCase()}=${a[2]}`)
      .join(",");
    parts.push(`${closing}${name.toLowerCase()}${urls ? `[${urls}]` : ""}`);
  }
  return parts.join(">");
}

function stripFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:html)?\s*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

/**
 * Translate an HTML article body into RU or EN, preserving the markup exactly.
 *
 * The editor stores Tiptap HTML, so the tag structure must survive the round
 * trip — only the text nodes change. The model is not trusted: the result is
 * compared tag-for-tag against the source and retried once if it drifted.
 * Never throws: returns "" on failure so the caller can fall back to manual
 * entry rather than overwriting the editor's work with mangled markup.
 */
export async function translateHtml(html: string, target: "ru" | "en"): Promise<string> {
  const src = html.trim();
  if (!src) return "";
  const want = tagSignature(src);

  const basePrompt =
    `Translate the text content of this Ukrainian aesthetic-medicine article into ${LANG[target]}.\n` +
    `Rules:\n` +
    `- Keep the HTML markup byte-for-byte identical: same tags, same order, same attributes.\n` +
    `- Translate ONLY the text between tags, and alt/title attribute values.\n` +
    `- Never change src or href values.\n` +
    `- Do not add, remove, merge or reorder any element.\n` +
    `- Keep medical terminology accurate and the register editorial.\n` +
    `- Return ONLY the resulting HTML, with no code fence and no commentary.\n\n${src}`;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt:
          attempt === 0
            ? basePrompt
            : `${basePrompt}\n\nIMPORTANT: your previous attempt changed the tag structure. ` +
              `Copy the markup across unchanged and translate only the visible text.`,
      });
      const out = stripFence(text);
      if (out && tagSignature(out) === want) return out;
    }
    console.error("translateHtml: tag structure not preserved after 2 attempts");
    return "";
  } catch (e) {
    console.error("translateHtml failed:", e);
    return "";
  }
}

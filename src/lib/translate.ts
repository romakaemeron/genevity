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
 * Attributes whose *value* must survive verbatim, because the value itself
 * carries structure or a target that translation must never touch. Everything
 * else is compared by name only — notably alt/title, whose values are supposed
 * to change (translating them is the point), and style/class, where harmless
 * reformatting would otherwise trip the check.
 */
/** Longest body we will send in one shot; see translateHtml. */
const MAX_BODY_CHARS = 50_000;

const PINNED_ATTRS = new Set(["src", "href", "colspan", "rowspan", "data-type", "data-checked"]);

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
const ATTR_RE = /([a-zA-Z_:][-\w:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g;

/**
 * Fingerprint of the markup skeleton. For every tag, in document order: whether
 * it opens or closes, its name, the full set of attribute names on it, and the
 * values of the PINNED_ATTRS above.
 *
 * Two documents with the same signature therefore have the same elements in the
 * same order and nesting, each carrying the same attributes, with images/links
 * pointing at the same targets and table spans and Tiptap node types intact.
 * What they may differ in is text content and the values of non-pinned
 * attributes such as alt and title — exactly what a translation should change.
 *
 * Exported so the guarantee can be exercised directly.
 */
export function tagSignature(html: string): string {
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(html)) !== null) {
    const [, closing, name, rawAttrs] = m;
    const attrs: string[] = [];
    let a: RegExpExecArray | null;
    ATTR_RE.lastIndex = 0;
    while ((a = ATTR_RE.exec(rawAttrs)) !== null) {
      const attr = a[1].toLowerCase();
      const value = a[2] ?? a[3] ?? a[4] ?? "";
      attrs.push(PINNED_ATTRS.has(attr) ? `${attr}=${value}` : attr);
    }
    attrs.sort();
    parts.push(`${closing}${name.toLowerCase()}[${attrs.join(",")}]`);
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
  // Past this length the answer risks being truncated by the output limit, which
  // would read as structure drift and burn a pointless retry. Refuse up front.
  if (src.length > MAX_BODY_CHARS) {
    console.error(`translateHtml: body of ${src.length} chars exceeds the ${MAX_BODY_CHARS} limit`);
    return "";
  }
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

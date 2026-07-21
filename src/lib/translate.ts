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

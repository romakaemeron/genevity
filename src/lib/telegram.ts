/**
 * Thin Telegram Bot API wrapper for outbound notifications.
 *
 * Mirrors `src/lib/email.ts` deliberately: plain `fetch` (no dependency), one
 * exported sender so retries or observability later touch a single file, and a
 * soft failure when the credentials are missing — local dev and preview deploys
 * must keep working without the secrets wired up.
 *
 * Outbound only. The bot receives nothing: there is no webhook, no polling and
 * no command handling, so nothing here is reachable from the internet.
 */

interface SendTelegramOptions {
  /** Message body. HTML by default — see `escapeHtml` for what must be escaped. */
  text: string;
  /** Override the default chat (`TELEGRAM_CHAT_ID`). */
  chatId?: string;
  /** Telegram rejects malformed HTML with a 400; pass "none" to send raw text. */
  parseMode?: "HTML" | "none";
}

export interface TelegramSendResult {
  ok: boolean;
  /** Populated when Telegram accepted the message. */
  messageId?: number;
  /** Populated on failure OR when the send was skipped as unconfigured.
   *  Safe to log; never surface to end-users. */
  reason?: string;
}

const API_BASE = "https://api.telegram.org";

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Escape the three characters Telegram's HTML parser treats as markup.
 *
 * Note this is a *smaller* set than HTML escaping proper — Telegram wants `"`
 * and `'` left alone, and escaping them shows the entities literally.
 */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendTelegram(
  opts: SendTelegramOptions,
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts.chatId ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    // Soft-fail so the caller (a booking that already exists in RoApp) still
    // succeeds — the appointment is never lost over a missing notification.
    return { ok: false, reason: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured" };
  }

  try {
    const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: opts.text,
        ...(opts.parseMode === "none" ? {} : { parse_mode: "HTML" }),
        // A booking notification carries a page URL; without this Telegram
        // renders a preview card that buries the actual message.
        disable_web_page_preview: true,
      }),
      // Telegram is fast, but a hung request must not hold up the server action.
      signal: AbortSignal.timeout(10_000),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string; result?: { message_id?: number } }
      | null;

    if (!res.ok || !json?.ok) {
      return {
        ok: false,
        reason: `Telegram ${res.status}: ${(json?.description ?? "").slice(0, 200)}`,
      };
    }
    return { ok: true, messageId: json.result?.message_id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

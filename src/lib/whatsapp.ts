import "server-only";

/**
 * WhatsApp Cloud API — confirmation messages to the patient.
 *
 * The third sibling of `email.ts` and `telegram.ts`, and the same discipline:
 * plain `fetch`, no dependency, soft failure when unconfigured so a missing
 * credential can never cost a booking.
 *
 * ── Why templates, not text ─────────────────────────────────────────────────
 *
 * The patient hasn't messaged us, so this is a *business-initiated* message and
 * WhatsApp only allows those as templates approved by Meta in advance. Free
 * text is possible only inside the 24-hour window opened by an inbound message,
 * which a booking confirmation is never in. See docs/whatsapp-setup.md for the
 * template text and how to submit it.
 *
 * ── Consent ────────────────────────────────────────────────────────────────
 *
 * WhatsApp's policy requires explicit opt-in before messaging anyone. The
 * wizard asks with an unticked checkbox and the answer is stored on the
 * submission; nothing here is called without it.
 */

export type WhatsAppOutcome = "sent" | "unreachable" | "failed" | "skipped";

export interface WhatsAppResult {
  outcome: WhatsAppOutcome;
  /** Set when Meta accepted the message. */
  messageId?: string;
  /** Populated on failure or skip. Safe to log; never shown to a patient. */
  reason?: string;
}

interface SendTemplateOptions {
  /** Recipient in international format, digits only ("380671234567"). */
  to: string;
  /** Approved template name, e.g. "booking_confirmation". */
  template: string;
  /** Template language code, e.g. "uk". Must match an approved translation. */
  language: string;
  /** Values for {{1}}, {{2}}, … in the template body, in order. */
  bodyParams: string[];
}

/**
 * Pinned rather than tracking the newest automatically: Meta ships a new Graph
 * version every few months and each is supported for at least two years, so a
 * pin is stability, not staleness. Override with WHATSAPP_API_VERSION.
 */
const DEFAULT_API_VERSION = "v26.0";

/**
 * Meta error codes that mean "this number can't receive it", as opposed to
 * "sending is broken". Worth separating: the first is a patient to phone, the
 * second is an integration to fix, and the clinic's alert says which.
 */
const UNREACHABLE_CODES = new Set([131026, 131047, 131051, 1013]);

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsAppTemplate(
  opts: SendTemplateOptions,
): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return {
      outcome: "skipped",
      reason: "WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured",
    };
  }

  const version = process.env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION;
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: opts.to,
        type: "template",
        template: {
          name: opts.template,
          language: { code: opts.language },
          components: [
            {
              type: "body",
              parameters: opts.bodyParams.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
      // Shorter than the other senders: this one runs while the visitor is
      // still waiting on the confirmation screen.
      signal: AbortSignal.timeout(6_000),
    });

    const json = (await res.json().catch(() => null)) as {
      messages?: Array<{ id?: string }>;
      error?: { code?: number; message?: string; error_data?: { details?: string } };
    } | null;

    if (!res.ok || json?.error) {
      const code = json?.error?.code;
      const detail = json?.error?.error_data?.details || json?.error?.message || "";
      return {
        outcome: code && UNREACHABLE_CODES.has(code) ? "unreachable" : "failed",
        reason: `WhatsApp ${res.status}${code ? ` (${code})` : ""}: ${detail.slice(0, 200)}`,
      };
    }

    return { outcome: "sent", messageId: json?.messages?.[0]?.id };
  } catch (err) {
    return {
      outcome: "failed",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

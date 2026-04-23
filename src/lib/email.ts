/**
 * Thin Resend wrapper that sends transactional email via their REST API.
 * Uses plain `fetch` (no extra dependency) so we can keep the bundle size
 * flat. All senders in the codebase funnel through `sendEmail()` below so
 * adding observability / retries later only touches one file.
 *
 * No-ops safely when `RESEND_API_KEY` is unset (e.g. local dev, preview
 * deploys without the secret wired up) so form submissions still save to
 * the admin portal even when email delivery isn't configured.
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** Rendered HTML body. */
  html: string;
  /** Plain-text fallback. Most clients show this if HTML rendering fails. */
  text: string;
  /** Optional reply-to so staff can reply directly to the submitter. */
  replyTo?: string;
}

export interface EmailSendResult {
  ok: boolean;
  /** Populated when Resend accepted the message. */
  id?: string;
  /** Populated when the call failed OR was skipped because the API key is
   *  missing. Safe to log but don't surface to end-users. */
  reason?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Sender address used on every transactional email. Defaults to a
 * Resend-hosted onboarding address that works without domain
 * verification — good enough for local dev. Override with
 * `EMAIL_FROM` once you've verified the genevity.com.ua domain in
 * Resend so messages pass SPF/DKIM from the real sending domain.
 */
function sender(): string {
  return process.env.EMAIL_FROM || "GENEVITY <onboarding@resend.dev>";
}

export async function sendEmail(opts: SendEmailOptions): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Soft-fail so the caller (form submission, etc.) still succeeds —
    // the submission is saved in the admin portal; email just isn't sent.
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender(),
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      // Resend is fast but don't let a hung request hold up the server action.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

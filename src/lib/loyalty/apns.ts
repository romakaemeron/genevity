import http2 from "node:http2";

/**
 * APNs pushes that tell Apple Wallet "a pass changed, ask the web service".
 * The payload is empty; Wallet then calls our /v1 endpoints. Auth is the same
 * Pass Type ID certificate used to sign passes. Never log tokens or cert material.
 */

const APNS_ORIGIN = "https://api.push.apple.com";
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_TIMEOUT_MS = 10_000;

export interface ApnsResponse {
  /** HTTP status; 0 when the request failed before a response (network, timeout). */
  status: number;
  reason?: string;
}

/** One HTTP/2 session; `send` may be called concurrently. */
export interface ApnsTransport {
  send(pushToken: string, topic: string, timeoutMs: number): Promise<ApnsResponse>;
  close(): void;
}

export type ApnsTransportFactory = () => ApnsTransport;

export interface PushOutcome {
  token: string;
  ok: boolean;
  status: number;
  reason?: string;
  /** APNs says the token will never work again; its registrations should go. */
  dead: boolean;
}

function fromB64(name: string): string {
  return Buffer.from(process.env[name] ?? "", "base64").toString("utf8");
}

export function isApnsConfigured(): boolean {
  return ["APPLE_PASS_CERT_PEM", "APPLE_PASS_KEY_PEM", "APPLE_PASS_TYPE_ID"].every((k) =>
    Boolean(process.env[k]?.trim()),
  );
}

/** Real transport: client-certificate HTTP/2 session to APNs production. */
export function createHttp2Transport(): ApnsTransport {
  const session = http2.connect(APNS_ORIGIN, {
    cert: fromB64("APPLE_PASS_CERT_PEM"),
    key: fromB64("APPLE_PASS_KEY_PEM"),
    passphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
  });
  // Session-level errors surface per request; never let them crash the process.
  session.on("error", () => {});

  return {
    send(pushToken, topic, timeoutMs) {
      return new Promise<ApnsResponse>((resolve) => {
        let settled = false;
        const done = (r: ApnsResponse) => {
          if (!settled) {
            settled = true;
            resolve(r);
          }
        };
        let req: http2.ClientHttp2Stream;
        try {
          req = session.request({
            ":method": "POST",
            ":path": `/3/device/${pushToken}`,
            "apns-topic": topic,
            "apns-push-type": "background",
            "apns-priority": "5",
            "content-type": "application/json",
          });
        } catch {
          done({ status: 0 });
          return;
        }
        let status = 0;
        let body = "";
        req.setTimeout(timeoutMs, () => {
          req.close(http2.constants.NGHTTP2_CANCEL);
          done({ status: 0, reason: "Timeout" });
        });
        req.on("response", (headers) => {
          status = Number(headers[":status"]) || 0;
        });
        req.setEncoding("utf8");
        req.on("data", (chunk: string) => {
          if (body.length < 1024) body += chunk;
        });
        req.on("end", () => {
          let reason: string | undefined;
          try {
            const parsed = body ? (JSON.parse(body) as { reason?: unknown }) : {};
            if (typeof parsed.reason === "string") reason = parsed.reason.slice(0, 64);
          } catch {
            // Non-JSON body: keep the status only.
          }
          done({ status, reason });
        });
        req.on("error", () => done({ status: 0 }));
        req.end("{}");
      });
    },
    close() {
      session.close();
    },
  };
}

/** 410, or 400 with a reason meaning the token is permanently invalid. */
export function isDeadToken(r: ApnsResponse): boolean {
  if (r.status === 410) return true;
  return r.status === 400 && (r.reason === "BadDeviceToken" || r.reason === "Unregistered");
}

/**
 * Pushes an (empty) update notification to every token over one session,
 * with bounded concurrency. Dead tokens are handed to `onDeadToken`
 * (best effort: its failures are swallowed). Never throws for per-token errors.
 */
export async function pushPassUpdates(
  tokens: string[],
  opts: {
    topic: string;
    createTransport?: ApnsTransportFactory;
    onDeadToken?: (token: string) => Promise<void>;
    concurrency?: number;
    timeoutMs?: number;
  },
): Promise<PushOutcome[]> {
  const unique = [...new Set(tokens)];
  if (unique.length === 0) return [];
  const transport = (opts.createTransport ?? createHttp2Transport)();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const outcomes: PushOutcome[] = new Array(unique.length);
  let next = 0;

  async function worker() {
    while (next < unique.length) {
      const i = next++;
      const token = unique[i];
      let r: ApnsResponse;
      try {
        r = await transport.send(token, opts.topic, timeoutMs);
      } catch {
        r = { status: 0 };
      }
      const dead = isDeadToken(r);
      outcomes[i] = { token, ok: r.status === 200, status: r.status, reason: r.reason, dead };
      if (dead && opts.onDeadToken) {
        await opts.onDeadToken(token).catch(() => {});
      }
    }
  }

  try {
    const n = Math.max(1, Math.min(opts.concurrency ?? DEFAULT_CONCURRENCY, unique.length));
    await Promise.all(Array.from({ length: n }, worker));
  } finally {
    transport.close();
  }
  return outcomes;
}

export function summarizePushes(outcomes: PushOutcome[]): { pushed: number; failed: number } {
  const pushed = outcomes.filter((o) => o.ok).length;
  return { pushed, failed: outcomes.length - pushed };
}

import { describe, expect, it, vi } from "vitest";
import { isDeadToken, pushPassUpdates, summarizePushes, type ApnsResponse, type ApnsTransport } from "./apns";

function fakeTransport(byToken: Record<string, ApnsResponse | Error>) {
  let inFlight = 0;
  let maxInFlight = 0;
  const t: ApnsTransport & { closed: number; calls: Array<{ token: string; topic: string }> } = {
    closed: 0,
    calls: [],
    async send(token, topic) {
      t.calls.push({ token, topic });
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 1));
      inFlight--;
      const r = byToken[token] ?? { status: 200 };
      if (r instanceof Error) throw r;
      return r;
    },
    close() {
      t.closed++;
    },
  };
  return { t, maxInFlight: () => maxInFlight };
}

describe("isDeadToken", () => {
  it("410 and permanent 400 reasons are dead; others are not", () => {
    expect(isDeadToken({ status: 410, reason: "Unregistered" })).toBe(true);
    expect(isDeadToken({ status: 400, reason: "BadDeviceToken" })).toBe(true);
    expect(isDeadToken({ status: 400, reason: "Unregistered" })).toBe(true);
    expect(isDeadToken({ status: 400, reason: "BadTopic" })).toBe(false);
    expect(isDeadToken({ status: 429 })).toBe(false);
    expect(isDeadToken({ status: 0 })).toBe(false);
    expect(isDeadToken({ status: 200 })).toBe(false);
  });
});

describe("pushPassUpdates", () => {
  it("does nothing (no session) for no tokens", async () => {
    const factory = vi.fn();
    expect(await pushPassUpdates([], { topic: "pass.x", createTransport: factory })).toEqual([]);
    expect(factory).not.toHaveBeenCalled();
  });

  it("dedupes, uses one session, closes it, and reports per-token outcomes", async () => {
    const { t } = fakeTransport({
      dead410: { status: 410, reason: "Unregistered" },
      bad400: { status: 400, reason: "BadDeviceToken" },
      throttled: { status: 429, reason: "TooManyRequests" },
      boom: new Error("socket"),
    });
    const factory = vi.fn(() => t);
    const onDeadToken = vi.fn<(token: string) => Promise<void>>(async () => {});
    const out = await pushPassUpdates(["ok1", "ok1", "dead410", "bad400", "throttled", "boom"], {
      topic: "pass.x",
      createTransport: factory,
      onDeadToken,
    });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(t.closed).toBe(1);
    expect(t.calls.every((c) => c.topic === "pass.x")).toBe(true);
    expect(out.map((o) => [o.token, o.ok, o.dead])).toEqual([
      ["ok1", true, false],
      ["dead410", false, true],
      ["bad400", false, true],
      ["throttled", false, false],
      ["boom", false, false],
    ]);
    expect(onDeadToken.mock.calls.map((c) => c[0]).sort()).toEqual(["bad400", "dead410"]);
    expect(summarizePushes(out)).toEqual({ pushed: 1, failed: 4 });
  });

  it("bounds concurrency", async () => {
    const tokens = Array.from({ length: 50 }, (_, i) => `t${i}`);
    const { t, maxInFlight } = fakeTransport({});
    const out = await pushPassUpdates(tokens, { topic: "p", createTransport: () => t, concurrency: 4 });
    expect(out).toHaveLength(50);
    expect(maxInFlight()).toBeLessThanOrEqual(4);
    expect(maxInFlight()).toBeGreaterThan(1);
  });

  it("swallows dead-token cleanup failures and still closes the session", async () => {
    const { t } = fakeTransport({ d: { status: 410 } });
    const out = await pushPassUpdates(["d"], {
      topic: "p",
      createTransport: () => t,
      onDeadToken: async () => {
        throw new Error("db down");
      },
    });
    expect(out[0].dead).toBe(true);
    expect(t.closed).toBe(1);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/queries/loyalty", () => ({ getCardByAddToken: vi.fn() }));
vi.mock("@/lib/loyalty/google", () => ({ isGoogleConfigured: vi.fn(), createSaveUrl: vi.fn() }));

import { getCardByAddToken } from "@/lib/db/queries/loyalty";
import { createSaveUrl, isGoogleConfigured } from "@/lib/loyalty/google";
import { GET } from "./route";

const ADD = "A".repeat(32);
const VERIFY = "V".repeat(32);
const card = (status: "active" | "revoked" = "active") => ({ id: "1", addToken: ADD, verifyToken: VERIFY, status });
const call = (token: string) => GET(new Request(`http://x/api/loyalty/google/${token}`), { params: Promise.resolve({ addToken: token }) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(isGoogleConfigured).mockReturnValue(true);
});

describe("GET /api/loyalty/google/[addToken]", () => {
  it("malformed token -> 404 without querying", async () => {
    expect((await call("short")).status).toBe(404);
    expect(getCardByAddToken).not.toHaveBeenCalled();
  });
  it("unknown -> 404", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(null);
    expect((await call(ADD)).status).toBe(404);
  });
  it("verify token in add position -> 404, no link minted", async () => {
    vi.mocked(getCardByAddToken).mockImplementation(async (t) => (t === ADD ? (card() as never) : null));
    expect((await call(VERIFY)).status).toBe(404);
    expect(createSaveUrl).not.toHaveBeenCalled();
  });
  it("revoked -> 410", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card("revoked") as never);
    expect((await call(ADD)).status).toBe(410);
    expect(createSaveUrl).not.toHaveBeenCalled();
  });
  it("google not configured -> 503", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(isGoogleConfigured).mockReturnValue(false);
    expect((await call(ADD)).status).toBe(503);
  });
  it("createSaveUrl returning null -> 503", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(createSaveUrl).mockResolvedValue(null);
    expect((await call(ADD)).status).toBe(503);
  });
  it("failure -> 500 with empty body and name-only log", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(createSaveUrl).mockRejectedValue(new TypeError("-----BEGIN PRIVATE KEY----- secret"));
    const res = await call(ADD);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("");
    expect(JSON.stringify(spy.mock.calls)).not.toContain("secret");
    expect(spy).toHaveBeenCalledWith("google save url failed", "TypeError");
    spy.mockRestore();
  });
  it("active -> 302 to the save url, no-store", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(createSaveUrl).mockResolvedValue("https://pay.google.com/gp/v/save/jwt");
    const res = await call(ADD);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://pay.google.com/gp/v/save/jwt");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

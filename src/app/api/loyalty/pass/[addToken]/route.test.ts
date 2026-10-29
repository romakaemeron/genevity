import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/queries/loyalty", () => ({ getCardByAddToken: vi.fn() }));
vi.mock("@/lib/loyalty/apple", () => ({ isAppleConfigured: vi.fn(), generatePkpass: vi.fn() }));

import { getCardByAddToken } from "@/lib/db/queries/loyalty";
import { generatePkpass, isAppleConfigured } from "@/lib/loyalty/apple";
import { GET } from "./route";

const ADD = "A".repeat(32);
const VERIFY = "V".repeat(32);
const card = (status: "active" | "revoked" = "active") => ({ id: "1", addToken: ADD, verifyToken: VERIFY, status });
const call = (token: string) => GET(new Request(`http://x/api/loyalty/pass/${token}`), { params: Promise.resolve({ addToken: token }) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(isAppleConfigured).mockReturnValue(true);
});

describe("GET /api/loyalty/pass/[addToken]", () => {
  it("malformed token -> 404 without querying", async () => {
    const res = await call("short");
    expect(res.status).toBe(404);
    expect(getCardByAddToken).not.toHaveBeenCalled();
  });
  it("unknown -> 404", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(null);
    expect((await call(ADD)).status).toBe(404);
  });
  it("verify token in add position -> 404", async () => {
    vi.mocked(getCardByAddToken).mockImplementation(async (t) => (t === ADD ? (card() as never) : null));
    expect((await call(VERIFY)).status).toBe(404);
    expect(generatePkpass).not.toHaveBeenCalled();
  });
  it("revoked -> 410", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card("revoked") as never);
    expect((await call(ADD)).status).toBe(410);
  });
  it("apple not configured -> 503", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(isAppleConfigured).mockReturnValue(false);
    expect((await call(ADD)).status).toBe(503);
  });
  it("generation failure -> 500 with no error text", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(generatePkpass).mockRejectedValue(new Error("ENOENT /var/task/secret/path.pem"));
    const res = await call(ADD);
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).not.toContain("ENOENT");
    expect(body).not.toContain("secret");
    expect(body).toBe("Сталася помилка. Спробуйте пізніше.");
  });
  it("failure responses carry a short plain-text Ukrainian body", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card("revoked") as never);
    const gone = await call(ADD);
    expect(gone.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await gone.text()).toBe("Картку скасовано");
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(isAppleConfigured).mockReturnValue(false);
    expect(await (await call(ADD)).text()).toBe("Додавання тимчасово недоступне");
    vi.mocked(getCardByAddToken).mockResolvedValue(null);
    expect(await (await call(ADD)).text()).toBe("Картку не знайдено");
  });
  it("active -> 200 pkpass with headers", async () => {
    vi.mocked(getCardByAddToken).mockResolvedValue(card() as never);
    vi.mocked(generatePkpass).mockResolvedValue(Buffer.from("PKPASS"));
    const res = await call(ADD);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/vnd.apple.pkpass");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="genevity-friends.pkpass"');
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe("PKPASS");
  });
});

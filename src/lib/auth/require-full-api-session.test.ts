import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.hoisted(() => vi.fn());
vi.mock("@/app/(admin)/admin/_actions/auth", () => ({ getSession }));

import { requireFullApiSession } from "./require-full-api-session";

const sess = (role: string) => ({ userId: "u", email: "e", name: "n", role });

beforeEach(() => vi.resetAllMocks());

describe("requireFullApiSession", () => {
  it("401 without a session", async () => {
    getSession.mockResolvedValue(null);
    const r = await requireFullApiSession();
    expect("response" in r && r.response.status).toBe(401);
  });

  it.each(["frontdesk", "nonsense", ""])("403 for role %j", async (role) => {
    getSession.mockResolvedValue(sess(role));
    const r = await requireFullApiSession();
    expect("response" in r && r.response.status).toBe(403);
  });

  it.each(["admin", "marketing", "support"])("passes %s", async (role) => {
    getSession.mockResolvedValue(sess(role));
    const r = await requireFullApiSession();
    expect("session" in r && r.session.role).toBe(role);
  });
});

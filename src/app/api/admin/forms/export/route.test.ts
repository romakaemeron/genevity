import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.hoisted(() => vi.fn());
const getSession = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/client", () => ({ sql: sqlMock }));
vi.mock("@/app/(admin)/admin/_actions/auth", () => ({ getSession }));
vi.mock("@/app/(admin)/admin/_i18n/server", () => ({ getAdminLocale: vi.fn() }));

import { POST } from "./route";

const req = () => new Request("http://x/api/admin/forms/export", { method: "POST", body: "{}" });

beforeEach(() => vi.resetAllMocks());

describe("POST /api/admin/forms/export", () => {
  it("denies frontdesk before any DB access", async () => {
    getSession.mockResolvedValue({ userId: "u", email: "e", name: "n", role: "frontdesk" });
    const res = await POST(req() as never);
    expect(res.status).toBe(403);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("denies anonymous with 401 before any DB access", async () => {
    getSession.mockResolvedValue(null);
    const res = await POST(req() as never);
    expect(res.status).toBe(401);
    expect(sqlMock).not.toHaveBeenCalled();
  });
});

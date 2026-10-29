import { beforeEach, describe, expect, it, vi } from "vitest";

let role = "admin";
vi.mock("../_actions/auth", () => ({ requireSession: async () => ({ userId: "u", email: "e", name: "n", role }) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));

import { requireAdminPage } from "./_guard";

describe("requireAdminPage", () => {
  beforeEach(() => {
    role = "admin";
  });

  it("lets an admin through", async () => {
    await expect(requireAdminPage()).resolves.toMatchObject({ role: "admin" });
  });

  it.each(["marketing", "support", "frontdesk"])("redirects %s before any loader runs", async (r) => {
    role = r;
    const loader = vi.fn();
    await expect((async () => { await requireAdminPage(); loader(); })()).rejects.toThrow("REDIRECT:/admin/dashboard");
    expect(loader).not.toHaveBeenCalled();
  });
});

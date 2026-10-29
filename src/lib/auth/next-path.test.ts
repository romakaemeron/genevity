import { describe, expect, it } from "vitest";
import { afterLoginPath, safeNextPath } from "./next-path";

const TOKEN = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("safeNextPath", () => {
  it.each(["//evil.com", "https://evil.com", "/\\evil.com", "/admin/../x", "", null, undefined, "/admin//x", "/admin/a:b"])(
    "rejects %s",
    (raw) => {
      expect(safeNextPath(raw as string | null | undefined)).toBeNull();
    },
  );

  it("keeps a safe admin path", () => {
    expect(safeNextPath(`/admin/scan/${TOKEN}`)).toBe(`/admin/scan/${TOKEN}`);
  });
});

describe("afterLoginPath", () => {
  it("sends frontdesk to the scan page when next is not allowed", () => {
    expect(afterLoginPath("frontdesk", "/admin/forms")).toBe("/admin/scan");
    expect(afterLoginPath("frontdesk", null)).toBe("/admin/scan");
  });
  it("sends unknown roles to the scan page", () => {
    expect(afterLoginPath("nonsense", null)).toBe("/admin/scan");
  });
  it("honours an allowed next", () => {
    expect(afterLoginPath("frontdesk", `/admin/scan/${TOKEN}`)).toBe(`/admin/scan/${TOKEN}`);
    expect(afterLoginPath("admin", "/admin/forms")).toBe("/admin/forms");
  });
  it("defaults other roles to the dashboard", () => {
    expect(afterLoginPath("admin", null)).toBe("/admin/dashboard");
  });
});

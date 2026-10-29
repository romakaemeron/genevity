import { describe, it, expect, afterEach } from "vitest";
import { addPageUrl, verifyUrl, getPublicBase, getVerifyBase } from "./urls";

afterEach(() => {
  delete process.env.LOYALTY_VERIFY_BASE_URL;
  delete process.env.LOYALTY_PUBLIC_BASE_URL;
});

describe("verifyUrl", () => {
  it("strips a trailing slash from the configured base", () => {
    process.env.LOYALTY_VERIFY_BASE_URL = "https://admin.genevity.com.ua/";
    expect(verifyUrl("T")).toBe("https://admin.genevity.com.ua/scan/T");
  });

  it("supports a preview base that already ends in /admin (no double slash)", () => {
    process.env.LOYALTY_VERIFY_BASE_URL = "https://preview.vercel.app/admin";
    expect(verifyUrl("T")).toBe("https://preview.vercel.app/admin/scan/T");
    process.env.LOYALTY_VERIFY_BASE_URL = "https://preview.vercel.app/admin/";
    expect(verifyUrl("T")).toBe("https://preview.vercel.app/admin/scan/T");
    expect(verifyUrl("T")).not.toMatch(/[^:]\/\//);
  });

  it("defaults to the admin host", () => {
    expect(getVerifyBase()).toBe("https://admin.genevity.com.ua");
    expect(verifyUrl("T")).toBe("https://admin.genevity.com.ua/scan/T");
  });
});

describe("addPageUrl", () => {
  it("defaults to the public site", () => {
    expect(getPublicBase()).toBe("https://genevity.com.ua");
    expect(addPageUrl("T")).toBe("https://genevity.com.ua/card/T");
  });

  it("honours LOYALTY_PUBLIC_BASE_URL without a double slash", () => {
    process.env.LOYALTY_PUBLIC_BASE_URL = "https://preview.example.com//";
    expect(addPageUrl("T")).toBe("https://preview.example.com/card/T");
  });
});

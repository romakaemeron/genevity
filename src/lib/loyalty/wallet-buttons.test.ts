import { describe, expect, it } from "vitest";
import { walletButtonOrder } from "./wallet-buttons";

describe("walletButtonOrder", () => {
  it("puts Apple first for iPhone, iPad and Mac", () => {
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
    ]) {
      expect(walletButtonOrder(ua)).toEqual(["apple", "google"]);
    }
  });
  it("puts Google first for Android, other and missing agents", () => {
    expect(walletButtonOrder("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile")).toEqual(["google", "apple"]);
    expect(walletButtonOrder("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120")).toEqual(["google", "apple"]);
    expect(walletButtonOrder(null)).toEqual(["google", "apple"]);
    expect(walletButtonOrder("")).toEqual(["google", "apple"]);
  });
});

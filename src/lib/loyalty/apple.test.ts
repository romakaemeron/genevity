import { describe, expect, it } from "vitest";
import { buildPassJson, generatePkpass, isAppleConfigured, WalletNotConfiguredError } from "./apple";
import { verifyUrl } from "./urls";
import type { LoyaltyCard } from "./types";

const cfg = { passTypeIdentifier: "pass.com.genevity.friends", teamIdentifier: "PJL9Y7HXZ8" };

function card(over: Partial<LoyaltyCard> = {}): LoyaltyCard {
  return {
    id: "card-1",
    addToken: "add-tok",
    verifyToken: "verify-tok",
    holderName: "Олена Коваленко",
    tier: 10,
    status: "active",
    issuedBy: null,
    issuedAt: new Date("2026-01-01"),
    revokedBy: null,
    revokedAt: null,
    googleObjectId: null,
    ...over,
  };
}

describe("buildPassJson", () => {
  it("styles tier 10", () => {
    const p = buildPassJson(card(), cfg) as Record<string, any>;
    expect(p.backgroundColor).toBe("rgb(214,198,177)");
    expect(p.foregroundColor).toBe("rgb(51,41,31)");
    expect(p.labelColor).toBe("rgb(95,79,63)");
  });

  it("styles tier 15", () => {
    const p = buildPassJson(card({ tier: 15 }), cfg) as Record<string, any>;
    expect(p.backgroundColor).toBe("rgb(27,23,20)");
    expect(p.foregroundColor).toBe("rgb(242,236,226)");
    expect(p.labelColor).toBe("rgb(168,152,136)");
  });

  it("has only the holder secondary field", () => {
    const p = buildPassJson(card(), cfg) as Record<string, any>;
    expect(p.storeCard.secondaryFields).toEqual([
      { key: "holder", label: "Власник картки", value: "Олена Коваленко" },
    ]);
    expect(p.storeCard.primaryFields).toBeUndefined();
    expect(p.storeCard.headerFields).toBeUndefined();
    expect(p.storeCard.auxiliaryFields).toBeUndefined();
  });

  it("has a QR barcode without altText", () => {
    const c = card();
    const p = buildPassJson(c, cfg) as Record<string, any>;
    expect(p.barcodes).toEqual([
      { format: "PKBarcodeFormatQR", message: verifyUrl(c.verifyToken), messageEncoding: "iso-8859-1" },
    ]);
  });

  it("carries identity fields from card and cfg", () => {
    const p = buildPassJson(card(), cfg) as Record<string, any>;
    expect(p.serialNumber).toBe("card-1");
    expect(p.organizationName).toBe("GENEVITY");
    expect(p.passTypeIdentifier).toBe(cfg.passTypeIdentifier);
    expect(p.teamIdentifier).toBe(cfg.teamIdentifier);
  });

  it("survives JSON round-trip for hostile names", () => {
    const name = 'A "q" \\ back 😀';
    const p = buildPassJson(card({ holderName: name }), cfg) as Record<string, any>;
    const back = JSON.parse(JSON.stringify(p));
    expect(back.storeCard.secondaryFields[0].value).toBe(name);
  });
});

describe("generatePkpass without config", () => {
  it("throws WalletNotConfiguredError", async () => {
    const saved = { ...process.env };
    for (const k of ["APPLE_PASS_CERT_PEM", "APPLE_PASS_KEY_PEM", "APPLE_WWDR_PEM", "APPLE_PASS_TYPE_ID", "APPLE_TEAM_ID"]) {
      delete process.env[k];
    }
    try {
      expect(isAppleConfigured()).toBe(false);
      await expect(generatePkpass(card())).rejects.toBeInstanceOf(WalletNotConfiguredError);
    } finally {
      process.env = saved;
    }
  });
});

describe.skipIf(!process.env.APPLE_PASS_CERT_PEM)("generatePkpass (signed)", () => {
  it("produces a zip with the expected entries", async () => {
    const buf = await generatePkpass(card());
    const text = buf.toString("latin1");
    for (const name of ["pass.json", "manifest.json", "signature", "strip@3x.png", "logo.png", "icon.png"]) {
      expect(text).toContain(name);
    }
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { PKPass } from "passkit-generator";
import { TIER_STYLE } from "./tiers";
import type { LoyaltyCard } from "./types";
import { verifyUrl } from "./urls";

export class WalletNotConfiguredError extends Error {
  constructor(message = "Apple Wallet is not configured") {
    super(message);
    this.name = "WalletNotConfiguredError";
  }
}

const REQUIRED_ENV = [
  "APPLE_PASS_CERT_PEM",
  "APPLE_PASS_KEY_PEM",
  "APPLE_WWDR_PEM",
  "APPLE_PASS_TYPE_ID",
  "APPLE_TEAM_ID",
] as const;

export function isAppleConfigured(): boolean {
  return REQUIRED_ENV.every((k) => Boolean(process.env[k]?.trim()));
}

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
}

export function buildPassJson(
  card: LoyaltyCard,
  cfg: { passTypeIdentifier: string; teamIdentifier: string },
): Record<string, unknown> {
  const style = TIER_STYLE[card.tier];
  return {
    formatVersion: 1,
    passTypeIdentifier: cfg.passTypeIdentifier,
    teamIdentifier: cfg.teamIdentifier,
    serialNumber: card.id,
    organizationName: "GENEVITY",
    description: "GENEVITY Friends",
    backgroundColor: rgb(style.background),
    foregroundColor: rgb(style.foreground),
    labelColor: rgb(style.label),
    storeCard: {
      secondaryFields: [{ key: "holder", label: "Власник картки", value: card.holderName }],
    },
    barcodes: [
      { format: "PKBarcodeFormatQR", message: verifyUrl(card.verifyToken), messageEncoding: "iso-8859-1" },
    ],
  };
}

const IMAGE_FILES = [
  "logo.png", "logo@2x.png", "logo@3x.png",
  "strip.png", "strip@2x.png", "strip@3x.png",
  "icon.png", "icon@2x.png", "icon@3x.png",
];

function fromB64(name: string): string {
  return Buffer.from(process.env[name] ?? "", "base64").toString("utf8");
}

export async function generatePkpass(card: LoyaltyCard): Promise<Buffer> {
  if (!isAppleConfigured()) throw new WalletNotConfiguredError();

  const passJson = buildPassJson(card, {
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID!.trim(),
    teamIdentifier: process.env.APPLE_TEAM_ID!.trim(),
  });

  const dir = path.join(process.cwd(), "src/lib/loyalty/assets/apple", String(card.tier));
  const files: Record<string, Buffer> = { "pass.json": Buffer.from(JSON.stringify(passJson)) };
  for (const f of IMAGE_FILES) files[f] = readFileSync(path.join(dir, f));

  const pass = new PKPass(files, {
    wwdr: fromB64("APPLE_WWDR_PEM"),
    signerCert: fromB64("APPLE_PASS_CERT_PEM"),
    signerKey: fromB64("APPLE_PASS_KEY_PEM"),
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
  });
  return pass.getAsBuffer();
}

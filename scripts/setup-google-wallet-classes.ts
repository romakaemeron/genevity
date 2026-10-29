/**
 * Creates (or updates) the two Google Wallet generic classes, one per tier.
 * Needs GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_SERVICE_ACCOUNT_JSON in .env.local.
 * Run: npx tsx scripts/setup-google-wallet-classes.ts
 */
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim();
});

async function run() {
  const { buildGenericClass, genericClassId, getAccessToken, isGoogleConfigured } = await import(
    "../src/lib/loyalty/google"
  );
  if (!isGoogleConfigured()) {
    throw new Error("GOOGLE_WALLET_ISSUER_ID / GOOGLE_WALLET_SERVICE_ACCOUNT_JSON missing or invalid");
  }
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!.trim();
  const sa = JSON.parse(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON!) as {
    client_email: string;
    private_key: string;
  };
  const token = await getAccessToken({
    issuerId,
    clientEmail: sa.client_email,
    privateKey: sa.private_key,
  });
  const api = "https://walletobjects.googleapis.com/walletobjects/v1/genericClass";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  for (const tier of [10, 15] as const) {
    const body = JSON.stringify(buildGenericClass(issuerId, tier));
    const id = genericClassId(issuerId, tier);
    let res = await fetch(api, { method: "POST", headers, body });
    if (res.status === 409) {
      res = await fetch(`${api}/${encodeURIComponent(id)}`, { method: "PATCH", headers, body });
      console.log(`${id}: exists, patched (${res.status})`);
    } else {
      console.log(`${id}: created (${res.status})`);
    }
    if (!res.ok) throw new Error(`Class ${id} failed with status ${res.status}`);
  }
}

run().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });

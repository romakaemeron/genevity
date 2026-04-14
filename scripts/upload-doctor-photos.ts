/**
 * Upload doctor photos to Sanity and update doctor documents.
 * Usage: npx tsx scripts/upload-doctor-photos.ts
 */
import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const DOCTOR_PHOTOS: { id: string; card: string; modal: string; cardPos: string; modalPos: string }[] = [
  { id: "doctor-0", card: "belyanushkin.webp", modal: "belyanushkin-hq.webp", cardPos: "center 10%", modalPos: "center 20%" },
  { id: "doctor-1", card: "sepkina.webp", modal: "sepkina-hq.webp", cardPos: "center 15%", modalPos: "center 20%" },
  { id: "doctor-2", card: "makarenko.webp", modal: "makarenko-hq.webp", cardPos: "center 15%", modalPos: "center 15%" },
  { id: "doctor-7", card: "kirilenko.webp", modal: "kirilenko-hq.webp", cardPos: "center 25%", modalPos: "center 15%" },
  { id: "doctor-9", card: "tolstikova.webp", modal: "tolstikova-hq.webp", cardPos: "center 15%", modalPos: "center 20%" },
];

async function uploadImage(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
    contentType: "image/webp",
  });
  return asset._id;
}

async function main() {
  console.log("📸 Uploading doctor photos to Sanity...\n");

  for (const doc of DOCTOR_PHOTOS) {
    const cardPath = path.resolve(__dirname, `../public/doctors/${doc.card}`);
    const modalPath = path.resolve(__dirname, `../public/doctors/${doc.modal}`);

    console.log(`  Uploading ${doc.card}...`);
    const cardAssetId = await uploadImage(cardPath);

    console.log(`  Uploading ${doc.modal}...`);
    const modalAssetId = await uploadImage(modalPath);

    await client
      .patch(doc.id)
      .set({
        photoCard: { _type: "image", asset: { _type: "reference", _ref: cardAssetId } },
        photoModal: { _type: "image", asset: { _type: "reference", _ref: modalAssetId } },
        cardPosition: doc.cardPos,
        modalPosition: doc.modalPos,
      })
      .commit();

    console.log(`  ✓ ${doc.id} updated\n`);
  }

  console.log("✅ All doctor photos uploaded!");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});

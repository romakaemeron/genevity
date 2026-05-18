import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`
    ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS related_service_slugs TEXT[] NOT NULL DEFAULT '{}'
  `;
  console.log("✓ added related_service_slugs column to blog_posts");
}

run().catch(console.error);

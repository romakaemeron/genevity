import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { readFileSync } from "fs";
import { join } from "path";

// Required for Node.js env to open websocket
neonConfig.webSocketConstructor = ws as any;

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sqlContent = readFileSync(join(__dirname, "migrations", "002_phase2_tables.sql"), "utf-8");
  const client = await pool.connect();
  try {
    await client.query(sqlContent);
    console.log("✓ Migration 002 applied");
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('hero_slides', 'gallery_items', 'price_categories', 'price_items', 'lab_services', 'lab_prep_steps', 'lab_checkups')
      ORDER BY table_name
    `);
    console.log("Tables present:", tables.rows.map((t) => t.table_name));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });

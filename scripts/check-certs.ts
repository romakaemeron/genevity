import { readFileSync } from 'fs';
import * as path from 'path';
const env = readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
env.split('\n').forEach((l: string) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT slug, name_uk, certificate_images FROM doctors ORDER BY sort_order`;
  for (const r of rows) {
    const imgs = (r.certificate_images as any[] | null) ?? [];
    console.log(`${r.slug} | ${r.name_uk} | certs: ${imgs.length}`);
    if (imgs.length > 0) console.log(`  sample: ${imgs[0].url}`);
  }
}
main().catch(console.error);

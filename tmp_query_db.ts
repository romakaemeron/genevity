import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
env.split('\n').forEach((l: string) => {
  const m = l.match(/^([^#=\s]+)=(.+)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const services = await sql`
  SELECT s.title_uk, s.price_from_uk, c.title_uk AS cat
  FROM services s JOIN service_categories c ON s.category_id = c.id
  ORDER BY c.sort_order, s.sort_order
`;
console.log('SERVICES:');
services.forEach((r: any) => console.log(r.cat, '|', r.title_uk, '|', r.price_from_uk));

const doctors = await sql`SELECT name_uk, role_uk FROM doctors WHERE is_published = true ORDER BY sort_order`;
console.log('\nDOCTORS:');
doctors.forEach((r: any) => console.log(r.name_uk, '|', r.role_uk));

import { sql } from "./lib";
async function main(){
const d = await sql`SELECT slug, name_uk, role_uk, specialties_uk, is_published, LEFT(bio_uk, 400) AS bio FROM doctors WHERE bio_uk ILIKE '%репродукт%' OR bio_uk ILIKE '%невролог%' OR bio_uk ILIKE '%терапевт%' OR specialties_uk::text ILIKE '%репродукт%' OR specialties_uk::text ILIKE '%невролог%' OR role_uk ILIKE '%терапевт%'`;
d.forEach((x:any)=>console.log("\n", x.slug, x.is_published?"✓":"✗", "|", x.role_uk, "|", JSON.stringify(x.specialties_uk), "\n  ", (x.bio||"").slice(0,300)));
console.log("\n--- kroshka:");
const [k] = await sql`SELECT role_uk, specialties_uk, LEFT(bio_uk,500) bio FROM doctors WHERE slug='kroshka-iryna'`;
console.log(k.role_uk, JSON.stringify(k.specialties_uk), "\n", k.bio);
await sql.end();}
main().catch(e=>{console.error(e.message);process.exit(1)});

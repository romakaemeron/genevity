/**
 * Seed initial CMS admin user
 * Run: DATABASE_URL="..." npx tsx scripts/seed-admin-user.ts
 */
import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const email = "admin@genevity.com.ua";
  const name = "Roman";
  const password = "genevity2026";
  const role = "admin";

  const hash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO cms_users (email, name, password_hash, role)
    VALUES (${email}, ${name}, ${hash}, ${role})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}, name = ${name}, role = ${role}
  `;

  console.log(`✓ Admin user created: ${email} / ${password}`);
  console.log("  Change password after first login!");

  await sql.end();
}

main().catch(console.error);

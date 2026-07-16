/**
 * E-E-A-T / YMYL: wire the privacy-consent line under the booking form.
 * `ctaForm.privacyNote` already existed in the ui_strings tree but was never
 * rendered; this upgrades it to include a `<link>…</link>` tag (rendered by
 * next-intl's `t.rich` as an in-app Link to /legal/privacy-policy — see
 * BookingForm.tsx) and drops any stray `ctaForm.consent` from an earlier pass.
 *
 * The ui_strings JSONB (id=1) is stored double-encoded (a jsonb string scalar),
 * matching saveUiStringsTree; getUiStringsTree JSON.parses it, so we preserve
 * that encoding here. Idempotent: only touches ctaForm.privacyNote/consent.
 * Run: npx tsx scripts/seed-booking-consent.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const PRIVACY_NOTE = {
  uk: "Натискаючи кнопку, ви погоджуєтеся з <link>політикою конфіденційності</link> та обробкою персональних даних.",
  ru: "Нажимая кнопку, вы соглашаетесь с <link>политикой конфиденциальности</link> и обработкой персональных данных.",
  en: "By clicking, you agree to our <link>privacy policy</link> and the processing of your personal data.",
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  if (!rows.length) throw new Error("ui_strings row id=1 not found");
  const raw = rows[0].data;
  const tree = (typeof raw === "string" ? JSON.parse(raw) : raw) as Record<string, unknown>;

  const ctaForm = (tree.ctaForm && typeof tree.ctaForm === "object" && !Array.isArray(tree.ctaForm)
    ? (tree.ctaForm as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  ctaForm.privacyNote = PRIVACY_NOTE;
  delete ctaForm.consent; // remove stray key from an earlier iteration
  tree.ctaForm = ctaForm;

  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  console.log("✓ ctaForm.privacyNote wired with <link> (uk/ru/en); stray consent removed");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });

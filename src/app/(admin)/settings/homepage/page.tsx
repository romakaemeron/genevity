import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import HomepageForm from "./_components/homepage-form";

export default async function HomepageSettingsPage() {
  await requireSession();
  const [heroRows, aboutRows] = await Promise.all([
    sql`SELECT * FROM hero WHERE id = 1`,
    sql`SELECT * FROM about WHERE id = 1`,
  ]);

  return <HomepageForm hero={heroRows[0] || {}} about={aboutRows[0] || {}} />;
}

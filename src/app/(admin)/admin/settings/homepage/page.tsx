import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { getUiStringsNamespace } from "@/lib/db/queries";
import HomepageForm from "./_components/homepage-form";
import NamespaceTextsEditor from "../../_components/namespace-texts-editor";

export default async function HomepageSettingsPage() {
  await requireSession();
  const [heroRows, aboutRows, homeHero, homeFaq, advantages, aboutSlideshow] = await Promise.all([
    sql`SELECT * FROM hero WHERE id = 1`,
    sql`SELECT * FROM about WHERE id = 1`,
    getUiStringsNamespace("homeHero"),
    getUiStringsNamespace("homeFaq"),
    getUiStringsNamespace("advantages"),
    getUiStringsNamespace("aboutSlideshow"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <HomepageForm hero={heroRows[0] || {}} about={aboutRows[0] || {}} />

      <div className="p-8 flex flex-col gap-10">
        <div className="border-t border-line pt-6">
          <h2 className="font-heading text-lg text-ink mb-1">Advantages section</h2>
          <p className="body-m text-muted">The 5 bento cards below the hero on the homepage.</p>
        </div>
        <NamespaceTextsEditor namespace="advantages" initial={advantages} />

        <div className="border-t border-line pt-6">
          <h2 className="font-heading text-lg text-ink mb-1">Homepage FAQ</h2>
          <p className="body-m text-muted">The 5 questions + answers shown near the bottom of the homepage.</p>
        </div>
        <NamespaceTextsEditor namespace="homeFaq" initial={homeFaq} />

        <div className="border-t border-line pt-6">
          <h2 className="font-heading text-lg text-ink mb-1">Hero image alt texts</h2>
          <p className="body-m text-muted">Accessibility + SEO descriptions for slideshow images.</p>
        </div>
        <NamespaceTextsEditor namespace="homeHero" initial={homeHero} />

        <div className="border-t border-line pt-6">
          <h2 className="font-heading text-lg text-ink mb-1">About-section slideshow alts</h2>
          <p className="body-m text-muted">Alt text for the clinic photo slideshow in the About section.</p>
        </div>
        <NamespaceTextsEditor namespace="aboutSlideshow" initial={aboutSlideshow} />
      </div>
    </div>
  );
}

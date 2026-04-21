import { requireSession } from "../../_actions/auth";

export default async function NavigationPage() {
  await requireSession();
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="heading-2 text-ink mb-2">Navigation</h1>
      <p className="body-m text-muted mb-8">Menu structure editor coming soon</p>
      <div className="bg-white rounded-2xl border border-line p-12 text-center">
        <p className="text-muted">Navigation menu items and CTA button settings will be configurable here.</p>
      </div>
    </div>
  );
}

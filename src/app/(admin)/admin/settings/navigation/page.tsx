import { requireSession } from "../../_actions/auth";

export default async function NavigationPage() {
  await requireSession();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Navigation</h1>
      <p className="body-m text-muted mb-8">Menu structure editor coming soon</p>
      <div className="bg-champagne-dark rounded-2xl border border-line p-12 text-center">
        <p className="text-muted">Navigation menu items and CTA button settings will be configurable here.</p>
      </div>
    </div>
  );
}

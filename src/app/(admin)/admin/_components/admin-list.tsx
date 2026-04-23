import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

/* ── Page header ── */
export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="heading-2 text-ink mb-3">{title}</h1>
        {subtitle && <p className="body-m text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

/* ── Buttons used in page headers — thin adapters over the shared Button ── */
export function AdminPrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button href={href} variant="primary" size="sm">
      {children}
    </Button>
  );
}

export function AdminSecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button href={href} variant="neutral" size="sm">
      {children}
    </Button>
  );
}

/* ── Section heading (above an AdminList) ── */
export function AdminSectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-heading text-lg text-ink mb-3">{children}</h2>;
}

/* ── List container ── */
export function AdminList({ children, empty }: { children: ReactNode; empty?: string }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="bg-champagne-dark rounded-2xl overflow-hidden divide-y divide-line">
      {!hasChildren && empty && (
        <div className="px-6 py-8 text-center text-sm text-muted">{empty}</div>
      )}
      {children}
    </div>
  );
}

/* ── List item — clickable row with hover + chevron ── */
export function AdminListItem({
  href,
  title,
  subtitle,
  badge,
  leading,
  trailing,
}: {
  href: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-side pill (e.g. count, status) shown before the chevron */
  badge?: ReactNode;
  /** Left-side visual (avatar, icon, thumbnail) */
  leading?: ReactNode;
  /** Custom element replacing the default badge area */
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-6 py-4 hover:bg-champagne-darker group transition-colors"
    >
      {leading}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{title}</p>
        {subtitle && <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>}
      </div>
      {badge && <span className="shrink-0">{badge}</span>}
      {trailing}
      <ChevronRight size={14} className="text-muted group-hover:translate-x-1 transition-all duration-200 shrink-0" />
    </Link>
  );
}

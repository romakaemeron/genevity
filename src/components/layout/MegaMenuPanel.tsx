"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { NavCategory, NavLeaf, NavTop } from "./navConfig";
import { resolveNavLabel } from "./navLabel";

type Props = {
  item: NavTop;
  onNavigate?: () => void;
};

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden="true">
      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryBlock({ cat, onNavigate, compact = false, delay = 0 }: { cat: NavCategory; onNavigate?: () => void; compact?: boolean; delay?: number }) {
  const tNav = useTranslations("nav_mega");
  const locale = useLocale();
  return (
    <div className="flex flex-col gap-2 megamenu-item" style={{ animationDelay: `${delay}s` }}>
      <Link
        href={cat.href}
        onClick={onNavigate}
        className={`group inline-flex items-center gap-1.5 hover:text-main transition-colors ${compact ? "body-m text-black" : "body-strong text-black"}`}
        style={compact ? { fontWeight: 600 } : undefined}
      >
        <span>{resolveNavLabel(tNav, cat.key, cat.label, locale)}</span>
        <ArrowRight className="text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>
      <ul className="flex flex-col gap-2">
        {cat.items.map((leaf) => (
          <li key={leaf.key}>
            <Link href={leaf.href} onClick={onNavigate} className="body-m text-black-60 hover:text-main transition-colors">
              {resolveNavLabel(tNav, leaf.key, leaf.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExtraBlock({ headingKey, items, onNavigate, delay = 0 }: { headingKey: string; items: NavLeaf[]; onNavigate?: () => void; delay?: number }) {
  const tNav = useTranslations("nav_mega");
  const locale = useLocale();
  return (
    <div className="flex flex-col gap-3 megamenu-item" style={{ animationDelay: `${delay}s` }}>
      <p className="body-strong text-black">{tNav(headingKey)}</p>
      <ul className="flex flex-col gap-2">
        {items.map((leaf) => (
          <li key={leaf.key}>
            <Link href={leaf.href} onClick={onNavigate} className="body-m text-black-60 hover:text-main transition-colors">
              {resolveNavLabel(tNav, leaf.key, leaf.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MegaMenuPanel({ item, onNavigate }: Props) {
  const tNav = useTranslations("nav_mega");
  const locale = useLocale();
  const mega = item.mega;
  if (!mega) return null;

  const byKey = Object.fromEntries(mega.categories.map((c) => [c.key, c]));
  const injectable = byKey["injectable"];
  const apparatus = byKey["apparatus"];
  const apparatusFace = byKey["apparatusFace"];
  const apparatusBody = byKey["apparatusBody"];
  const intimate = byKey["intimate"];
  const laser = byKey["laser"];
  const longevity = byKey["longevity"];
  const diagnostics = byKey["diagnosticsNav"];

  return (
    <div className="megamenu-panel relative z-[998] bg-champagne border-t border-black-10 shadow-[0_12px_36px_-16px_rgba(42,37,32,0.18)]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-6 pb-12 lg:pt-7 lg:pb-14">
        {/* All services hub link */}
        <div className="megamenu-item mb-8" style={{ animationDelay: "0.06s" }}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="group inline-flex items-center gap-2 heading-3 text-black-60 hover:text-main transition-colors"
          >
            <span>{tNav("allServices")}</span>
            <ArrowRight className="w-4 h-4 text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 xl:gap-x-16 gap-y-10">
          {injectable && <CategoryBlock cat={injectable} onNavigate={onNavigate} delay={0.1} />}
          <div className="flex flex-col gap-6">
            {apparatus && (
              <div className="megamenu-item" style={{ animationDelay: "0.14s" }}>
                <Link
                  href={apparatus.href}
                  onClick={onNavigate}
                  className="group inline-flex items-center gap-1.5 body-strong text-black hover:text-main transition-colors"
                >
                  <span>{resolveNavLabel(tNav, apparatus.key, apparatus.label, locale)}</span>
                  <ArrowRight className="text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              </div>
            )}
            <div className="flex flex-col gap-8">
              {apparatusFace && <CategoryBlock cat={apparatusFace} onNavigate={onNavigate} compact delay={0.18} />}
              {apparatusBody && <CategoryBlock cat={apparatusBody} onNavigate={onNavigate} compact delay={0.22} />}
            </div>
          </div>
          <div className="flex flex-col gap-10">
            {longevity && <CategoryBlock cat={longevity} onNavigate={onNavigate} delay={0.14} />}
            {intimate && <CategoryBlock cat={intimate} onNavigate={onNavigate} delay={0.18} />}
            {laser && <CategoryBlock cat={laser} onNavigate={onNavigate} delay={0.22} />}
          </div>
          <div className="flex flex-col gap-10">
            {diagnostics && <CategoryBlock cat={diagnostics} onNavigate={onNavigate} delay={0.14} />}
            {mega.extra && (
              <ExtraBlock headingKey="more" items={mega.extra.items} onNavigate={onNavigate} delay={0.18} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

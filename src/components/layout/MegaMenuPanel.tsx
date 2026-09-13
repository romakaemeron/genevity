"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { t as localizeNavLabel, type NavCategory, type NavTop } from "./navConfig";
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

/** One group of leaves inside the detail pane, laid out across a top-aligned grid. */
function GroupBlock({
  group,
  showHeading,
  onNavigate,
}: {
  group: NavCategory;
  showHeading: boolean;
  onNavigate?: () => void;
}) {
  const tNav = useTranslations("nav_mega");
  const locale = useLocale();
  return (
    <div className="flex flex-col gap-4">
      {showHeading && (
        <p className="body-s uppercase tracking-[0.12em] text-black-40">
          {group.paneLabel
            ? localizeNavLabel(group.paneLabel, locale)
            : resolveNavLabel(tNav, group.key, group.label, locale)}
        </p>
      )}
      {/* Grid, not CSS columns: multi-column balances the flow, which left the
          first item of each column sitting at a different height. */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-3 items-start content-start">
        {group.items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              onClick={onNavigate}
              className="body-m text-black-60 hover:text-black transition-colors"
            >
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
  const [activeKey, setActiveKey] = useState(mega?.sections[0]?.key ?? "");
  if (!mega) return null;

  const active = mega.sections.find((s) => s.key === activeKey) ?? mega.sections[0];

  return (
    <div className="megamenu-panel relative z-[998] bg-champagne border-t border-black-10 shadow-[0_12px_36px_-16px_rgba(42,37,32,0.18)]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-6 pb-10 lg:pt-7 lg:pb-12">
        {/* All services hub link */}
        <div className="megamenu-item mb-6" style={{ animationDelay: "0.06s" }}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="group inline-flex items-center gap-2 heading-3 text-black-60 hover:text-main transition-colors"
          >
            <span>{tNav("allServices")}</span>
            <ArrowRight className="w-4 h-4 text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-x-12 xl:gap-x-16">
          {/* Left rail — categories */}
          <nav
            className="megamenu-item flex flex-col gap-1 lg:border-r lg:border-black-10 lg:pr-6"
            style={{ animationDelay: "0.1s" }}
            aria-label={tNav("allServices")}
          >
            {mega.sections.map((section) => {
              const isActive = section.key === active.key;
              return (
                <Link
                  key={section.key}
                  href={section.href}
                  onClick={onNavigate}
                  onMouseEnter={() => setActiveKey(section.key)}
                  onFocus={() => setActiveKey(section.key)}
                  aria-current={isActive ? "true" : undefined}
                  className={`group flex items-center justify-between gap-3 rounded-[var(--radius-button)] px-3.5 py-2.5 transition-colors duration-200 ${
                    isActive ? "bg-champagne-dark text-black" : "text-black-60 hover:text-black"
                  }`}
                >
                  <span className="megamenu-rail-label" data-active={isActive}>
                    {resolveNavLabel(tNav, section.key, section.label, locale)}
                  </span>
                  {/* Affordance: the row opens a list rather than just navigating. */}
                  <ArrowRight
                    className={`shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-main translate-x-0.5"
                        : "text-black-40 group-hover:text-main group-hover:translate-x-0.5"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right pane — the selected category. No `key` here on purpose: keying
              it by category remounted the pane on every hover, replaying the
              entry animation and leaving the pane blank for its delay. The
              stagger should play once, when the panel opens. */}
          <div className="megamenu-item mt-8 lg:mt-0 lg:min-h-[336px]" style={{ animationDelay: "0.14s" }}>
            <Link
              href={active.href}
              onClick={onNavigate}
              className="group inline-flex items-center gap-1.5 body-strong text-black hover:text-main transition-colors mb-6"
            >
              <span>{resolveNavLabel(tNav, active.key, active.label, locale)}</span>
              <ArrowRight className="text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            <div className="flex flex-col gap-8">
              {active.groups.map((group) => (
                <GroupBlock
                  key={group.key}
                  group={group}
                  showHeading={active.groups.length > 1}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext } from "react";
import type { SiteSettingsData } from "@/lib/db/types";

/**
 * Single source of truth for phone / address / hours / instagram / maps URL
 * on the public site. Fetched once in [locale]/layout.tsx and exposed to every
 * client component (Footer, Contacts, BookingCTA modal, etc.) via context so
 * nothing is hardcoded and admin edits flow everywhere on revalidation.
 */
const SiteSettingsContext = createContext<SiteSettingsData | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettingsData;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsData | null {
  return useContext(SiteSettingsContext);
}

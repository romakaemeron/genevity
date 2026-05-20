"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminStrings, type AdminLocale, type AdminStrings } from "./strings";

interface AdminLocaleContextValue {
  locale: AdminLocale;
  t: AdminStrings;
  setLocale: (locale: AdminLocale) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue>({
  locale: "uk",
  t: adminStrings.uk,
  setLocale: () => {},
});

export function AdminLocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: AdminLocale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale);

  const setLocale = useCallback(
    (newLocale: AdminLocale) => {
      setLocaleState(newLocale);
      document.cookie = `admin-locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  return (
    <AdminLocaleContext.Provider
      value={{ locale, t: adminStrings[locale], setLocale }}
    >
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}

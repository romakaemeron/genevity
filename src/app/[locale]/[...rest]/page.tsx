import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths inside a locale.
 *
 * Without it an unknown URL never enters the `[locale]` tree, so Next serves
 * its built-in 404 instead of the branded, localized `not-found.tsx`. Concrete
 * routes always win over a catch-all, so this only ever fires on a real miss.
 */
export default function LocaleCatchAll() {
  notFound();
}

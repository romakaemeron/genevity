import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMessagesForLocale } from "@/lib/db/queries/ui-strings";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "ua" | "ru" | "en")) {
    locale = routing.defaultLocale;
  }

  const messages = await getMessagesForLocale(locale);

  return {
    locale,
    messages,
  };
});

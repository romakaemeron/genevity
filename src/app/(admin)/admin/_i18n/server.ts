import { cookies } from "next/headers";
import { adminStrings, type AdminLocale, type AdminStrings } from "./strings";

export async function getAdminLocale(): Promise<AdminLocale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin-locale")?.value;
  return raw === "uk" || raw === "ru" || raw === "en" ? raw : "uk";
}

export async function getAdminStrings(): Promise<AdminStrings> {
  const locale = await getAdminLocale();
  return adminStrings[locale];
}

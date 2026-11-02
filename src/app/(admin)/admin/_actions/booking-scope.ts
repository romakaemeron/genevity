"use server";

/**
 * Server actions behind the "Послуги спеціалістів" editor.
 *
 * RoApp can't express which specialist performs which service — its booking
 * API accepts an `employee_id` on the services endpoint and ignores it — so
 * the mapping lives here and the booking wizard filters against it. See
 * migration 028.
 */

import { revalidatePath } from "next/cache";
import { requireSession } from "./auth";
import { logChange } from "@/lib/audit";
import {
  saveEmployeeScope,
  type EmployeeScope,
} from "@/lib/db/queries/booking-scope";

export async function saveBookingScope(
  employeeId: number,
  employeeName: string,
  scope: EmployeeScope,
): Promise<{ ok: true }> {
  await requireSession();
  await saveEmployeeScope(employeeId, scope);

  // The wizard reads the scope through a server action rather than a cached
  // page, so there is no page cache to bust for it. /booking is revalidated
  // anyway because the step copy and the catalogue share that render.
  for (const p of ["/booking", "/ru/booking", "/en/booking"]) revalidatePath(p);

  const total =
    scope.categories.length + scope.allowServices.length + scope.denyServices.length;
  await logChange({
    action: "update",
    entityType: "booking_scope",
    entityId: String(employeeId),
    entityLabel: `Послуги спеціаліста: ${employeeName}`,
    after: {
      categories: scope.categories.length,
      allowServices: scope.allowServices.length,
      denyServices: scope.denyServices.length,
      // An empty mapping means "offered every service", which is a meaningful
      // state to be able to spot in the audit log rather than an empty diff.
      unrestricted: total === 0,
    },
  });
  return { ok: true };
}

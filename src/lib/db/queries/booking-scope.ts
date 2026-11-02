import { sql } from "../client";
import {
  emptyScope,
  type EmployeeScope,
  type ScopeMap,
} from "@/lib/booking-scope-rules";

export type { EmployeeScope, ScopeMap };
export { isServiceAllowed, isUnrestricted } from "@/lib/booking-scope-rules";

/**
 * Which RoApp services each specialist is offered for in the booking wizard.
 *
 * RoApp cannot express this — its booking API accepts `employee_id` on the
 * services endpoint and ignores it, so every specialist comes back with the
 * same 232 services. See migration 028 for the full background. This is the
 * mapping that replaces it, held on our side and edited in /admin.
 *
 * The rule that matters most is the fallback: **a specialist with no rows is
 * offered everything**. The clinic maps doctors one at a time, and a
 * half-finished mapping must never leave a patient staring at an empty list.
 */

export type ScopeType = "category" | "service";
export type ScopeMode = "allow" | "deny";

export interface ScopeRow {
  employeeId: number;
  scopeType: ScopeType;
  scopeId: number;
  mode: ScopeMode;
}

/**
 * Every rule, grouped by specialist.
 *
 * Returned as a plain object rather than a Map because it crosses the server
 * action boundary into the wizard, and Maps don't survive serialization.
 */
export async function getScopeMap(): Promise<ScopeMap> {
  let rows: ScopeRow[];
  try {
    rows = (await sql`
      SELECT employee_id AS "employeeId",
             scope_type  AS "scopeType",
             scope_id    AS "scopeId",
             mode
      FROM roapp_service_scope
    `) as unknown as ScopeRow[];
  } catch (e) {
    // An unmapped booking flow is worse than an unfiltered one: fall back to
    // showing everything rather than failing the step.
    console.error("[booking-scope] read failed, falling back to unfiltered:", e);
    return {};
  }

  const out: ScopeMap = {};
  for (const r of rows) {
    const bucket = (out[r.employeeId] ??= emptyScope());
    if (r.scopeType === "category") bucket.categories.push(r.scopeId);
    else if (r.mode === "deny") bucket.denyServices.push(r.scopeId);
    else bucket.allowServices.push(r.scopeId);
  }
  return out;
}

/** Rules for one specialist, for the admin editor. */
export async function getEmployeeScope(employeeId: number): Promise<EmployeeScope> {
  const map = await getScopeMap();
  return map[employeeId] ?? emptyScope();
}

/**
 * Replace one specialist's rules wholesale.
 *
 * Delete-then-insert rather than diffing: the editor always submits the
 * complete set, so reconciling row by row would be work for no gain.
 *
 * The delete and the insert go in one multi-statement call so a specialist is
 * never left with their old rules deleted and the new ones not yet written —
 * that window would briefly offer them the entire catalogue. The Neon HTTP
 * driver has no interactive transaction, so the statements are composed into a
 * single round trip, which is atomic on the server side.
 */
export async function saveEmployeeScope(
  employeeId: number,
  scope: EmployeeScope,
): Promise<void> {
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new Error(`saveEmployeeScope: bad employeeId ${employeeId}`);
  }
  const ints = (xs: number[]) =>
    [...new Set(xs)].filter((n) => Number.isInteger(n) && n > 0);

  const categories = ints(scope.categories);
  const allow = ints(scope.allowServices);
  // A service both allowed and denied is a contradiction the editor shouldn't
  // produce; resolve it here rather than storing two rows that fight.
  const deny = ints(scope.denyServices).filter((id) => !allow.includes(id));

  const rows: [number, string, number, string][] = [
    ...categories.map((id) => [employeeId, "category", id, "allow"] as [number, string, number, string]),
    ...allow.map((id) => [employeeId, "service", id, "allow"] as [number, string, number, string]),
    ...deny.map((id) => [employeeId, "service", id, "deny"] as [number, string, number, string]),
  ];

  // Clearing every rule is a legitimate edit — it returns the specialist to
  // "offered everything" — so the delete runs whether or not rows follow.
  if (rows.length === 0) {
    await sql`DELETE FROM roapp_service_scope WHERE employee_id = ${employeeId}`;
    return;
  }

  await sql.transaction([
    sql`DELETE FROM roapp_service_scope WHERE employee_id = ${employeeId}`,
    sql`
      INSERT INTO roapp_service_scope (employee_id, scope_type, scope_id, mode)
      SELECT * FROM UNNEST(
        ${rows.map((r) => r[0])}::int[],
        ${rows.map((r) => r[1])}::text[],
        ${rows.map((r) => r[2])}::int[],
        ${rows.map((r) => r[3])}::text[]
      )
    `,
  ]);
}

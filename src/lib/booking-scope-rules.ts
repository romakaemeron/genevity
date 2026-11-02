/**
 * Who is offered which RoApp service — the rule, with no I/O.
 *
 * Deliberately free of database and server imports so the identical function
 * runs in three places: the wizard (in the browser, filtering between steps
 * with no round trip), the server action that writes the booking, and the
 * admin editor's preview. One implementation means the list a patient sees and
 * the list the server will accept cannot drift apart.
 *
 * See migration 028 for why this exists at all: RoApp accepts an `employee_id`
 * on its services endpoint and ignores it, so the filtering has to be ours.
 */

export interface EmployeeScope {
  /** Second-level RoApp category ids this specialist is offered for. */
  categories: number[];
  /** Individual service ids, beyond whatever the categories cover. */
  allowServices: number[];
  /** Service ids carved back out of an allowed category. */
  denyServices: number[];
}

/** employeeId → rules. A missing key means "unrestricted". */
export type ScopeMap = Record<number, EmployeeScope>;

export function emptyScope(): EmployeeScope {
  return { categories: [], allowServices: [], denyServices: [] };
}

/** True when a specialist has no rules and is therefore offered everything. */
export function isUnrestricted(scope: EmployeeScope | undefined): boolean {
  if (!scope) return true;
  return scope.categories.length === 0 && scope.allowServices.length === 0;
}

/**
 * Is `serviceId` offered for this specialist?
 *
 * The fallback is the important part: a specialist nobody has mapped is
 * offered everything. The clinic maps doctors one at a time, so an unfinished
 * mapping has to behave exactly as the site did before — never an empty list.
 *
 * `groupId` is the service's second-level category, or null when the taxonomy
 * couldn't be loaded. A service with no group can't match a category rule but
 * still matches an explicit service rule.
 */
export function isServiceAllowed(
  scope: EmployeeScope | undefined,
  serviceId: number,
  groupId: number | null,
): boolean {
  if (isUnrestricted(scope)) return true;
  const s = scope as EmployeeScope;
  // An explicit deny wins over the category that would have allowed it.
  if (s.denyServices.includes(serviceId)) return false;
  if (s.allowServices.includes(serviceId)) return true;
  return groupId != null && s.categories.includes(groupId);
}

import "server-only";

/**
 * RoApp (RemOnline) integration — the single seam between our site and their
 * platform. Everything else in the codebase talks to these functions, so an
 * upstream change is a one-file fix.
 *
 * ── Why two APIs ────────────────────────────────────────────────────────────
 *
 * READS come from the **public booking API** that powers the clinic's own
 * booking page (`…/api/booking/…`). This is the only source of real
 * availability: it computes free slots from each employee's *work schedule*
 * combined with their existing bookings. The documented v2 API exposes neither
 * schedules nor slots — probed exhaustively, they simply are not there — so
 * availability derived from v2 alone would happily offer a doctor's day off.
 *
 * WRITES go through the **authenticated v2 API** (`api.roapp.io/v2`). It's
 * documented and stable, returns the created booking id, and lets us stamp a
 * comment for attribution. The public API has a `POST …/appointment` too, but
 * it's undocumented and we'd be guessing at its payload.
 *
 * ── Caveats ─────────────────────────────────────────────────────────────────
 *
 * The public booking API carries no compatibility promise. It powers RoApp's
 * own product so it won't churn casually, but if it ever breaks, callers fall
 * back to the ordinary callback form (see `actions/appointment.ts`).
 *
 * Rate limit is 3 requests/second per account, so list results are cached and
 * paged sequentially rather than in parallel.
 *
 * All times crossing this boundary are UTC instants. The account's display
 * timezone is Europe/Kyiv; conversion happens in the UI layer, never here.
 */

import type {
  RoappEmployee,
  RoappService,
  RoappServiceWithCategory,
  RoappSlot,
  CreatedBooking,
} from "./types";

const BOOKING_BASE =
  process.env.ROAPP_BOOKING_BASE || "https://c4bj5.roapp.page/api/booking";
const V2_BASE = "https://api.roapp.io/v2";
const LOCATION_ID = Number(process.env.ROAPP_LOCATION_ID || 221552);

/** How long list data is cached. Slots are never cached — see listSlots. */
const CACHE_EMPLOYEES = 300; // 5 min — a doctor's schedule can change intraday
const CACHE_SERVICES = 900; // 15 min — the catalogue is near-static
const CACHE_CATALOG = 3600; // 1 h — category names basically never change

export class RoappError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "RoappError";
  }
}

export function isRoappConfigured(): boolean {
  return Boolean(process.env.ROAPP_API_KEY);
}

export function roappLocationId(): number {
  return LOCATION_ID;
}

/** The clinic's own RoApp booking page — our fallback if the API misbehaves. */
export function roappBookingPageUrl(): string {
  try {
    return new URL(BOOKING_BASE).origin + "/booking/";
  } catch {
    return "https://c4bj5.roapp.page/booking/";
  }
}

/* ── Public booking API (no auth) ─────────────────────────────────────── */

async function getPublic<T>(path: string, revalidate: number | false): Promise<T> {
  const res = await fetch(`${BOOKING_BASE}${path}`, {
    headers: { Accept: "application/json" },
    ...(revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });
  if (!res.ok) {
    throw new RoappError(`RoApp booking API ${path} → ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

/**
 * Specialists who can actually be booked.
 *
 * RoApp only lists employees whose work schedule is filled in — 12 of the 23
 * staff in the "Лікарі" group at the time of writing. That filter is theirs and
 * we inherit it deliberately: a doctor with no schedule has no free slots, so
 * offering them would dead-end the visitor.
 */
export async function listEmployees(): Promise<RoappEmployee[]> {
  const data = await getPublic<RoappEmployee[]>(
    `/locations/${LOCATION_ID}/employees`,
    CACHE_EMPLOYEES,
  );
  return Array.isArray(data) ? data : [];
}

interface PagedPublic<T> {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}

/**
 * Bookable services (paged, 232 at the time of writing out of a 601-item
 * catalogue — the rest aren't enabled for online booking).
 *
 * `employeeId` is forwarded but RoApp ignores it: the identical list comes back
 * for every specialist and even for a non-existent id. Services aren't linked
 * to employees in this account, so no per-doctor filtering is possible yet —
 * including on RoApp's own booking page, which uses this same endpoint. If the
 * clinic links them in RoApp, this starts filtering with no code change.
 */
export async function listServices(employeeId?: number): Promise<RoappService[]> {
  const out: RoappService[] = [];
  let page = 1;
  let totalPages = 1;
  // The API rejects employee_id=0 ("Input should be greater than 0") but is
  // happy with the parameter omitted, which returns the same list.
  const scope = employeeId && employeeId > 0 ? `&employee_id=${employeeId}` : "";
  do {
    const res = await getPublic<PagedPublic<RoappService>>(
      `/locations/${LOCATION_ID}/services?page=${page}&pageSize=50${scope}`,
      CACHE_SERVICES,
    );
    out.push(...(res.data ?? []));
    totalPages = res.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 20); // hard stop; 20 pages = 1000 services
  return out;
}

/**
 * Free slots for a specialist.
 *
 * Never cached — a slot can be taken between two page views, and showing a
 * stale one sends the visitor into a failed booking.
 *
 * Note `slotMinutes` is advisory: the clinic's RoApp booking settings pin the
 * granularity (currently 60 minutes on the hour), and the API returns that
 * regardless of what we ask for. Verified with 30/60/90. `periodDays` must be
 * at least 7 or the API 400s.
 */
export async function listSlots(
  employeeId: number,
  opts: { startDate?: string; periodDays?: number; slotMinutes?: number } = {},
): Promise<RoappSlot[]> {
  const startDate = opts.startDate ?? new Date().toISOString().slice(0, 10);
  const periodDays = Math.max(7, Math.min(90, opts.periodDays ?? 31));
  const slotMinutes = Math.max(5, Math.min(480, opts.slotMinutes ?? 60));
  const qs = new URLSearchParams({
    slot_minutes: String(slotMinutes),
    period_days: String(periodDays),
    start_date: startDate,
    employee_id: String(employeeId),
  });
  const data = await getPublic<RoappSlot[]>(
    `/locations/${LOCATION_ID}/timeslots:search?${qs}`,
    false,
  );
  return Array.isArray(data) ? data : [];
}

/* ── Authenticated v2 API ─────────────────────────────────────────────── */

function apiKey(): string {
  const key = process.env.ROAPP_API_KEY;
  if (!key) throw new RoappError("ROAPP_API_KEY is not configured");
  return key;
}

async function v2<T>(
  path: string,
  init: RequestInit & { revalidate?: number | false } = {},
): Promise<T> {
  const { revalidate, ...rest } = init;
  const res = await fetch(`${V2_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    ...(rest.method && rest.method !== "GET"
      ? { cache: "no-store" as const }
      : revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate: revalidate ?? CACHE_CATALOG } }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new RoappError(
      `RoApp v2 ${rest.method ?? "GET"} ${path} → ${res.status} ${body.slice(0, 300)}`,
      res.status,
    );
  }
  // Some v2 writes answer 200 with an empty body.
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

interface PagedV2<T> {
  paging: { limit: number; page: number; total_pages: number; count: number };
  data: T[];
}

/**
 * The catalogue's shape, in the two forms the booking flow needs.
 *
 * The public booking API returns services without a category, so this joins the
 * catalogue from v2. Cached for an hour: it's ~15 sequential requests on a cold
 * cache, which the 3 req/s limit makes slow but is negligible once warm.
 *
 * Two different levels of the tree are useful, hence two maps:
 *   - `title` is the service's *immediate* category, which is what the wizard
 *     groups the service list by.
 *   - `groupId` is its *second-level* ancestor — the 8 broad headings the 232
 *     bookable services fall into ("Подологія", "Апаратні процедури"). That is
 *     the unit the admin assigns specialists against, because 8 headings is a
 *     afternoon's work and 232 services is not.
 */
export interface ServiceTaxonomy {
  /** service id → immediate category title, for UI grouping. */
  title: Map<number, string>;
  /** service id → second-level category id, the scope unit. */
  groupId: Map<number, number>;
  /** Second-level categories in catalogue order, for the admin editor. */
  groups: { id: number; title: string; serviceCount: number }[];
}

export async function serviceTaxonomy(): Promise<ServiceTaxonomy> {
  const [services, categories] = await Promise.all([
    pagedV2<{ id: number; category_id: number | null }>("/catalog/services"),
    pagedV2<{ id: number; title: string; parent_id: number | null }>(
      "/catalog/services/categories",
    ),
  ]);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const isRoot = (id: number) => {
    const c = byId.get(id);
    return !c || c.parent_id == null || !byId.has(c.parent_id);
  };

  /** Top-most non-root ancestor of a category — its second-level heading. */
  const groupOf = (categoryId: number): number | null => {
    if (!byId.has(categoryId)) return null;
    if (isRoot(categoryId)) return categoryId;
    let cur = categoryId;
    // Bounded rather than `while (true)`: a cycle in the catalogue would
    // otherwise hang the request.
    for (let hops = 0; hops < 20; hops += 1) {
      const parent = byId.get(cur)?.parent_id;
      if (parent == null || !byId.has(parent) || isRoot(parent)) return cur;
      cur = parent;
    }
    return cur;
  };

  const title = new Map<number, string>();
  const groupId = new Map<number, number>();
  const counts = new Map<number, number>();
  for (const s of services) {
    if (s.category_id == null) continue;
    const t = byId.get(s.category_id)?.title;
    if (t) title.set(s.id, t);
    const g = groupOf(s.category_id);
    if (g != null) {
      groupId.set(s.id, g);
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }

  const groups = [...counts.entries()]
    .map(([id, serviceCount]) => ({
      id,
      title: byId.get(id)?.title ?? String(id),
      serviceCount,
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "uk"));

  return { title, groupId, groups };
}

/** Walk a paged v2 collection. Sequential on purpose — 3 req/s. */
async function pagedV2<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const sep = path.includes("?") ? "&" : "?";
    const res = await v2<PagedV2<T>>(`${path}${sep}page=${page}`);
    out.push(...(res.data ?? []));
    totalPages = res.paging?.total_pages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 30);
  return out;
}

/** Attach category titles to a specialist's services. Degrades to no grouping. */
export async function listServicesGrouped(
  employeeId?: number,
): Promise<RoappServiceWithCategory[]> {
  const services = await listServices(employeeId);
  let taxonomy: ServiceTaxonomy;
  try {
    taxonomy = await serviceTaxonomy();
  } catch {
    // Grouping is a nicety; never fail the step over it. Scoping degrades too:
    // with no group ids, every specialist falls back to the full catalogue,
    // which is exactly the behaviour we had before any of this.
    taxonomy = { title: new Map(), groupId: new Map(), groups: [] };
  }
  return services.map((s) => ({
    ...s,
    categoryId: taxonomy.groupId.get(s.id) ?? null,
    categoryTitle: taxonomy.title.get(s.id) ?? null,
  }));
}

interface PersonCustomField {
  id: number;
  title: string;
  type: number;
  required: boolean;
}

/** `{ fNNNN: "" }` for every custom field RoApp marks required on a contact. */
async function requiredPersonCustomFields(): Promise<Record<string, string>> {
  try {
    const fields = await v2<PersonCustomField[]>("/contacts/people/custom-fields");
    const out: Record<string, string> = {};
    for (const f of fields ?? []) if (f.required) out[`f${f.id}`] = "";
    return out;
  } catch {
    // If the lookup fails, fall back to sending nothing — the create may still
    // succeed on an account with no required fields.
    return {};
  }
}

/**
 * Find an existing client by phone, or create one.
 *
 * Reuse matters: the account already holds ~1 200 people, and creating a
 * duplicate on every booking would corrupt the CRM. v2 has no documented
 * phone-search on /contacts/people, but `GET /bookings?client_phones=` does
 * filter — so an existing client is discoverable through their booking history,
 * which is exactly the population we care about (returning patients).
 */
export async function findOrCreatePerson(input: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<number> {
  const existing = await findPersonByPhone(input.phone);
  if (existing != null) return existing;

  // RoApp enforces its own required custom fields on contacts — this account
  // marks "Стать" (gender) required. We don't ask patients for that just to
  // satisfy a CRM constraint, and inventing a value would put wrong data in
  // their records, so required fields are sent empty (accepted with 201) for
  // staff to complete during the visit. Read dynamically so adding a new
  // required field in RoApp doesn't start rejecting every booking.
  const customFields = await requiredPersonCustomFields();

  const created = await v2<{ id?: number } | number>("/contacts/people", {
    method: "POST",
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      // `phones` is a list of objects, not a list of strings.
      phones: [{ phone: input.phone, title: "Мобільний" }],
      ...(Object.keys(customFields).length ? { custom_fields: customFields } : {}),
    }),
  });
  const id = typeof created === "number" ? created : created?.id;
  if (typeof id !== "number") {
    throw new RoappError("RoApp did not return a client id for the new person");
  }
  return id;
}

/** Most recent booking for this phone number → its client id, if any. */
async function findPersonByPhone(phone: string): Promise<number | null> {
  try {
    const qs = new URLSearchParams();
    qs.append("client_phones[]", phone);
    const res = await v2<PagedV2<{ client?: { id?: number } }>>(
      `/bookings?${qs}`,
      { revalidate: false },
    );
    const id = res.data?.[0]?.client?.id;
    return typeof id === "number" ? id : null;
  } catch {
    // A failed lookup must not block a booking — worst case we create a
    // duplicate contact, which an admin can merge (v2 has /contacts/merge-people).
    return null;
  }
}

/** Write the appointment into RoApp's calendar. */
export async function createBooking(input: {
  employeeId: number;
  clientId: number;
  /** ISO UTC instants. */
  start: string;
  end: string;
  comment?: string;
}): Promise<CreatedBooking> {
  const created = await v2<{ id?: number } | number>("/bookings", {
    method: "POST",
    body: JSON.stringify({
      branch_id: LOCATION_ID,
      assignee_id: input.employeeId,
      client_id: input.clientId,
      scheduled_for: input.start,
      scheduled_to: input.end,
      ...(input.comment ? { comment: input.comment } : {}),
    }),
  });
  const bookingId = typeof created === "number" ? created : created?.id;
  if (typeof bookingId !== "number") {
    throw new RoappError("RoApp did not return a booking id");
  }
  return { bookingId, clientId: input.clientId };
}

/** Used by the verification script to clean up a test booking. */
export async function deleteBooking(bookingId: number): Promise<void> {
  await v2(`/bookings/${bookingId}`, { method: "DELETE" });
}

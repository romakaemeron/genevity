/**
 * Shapes returned by RoApp (RemOnline), captured from the live API.
 *
 * Two different APIs are in play — see `client.ts` for why:
 *   - the public booking API behind the clinic's booking page (reads)
 *   - the authenticated v2 API at api.roapp.io (writes)
 */

/** A bookable specialist, from the public booking API. */
export interface RoappEmployee {
  id: number;
  /** "Given Patronymic Surname" — RoApp's order, not ours. */
  name: string;
  position: string;
  avatar: string;
  /** Next free slot, precomputed by RoApp. Null when fully booked ahead. */
  firstSlot: RoappSlot | null;
}

/** A free interval. Both ends are UTC instants (the account is Europe/Kyiv). */
export interface RoappSlot {
  dateStart: string;
  dateEnd: string;
}

/** A service one specialist performs, from the public booking API. */
export interface RoappService {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
}

/** A service enriched with its catalogue category (joined from the v2 API). */
export interface RoappServiceWithCategory extends RoappService {
  categoryId: number | null;
  categoryTitle: string | null;
}

/** What the wizard needs to render one specialist. */
export interface BookingDoctor {
  /** RoApp employee id — the value written back on the booking. */
  id: number;
  /** Display name, preferring our CMS spelling when we have the doctor. */
  name: string;
  /** Role, preferring our CMS copy (localized) over RoApp's `position`. */
  role: string;
  /** Circle photo from our CMS; null when the doctor isn't on the site yet. */
  photo: string | null;
  photoFocalPoint: string;
  /** Link to the doctor's page on our site, when they have one. */
  slug: string | null;
  /** Next free slot as an ISO UTC instant, or null. */
  nextSlot: string | null;
}

export interface BookingSlot {
  /** ISO UTC instant. */
  start: string;
  end: string;
}

/** Result of writing an appointment into RoApp. */
export interface CreatedBooking {
  bookingId: number;
  clientId: number;
}

/**
 * Canonical list of every place on the public site that renders a
 * BookingCTA. Each entry owns a stable `key` that the component passes
 * to the translation lookup (`cta.<key>.<field>`) so admins can override
 * the modal title / subtitle / submit label / button text independently
 * for that specific surface. Unknown keys fall back to the global
 * `ctaForm.*` defaults — so introducing a new CTA location is just a
 * matter of adding an entry here.
 *
 * The keys are part of the data contract (they live in ui_strings) —
 * renaming one means the admin's override for that surface disappears,
 * so only append / rename with care.
 */

export interface CtaRegistryEntry {
  key: string;
  /** Short label shown in the admin sidebar accordion. */
  label: string;
  /** One-line explanation of where this CTA appears. */
  description: string;
  /** Grouping heading in the admin UI — keeps the list browsable. */
  group:
    | "Homepage & navigation"
    | "Service pages"
    | "Content pages"
    | "Laboratory & Stationary"
    | "Doctor & Equipment"
    | "Embedded sections";
}

export const CTA_REGISTRY: readonly CtaRegistryEntry[] = [
  // Homepage & navigation
  { key: "hero",                   group: "Homepage & navigation", label: "Homepage hero",                 description: "The primary CTA inside the homepage hero slideshow." },
  { key: "megamenu",               group: "Homepage & navigation", label: "Top navigation (desktop)",      description: "CTA in the sticky site header." },
  { key: "megamenuMobile",         group: "Homepage & navigation", label: "Top navigation (mobile menu)",  description: "CTA shown inside the mobile hamburger panel." },

  // Service pages
  { key: "serviceDetailHero",      group: "Service pages", label: "Service detail — hero CTA",   description: "Above-the-fold CTA inside a service's hero block." },
  { key: "serviceDetailFinal",     group: "Service pages", label: "Service detail — final CTA",  description: "Closing CTA card at the bottom of a service page." },
  { key: "categoryHero",           group: "Service pages", label: "Service category — hero CTA", description: "Hero CTA on a category hub page." },
  { key: "categoryFinal",          group: "Service pages", label: "Service category — final CTA", description: "Closing CTA card on a category hub page." },

  // Content pages
  { key: "aboutHero",              group: "Content pages", label: "About — hero CTA",   description: "Top CTA on /about." },
  { key: "aboutFinal",             group: "Content pages", label: "About — final CTA",  description: "Closing CTA on /about." },
  { key: "doctorsFinal",           group: "Content pages", label: "Doctors — final CTA", description: "Closing CTA on the doctors listing page." },
  { key: "pricesFinal",            group: "Content pages", label: "Prices — final CTA",  description: "Closing CTA on /prices." },
  { key: "contactsHero",           group: "Content pages", label: "Contacts — hero CTA", description: "Top CTA on /contacts." },
  { key: "contactsFinal",          group: "Content pages", label: "Contacts — final CTA", description: "Closing CTA on /contacts." },
  { key: "staticPageHero",         group: "Content pages", label: "Static page — hero CTA",  description: "Generic hero CTA used by custom static pages." },
  { key: "staticPageMid",          group: "Content pages", label: "Static page — mid CTA",   description: "Optional mid-content CTA on static pages." },
  { key: "staticPageFinal",        group: "Content pages", label: "Static page — final CTA", description: "Generic closing CTA used by custom static pages." },

  // Laboratory & Stationary (Phase 2 pages)
  { key: "laboratoryHero",         group: "Laboratory & Stationary", label: "Laboratory — hero CTA",   description: "Hero CTA on /laboratory." },
  { key: "laboratoryMid",          group: "Laboratory & Stationary", label: "Laboratory — mid CTA",    description: "Mid-content CTA on /laboratory." },
  { key: "laboratoryFinal",        group: "Laboratory & Stationary", label: "Laboratory — final CTA",  description: "Closing CTA on /laboratory." },
  { key: "stationaryHero",         group: "Laboratory & Stationary", label: "Stationary — hero CTA",   description: "Hero CTA on /stationary." },
  { key: "stationaryMid",          group: "Laboratory & Stationary", label: "Stationary — mid CTA",    description: "Mid-content CTA on /stationary." },
  { key: "stationaryFinal",        group: "Laboratory & Stationary", label: "Stationary — final CTA",  description: "Closing CTA on /stationary." },

  // Doctor & Equipment modals
  { key: "doctorModal",            group: "Doctor & Equipment", label: "Doctor detail modal",          description: "CTA inside the doctor profile modal." },

  // Embedded sections
  { key: "ctaSection",             group: "Embedded sections", label: "In-content CTA section",       description: "CTA rendered by the section.cta page builder block." },
  { key: "priceTeaser",            group: "Embedded sections", label: "Price teaser section",         description: "CTA attached to the price-teaser section." },
] as const;

/** Union of every registered key — useful for strict call sites. */
export type CtaKey = (typeof CTA_REGISTRY)[number]["key"];

export type CtaOverrideFields = "buttonLabel" | "modalTitle" | "modalSubtitle" | "submitLabel";

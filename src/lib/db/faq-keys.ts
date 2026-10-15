/**
 * FAQ category keys — the single source of truth, shared by the admin editor,
 * the save action and the public FAQ page.
 *
 * Lives outside `queries/faq.ts` because that module imports `sql`, which
 * evaluates `neon(DATABASE_URL)` at module scope. The admin FAQ editor is a
 * client component and imports these keys as *values*, so keeping them here
 * is what stops the Neon client from being bundled into the browser. See
 * `lib/guards/client-server-boundary.test.ts`.
 *
 * Nothing in this file may import from `./client` or any module that does.
 */

export const FAQ_CATEGORY_KEYS = ["booking", "preparation", "payment", "safety", "lab", "visit"] as const;
export type FaqCategoryKey = (typeof FAQ_CATEGORY_KEYS)[number];

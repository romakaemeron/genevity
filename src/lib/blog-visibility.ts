/**
 * Single source of truth for the "blog is hidden on production until launch"
 * gate.
 *
 * The public article/listing pages redirect away when this is true, and draft
 * preview is unavailable for exactly the same reason: the page an editor would
 * be sent to does not render on production. Both must be derived from this
 * constant so they can never drift apart.
 */
export const BLOG_HIDDEN_ON_PRODUCTION = process.env.VERCEL_ENV === "production";

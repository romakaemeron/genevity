/**
 * Single source of truth for the "blog is hidden on production until launch"
 * gate.
 *
 * The public article/listing pages redirect away when this is true, and draft
 * preview is unavailable for exactly the same reason: the page an editor would
 * be sent to does not render on production. Both must be derived from this
 * constant so they can never drift apart.
 *
 * The blog launched on 2026-09-25, so this is now permanently false: the
 * listing and article pages render everywhere, and editors get draft preview on
 * production too. Kept as a named constant rather than deleted so the three
 * call sites stay a single switch if the blog ever needs pulling again.
 */
export const BLOG_HIDDEN_ON_PRODUCTION = false;

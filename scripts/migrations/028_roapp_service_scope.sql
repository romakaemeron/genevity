-- Which RoApp services each bookable specialist is offered for.
--
-- RoApp has no way to express this. Its public booking API accepts an
-- `employee_id` on the services endpoint and ignores it — verified against the
-- live account, and RoApp's own booking page sends the identical parameter and
-- gets the identical unfiltered list back. So every specialist is currently
-- offered all 232 bookable services, urologist included.
--
-- The wizard filtered correctly before the RoApp switch, from our own
-- service_doctors table. That broke because CMS services are UUIDs and RoApp's
-- are integers, two different id spaces. This table is that bridge, rebuilt on
-- RoApp's own ids.
--
-- Keyed on the RoApp employee id rather than our doctors.id on purpose: the
-- wizard works in RoApp ids throughout, and the CMS↔RoApp join is a fuzzy name
-- match that resolves only 8 of the 12 bookable specialists. Keying on the
-- integer keeps the mapping meaningful for the other 4.
--
-- Resolution order, implemented in src/lib/db/queries/booking-scope.ts:
--   1. no rows at all for an employee  → every service (the safe default: a
--      specialist nobody has mapped yet behaves exactly as today, so a
--      half-finished mapping can never dead-end a patient)
--   2. otherwise                        → union of allowed categories and
--      allowed services, minus denied services
--
-- `scope_id` is deliberately not a foreign key: it points into RoApp's
-- catalogue, which lives in another system entirely.
--
-- Run: npx tsx scripts/run-migration-028.ts

CREATE TABLE IF NOT EXISTS roapp_service_scope (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- RoApp employee id (integer, from the public booking API).
  employee_id INTEGER NOT NULL,
  -- 'category' matches every service beneath a second-level RoApp category;
  -- 'service' names one service exactly.
  scope_type  TEXT NOT NULL CHECK (scope_type IN ('category', 'service')),
  -- RoApp category id or service id, per scope_type.
  scope_id    INTEGER NOT NULL,
  -- 'deny' is only meaningful for scope_type='service': it carves one service
  -- out of an allowed category.
  mode        TEXT NOT NULL DEFAULT 'allow' CHECK (mode IN ('allow', 'deny')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, scope_type, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_roapp_service_scope_employee
  ON roapp_service_scope (employee_id);

-- A category-wide deny would be ambiguous against rule 1 above (no rows = all
-- services), so the resolution never reads one. Rejecting it in the schema
-- keeps the admin editor and the query from disagreeing about what it means.
ALTER TABLE roapp_service_scope
  DROP CONSTRAINT IF EXISTS roapp_service_scope_no_category_deny;
ALTER TABLE roapp_service_scope
  ADD CONSTRAINT roapp_service_scope_no_category_deny
  CHECK (NOT (scope_type = 'category' AND mode = 'deny'));

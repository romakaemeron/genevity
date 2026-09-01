-- Patient-facing WhatsApp confirmation for online bookings.
--
-- Two nullable columns, so existing rows and the callback form are unaffected:
--   whatsapp_opt_in   the consent the patient gave in the wizard. WhatsApp
--                     policy requires explicit opt-in, so it has to be
--                     auditable rather than merely acted on. NULL = the form
--                     predates the checkbox or never offered it.
--   whatsapp_status   what actually happened: 'sent' | 'unreachable' |
--                     'failed' | 'skipped'. Left as TEXT rather than an enum;
--                     the set is likely to grow and this table is small.

ALTER TABLE form_submissions
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN,
  ADD COLUMN IF NOT EXISTS whatsapp_status TEXT;

-- Explicit opt-in for anonymous aggregate analytics ("bowlers like you" feature).
-- Default false: users must actively consent; no data included without it.
alter table public.bowlers
  add column analytics_consent    boolean     not null default false,
  add column analytics_consent_at timestamptz;

-- Extend patterns table to support AI-sourced entries (same pattern as balls_catalog).
-- Also adds updated_at and expands the source vocabulary.

alter table public.patterns
  add column ai_verified boolean not null default false,
  add column updated_at  timestamptz not null default now();

create trigger patterns_updated_at before update on public.patterns
  for each row execute function public.set_updated_at();

-- Expand source check to cover more publishers.
-- The inline constraint is named patterns_source_check by Postgres.
alter table public.patterns drop constraint if exists patterns_source_check;
alter table public.patterns add constraint patterns_source_check
  check (source in (
    'kegel', 'pba', 'brunswick', 'usbc',
    'storm', 'track', 'columbia', 'motiv',
    'house', 'tournament', 'other'
  ));

-- Unique name so AI lookups are idempotent.
alter table public.patterns add constraint patterns_name_unique unique (name);

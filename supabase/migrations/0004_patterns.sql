-- Shared reference table: all authenticated users can read; only service role can write (seed-managed).
create table public.patterns (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  source     text check (source in ('kegel', 'pba', 'brunswick', 'usbc', 'other')) default 'other',
  category   text check (category in ('short', 'medium', 'long', 'sport', 'custom')) default 'medium',
  length_ft  numeric,
  volume_ml  numeric,
  ratio      numeric,
  notes      text,
  created_at timestamptz not null default now()
);

alter table public.patterns enable row level security;

create policy "patterns_select_authenticated" on public.patterns for select to authenticated using (true);
-- Insert/update/delete restricted to service role (no user-facing policies).

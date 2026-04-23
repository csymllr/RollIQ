-- Community ball catalog: seeded by migrations, grown by Edge Function AI lookups.
-- All authenticated users can read; service role writes (no user-facing write policies).
create table public.balls_catalog (
  id              uuid primary key default gen_random_uuid(),
  brand           text not null,
  model           text not null,
  cover_type      text check (cover_type in ('Solid Reactive', 'Pearl Reactive', 'Hybrid Reactive', 'Urethane', 'Polyester', 'Particle')),
  core_name       text,
  cover_name      text,
  factory_finish  text,
  role_tag        text check (role_tag in ('benchmark', 'strong_asym', 'transition', 'urethane', 'spare', 'other')),
  core_symmetry   text check (core_symmetry in ('symmetric', 'asymmetric')),
  release_year    integer,
  is_discontinued boolean not null default false,
  ai_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (brand, model)
);

create trigger balls_catalog_updated_at before update on public.balls_catalog
  for each row execute function public.set_updated_at();

alter table public.balls_catalog enable row level security;

create policy "catalog_select_authenticated" on public.balls_catalog
  for select to authenticated using (true);
-- Writes are service-role only (Edge Function + seeding migrations).

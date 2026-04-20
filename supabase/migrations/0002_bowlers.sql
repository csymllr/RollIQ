create table public.bowlers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  display_name     text not null,
  handedness       text check (handedness in ('right', 'left')),
  style_type       text check (style_type in ('one_handed', 'two_handed')),
  rev_profile      text,
  speed_profile    text,
  average_band     text,
  typical_miss     text,
  experience_level text,
  pap              text,
  axis_tilt        numeric,
  axis_rotation    numeric,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id)
);

create trigger bowlers_updated_at before update on public.bowlers
  for each row execute function public.set_updated_at();

alter table public.bowlers enable row level security;

create policy "bowlers_select_own" on public.bowlers for select using (auth.uid() = user_id);
create policy "bowlers_insert_own" on public.bowlers for insert with check (auth.uid() = user_id);
create policy "bowlers_update_own" on public.bowlers for update using (auth.uid() = user_id);
create policy "bowlers_delete_own" on public.bowlers for delete using (auth.uid() = user_id);

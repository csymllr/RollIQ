create table public.balls (
  id             uuid primary key default gen_random_uuid(),
  bowler_id      uuid not null references public.bowlers(id) on delete cascade,
  brand          text not null,
  model          text not null,
  weight_lb      integer not null check (weight_lb between 6 and 16),
  cover_type     text,
  core_type      text,
  finish_surface text,
  layout_text    text,
  role_tag       text check (role_tag in ('benchmark', 'strong_asym', 'transition', 'urethane', 'spare', 'other')),
  status_active  boolean not null default true,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger balls_updated_at before update on public.balls
  for each row execute function public.set_updated_at();

alter table public.balls enable row level security;

create policy "balls_select_own" on public.balls for select
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "balls_insert_own" on public.balls for insert
  with check (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "balls_update_own" on public.balls for update
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "balls_delete_own" on public.balls for delete
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));

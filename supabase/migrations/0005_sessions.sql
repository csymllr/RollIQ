create table public.sessions (
  id               uuid primary key default gen_random_uuid(),
  bowler_id        uuid not null references public.bowlers(id) on delete cascade,
  event_type       text not null check (event_type in ('practice', 'league', 'tournament')),
  center_name      text not null,
  lane_pair        text,
  pattern_id       uuid references public.patterns(id) on delete set null,
  pattern_snapshot jsonb,
  session_date     date not null default current_date,
  session_notes    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger sessions_updated_at before update on public.sessions
  for each row execute function public.set_updated_at();

alter table public.sessions enable row level security;

create policy "sessions_select_own" on public.sessions for select
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "sessions_insert_own" on public.sessions for insert
  with check (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "sessions_update_own" on public.sessions for update
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "sessions_delete_own" on public.sessions for delete
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));

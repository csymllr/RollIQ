-- Tournaments: groups a set of sessions under one competitive event.
-- Each round of bowling (qualifying block, match play, finals) becomes
-- a session linked back here via sessions.tournament_id.

create table public.tournaments (
  id                  uuid        primary key default gen_random_uuid(),
  bowler_id           uuid        not null references public.bowlers(id) on delete cascade,
  name                text        not null,
  organization        text,
  location            text,
  start_date          date,
  end_date            date,
  format_description  text,
  -- Structured format metadata for analytics; shape varies by org/event.
  -- Example: {"qualifying_games":5,"qualifying_pairs":5,"finals":"stepladder"}
  format_snapshot     jsonb,
  is_handicap         boolean     not null default false,
  handicap_base       integer,
  handicap_percentage numeric,
  entering_average    integer,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger tournaments_updated_at before update on public.tournaments
  for each row execute function public.set_updated_at();

alter table public.tournaments enable row level security;

create policy "tournaments_select_own" on public.tournaments for select
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "tournaments_insert_own" on public.tournaments for insert
  with check (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "tournaments_update_own" on public.tournaments for update
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));
create policy "tournaments_delete_own" on public.tournaments for delete
  using (exists (select 1 from public.bowlers b where b.id = bowler_id and b.user_id = auth.uid()));

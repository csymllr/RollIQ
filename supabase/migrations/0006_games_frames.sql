create table public.games (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  game_number  integer not null check (game_number > 0),
  final_score  integer check (final_score between 0 and 300),
  clean_game   boolean,
  strike_count integer default 0,
  spare_count  integer default 0,
  open_count   integer default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (session_id, game_number)
);

create trigger games_updated_at before update on public.games
  for each row execute function public.set_updated_at();

alter table public.games enable row level security;

create policy "games_select_own" on public.games for select
  using (exists (
    select 1 from public.sessions s
    join public.bowlers b on b.id = s.bowler_id
    where s.id = session_id and b.user_id = auth.uid()
  ));
create policy "games_insert_own" on public.games for insert
  with check (exists (
    select 1 from public.sessions s
    join public.bowlers b on b.id = s.bowler_id
    where s.id = session_id and b.user_id = auth.uid()
  ));
create policy "games_update_own" on public.games for update
  using (exists (
    select 1 from public.sessions s
    join public.bowlers b on b.id = s.bowler_id
    where s.id = session_id and b.user_id = auth.uid()
  ));
create policy "games_delete_own" on public.games for delete
  using (exists (
    select 1 from public.sessions s
    join public.bowlers b on b.id = s.bowler_id
    where s.id = session_id and b.user_id = auth.uid()
  ));

-- Frames

create table public.frames (
  id               uuid primary key default gen_random_uuid(),
  game_id          uuid not null references public.games(id) on delete cascade,
  frame_number     integer not null check (frame_number between 1 and 10),
  roll1_pins       integer check (roll1_pins between 0 and 10),
  roll2_pins       integer check (roll2_pins between 0 and 10),
  roll3_pins       integer check (roll3_pins between 0 and 10),
  frame_score      integer,
  cumulative_score integer,
  result_type      text check (result_type in ('strike', 'spare', 'open', 'split_spare', 'split_open', 'foul', 'incomplete')),
  leave_type       text,
  converted        boolean,
  ball_id          uuid references public.balls(id) on delete set null,
  frame_note       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (game_id, frame_number)
);

create trigger frames_updated_at before update on public.frames
  for each row execute function public.set_updated_at();

alter table public.frames enable row level security;

create policy "frames_select_own" on public.frames for select
  using (exists (
    select 1 from public.games g
    join public.sessions s on s.id = g.session_id
    join public.bowlers b on b.id = s.bowler_id
    where g.id = game_id and b.user_id = auth.uid()
  ));
create policy "frames_insert_own" on public.frames for insert
  with check (exists (
    select 1 from public.games g
    join public.sessions s on s.id = g.session_id
    join public.bowlers b on b.id = s.bowler_id
    where g.id = game_id and b.user_id = auth.uid()
  ));
create policy "frames_update_own" on public.frames for update
  using (exists (
    select 1 from public.games g
    join public.sessions s on s.id = g.session_id
    join public.bowlers b on b.id = s.bowler_id
    where g.id = game_id and b.user_id = auth.uid()
  ));
create policy "frames_delete_own" on public.frames for delete
  using (exists (
    select 1 from public.games g
    join public.sessions s on s.id = g.session_id
    join public.bowlers b on b.id = s.bowler_id
    where g.id = game_id and b.user_id = auth.uid()
  ));

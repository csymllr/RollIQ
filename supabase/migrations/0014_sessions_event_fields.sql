-- Extend sessions with event context, handicap info, and tournament linkage.

alter table public.sessions
  -- Human name for the league or tournament (e.g. "Thursday Doubles", "JBT Arizona #3")
  add column event_name       text,
  -- How many games were planned for this block (drives scorecard setup)
  add column planned_games    integer check (planned_games > 0),
  -- Average locked in for this event (may differ from rolling profile average)
  add column entering_average integer check (entering_average between 0 and 300),
  -- Calculated handicap for this event (null = scratch)
  add column handicap         integer check (handicap >= 0),
  -- Whether this session uses handicap scoring
  add column is_handicap      boolean not null default false,
  -- Tournament this session belongs to (null = standalone session)
  add column tournament_id    uuid references public.tournaments(id) on delete set null,
  -- Which round within the tournament
  add column round_type       text check (round_type in (
                                'qualifying', 'position_round',
                                'semifinal', 'final', 'match_play'
                              )),
  -- Block / round number within the round type (e.g. qualifying block 2)
  add column round_number     integer check (round_number > 0);

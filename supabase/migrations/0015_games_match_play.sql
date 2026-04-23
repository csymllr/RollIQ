-- Add match play fields to games for head-to-head tournament scoring.
-- All fields nullable — only populated when the session is match play format.

alter table public.games
  add column opponent_score integer check (opponent_score between 0 and 300),
  add column match_result   text check (match_result in ('win', 'loss', 'push'));

-- Track whether a ball is currently in the bowler's bag for tonight's session.
-- Separate from status_active: a ball can be active (still owned) but not in bag.
alter table public.balls add column in_bag boolean not null default false;

-- Add equipment-objective category and technical core specs to balls and catalog.
-- perf_category describes what the ball IS (objective).
-- role_tag (existing) describes how the bowler uses it (subjective).

alter table public.balls
  add column perf_category   text check (perf_category in (
    'strong_asym','strong_solid','strong_pearl','strong_hybrid',
    'mid_solid','mid_pearl','mid_hybrid','entry','urethane','spare'
  )),
  add column cover_name      text,
  add column rg              numeric(4,3),
  add column differential    numeric(5,4),
  add column mass_bias       numeric(5,4),
  add column flare_potential text;

alter table public.balls_catalog
  add column perf_category   text check (perf_category in (
    'strong_asym','strong_solid','strong_pearl','strong_hybrid',
    'mid_solid','mid_pearl','mid_hybrid','entry','urethane','spare'
  )),
  add column rg              numeric(4,3),
  add column differential    numeric(5,4),
  add column mass_bias       numeric(5,4),
  add column flare_potential text;

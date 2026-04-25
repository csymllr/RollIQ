-- Correct Storm Bionic catalog entry with verified specs from official tech sheet.
insert into public.balls_catalog
  (brand, model, cover_type, cover_name, core_name, core_symmetry, factory_finish,
   perf_category, role_tag, flare_potential, rg, differential, ai_verified)
values
  ('Storm', 'Bionic', 'Hybrid Reactive', 'NRG Hybrid', 'Torsion A.I. Core', 'symmetric',
   '4000-grit Abralon', 'strong_hybrid', 'benchmark', 'Medium-High', 2.47, 0.050, true)
on conflict (brand, model) do update set
  cover_type      = excluded.cover_type,
  cover_name      = excluded.cover_name,
  core_name       = excluded.core_name,
  core_symmetry   = excluded.core_symmetry,
  factory_finish  = excluded.factory_finish,
  perf_category   = excluded.perf_category,
  role_tag        = excluded.role_tag,
  flare_potential = excluded.flare_potential,
  rg              = excluded.rg,
  differential    = excluded.differential,
  ai_verified     = excluded.ai_verified;

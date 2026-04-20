-- Seed well-known oil patterns for reference.
-- Uses INSERT ... ON CONFLICT DO NOTHING to be idempotent.
insert into public.patterns (name, source, category, length_ft, volume_ml, ratio, notes) values
  ('House — Typical',     'other',     'medium', 40,   23,  8.6,  'Standard recreational house shot'),
  ('Kegel Main Street',   'kegel',     'medium', 40,   24,  3.2,  'USBC Sport Shot; medium condition'),
  ('Kegel Stone Street',  'kegel',     'short',  32,   18,  2.4,  'Short sport pattern; heavy volume'),
  ('Kegel Broadway',      'kegel',     'long',   47,   26,  2.8,  'Long sport pattern'),
  ('Kegel Beaten Path',   'kegel',     'medium', 38,   22,  3.0,  'Medium-short sport'),
  ('PBA Chameleon',       'pba',       'medium', 39,   24.6, 4.0, 'One of the PBA Experience patterns'),
  ('PBA Scorpion',        'pba',       'long',   45,   27.7, 3.5, 'Long PBA Experience pattern'),
  ('PBA Shark',           'pba',       'long',   47,   27.7, 2.9, 'Very long, demanding PBA pattern')
on conflict do nothing;

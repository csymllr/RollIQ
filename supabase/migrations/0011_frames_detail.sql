-- Advanced per-frame data capture (opt-in via session advanced mode).
-- Stored as JSONB so new fields can be added without future migrations.
-- Null means basic mode was active for that frame.
--
-- Expected shape when populated:
-- {
--   "foot_board":        25,
--   "target_board":      10,
--   "ball_speed_mph":    17.2,
--   "exit_board":        8,
--   "adjustment_type":   "feet" | "target" | "ball" | "surface" | "none",
--   "adjustment_reason": "early" | "late" | "short" | "long" | "high" | "inconsistent" | "none"
-- }
alter table public.frames
  add column frame_detail jsonb;

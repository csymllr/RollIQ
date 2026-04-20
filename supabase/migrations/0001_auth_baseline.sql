-- Auth baseline: confirms auth schema is available.
-- No custom tables here; auth.users is managed by Supabase Auth.
-- All user-owned tables reference auth.users(id) via foreign key.

-- Helper function to auto-update updated_at columns
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

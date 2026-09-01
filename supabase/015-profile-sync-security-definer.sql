-- Purpose: Allow the users -> profiles sync trigger to maintain profile rows
-- without being blocked by profiles row level security.

create or replace function public.sync_profile_from_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.name)
  on conflict (id) do update set name = excluded.name;
  return new;
end;
$$;

grant execute on function public.sync_profile_from_user() to authenticated;

notify pgrst, 'reload schema';

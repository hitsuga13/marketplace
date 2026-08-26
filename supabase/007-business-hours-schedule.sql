-- Replace the legacy text hours field with a Google-Maps-style weekly schedule.
-- Existing text values are replaced with the default schedule.

alter table public.profiles
  alter column business_hours drop default,
  alter column business_hours type jsonb using (
    case
      when business_hours is null or btrim(business_hours) = '' then
        '{"monday":{"isOpen":true,"open":"08:00","close":"22:00"},"tuesday":{"isOpen":true,"open":"08:00","close":"22:00"},"wednesday":{"isOpen":true,"open":"08:00","close":"22:00"},"thursday":{"isOpen":true,"open":"08:00","close":"22:00"},"friday":{"isOpen":true,"open":"08:00","close":"22:00"},"saturday":{"isOpen":true,"open":"08:00","close":"22:00"},"sunday":{"isOpen":false,"open":"","close":""}}'::jsonb
      when left(btrim(business_hours), 1) = '{' then business_hours::jsonb
      else
        '{"monday":{"isOpen":true,"open":"08:00","close":"22:00"},"tuesday":{"isOpen":true,"open":"08:00","close":"22:00"},"wednesday":{"isOpen":true,"open":"08:00","close":"22:00"},"thursday":{"isOpen":true,"open":"08:00","close":"22:00"},"friday":{"isOpen":true,"open":"08:00","close":"22:00"},"saturday":{"isOpen":true,"open":"08:00","close":"22:00"},"sunday":{"isOpen":false,"open":"","close":""}}'::jsonb
    end
  ),
  alter column business_hours set default '{"monday":{"isOpen":true,"open":"08:00","close":"22:00"},"tuesday":{"isOpen":true,"open":"08:00","close":"22:00"},"wednesday":{"isOpen":true,"open":"08:00","close":"22:00"},"thursday":{"isOpen":true,"open":"08:00","close":"22:00"},"friday":{"isOpen":true,"open":"08:00","close":"22:00"},"saturday":{"isOpen":true,"open":"08:00","close":"22:00"},"sunday":{"isOpen":false,"open":"","close":""}}'::jsonb;

-- The legacy users.business_hours column remains text. Profile schedules are
-- now seller-managed, so user sync must not overwrite the JSON schedule.
create or replace function public.sync_profile_from_user()
returns trigger language plpgsql as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.name)
  on conflict (id) do update set name = excluded.name;
  return new;
end;
$$;

update public.profiles
set business_hours = coalesce(
  business_hours,
  '{"monday":{"isOpen":true,"open":"08:00","close":"22:00"},"tuesday":{"isOpen":true,"open":"08:00","close":"22:00"},"wednesday":{"isOpen":true,"open":"08:00","close":"22:00"},"thursday":{"isOpen":true,"open":"08:00","close":"22:00"},"friday":{"isOpen":true,"open":"08:00","close":"22:00"},"saturday":{"isOpen":true,"open":"08:00","close":"22:00"},"sunday":{"isOpen":false,"open":"","close":""}}'::jsonb
);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles
for update to authenticated using (true) with check (true);

grant update (business_hours, pickup_address) on public.profiles to authenticated;

-- RLS & Function Updates for Approval Workflow

-- 1. Create a "Strict" check (Active Members only - for expenses/settlements)
-- We rename the existing concept or update it. 
-- Existing `is_member_of_trip` was just checking existence. We update it to check 'accepted'.
create or replace function public.is_member_of_trip(_trip_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.trip_members
    where trip_id = _trip_id
    and user_id = auth.uid()
    and status = 'accepted'
  );
end;
$$;

-- 2. Create a "Loose" check (For viewing the trip shell or member list)
create or replace function public.is_associated_with_trip(_trip_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.trip_members
    where trip_id = _trip_id
    and user_id = auth.uid()
    and status in ('accepted', 'pending', 'invited')
  );
end;
$$;

-- 3. Update Policies

-- Trips: Allow associated users to see the trip metadata (needed for "Pending" screen or accepting invite)
drop policy if exists "Members can view trips" on public.trips;
create policy "Associated users can view trips" on public.trips for select using (
  public.is_associated_with_trip(id)
);

-- Expenses: STRICT (Only accepted)
-- Already uses `is_member_of_trip`, which we updated to be strict.

-- Settlements: STRICT (Only accepted)
-- Already uses `is_member_of_trip`, which we updated to be strict.

-- Trip Members: Allow associated to see list (so you can see who is in the trip you are waiting for)
drop policy if exists "Members can view members" on public.trip_members;
create policy "Associated users can view members" on public.trip_members for select using (
  public.is_associated_with_trip(trip_id)
);

-- 4. Search Function for Invites
create or replace function public.search_profiles(query text)
returns table (
  id uuid,
  display_name text,
  email text,
  avatar_url text
) 
language plpgsql
security definer
as $$
begin
  return query
  select p.id, p.display_name, p.email, p.avatar_url
  from public.profiles p
  where 
    p.email ilike '%' || query || '%' 
    or p.display_name ilike '%' || query || '%'
  limit 10;
end;
$$;

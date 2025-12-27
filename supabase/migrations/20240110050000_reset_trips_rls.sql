-- Reset Trips Policies to ensure clean state
-- We drop known policies to avoid conflicts, then recreate the correct ones.

-- 1. Drop potential existing policies
drop policy if exists "Members can view trips" on public.trips;
drop policy if exists "Associated users can view trips" on public.trips;
drop policy if exists "Associated users and leaders can view trips" on public.trips;
drop policy if exists "Authenticad users can create trips" on public.trips;
drop policy if exists "Leaders can delete trips" on public.trips;
drop policy if exists "Leaders can update trips" on public.trips; -- just in case

-- 2. Recreate Policies

-- SELECT: Members (associated) OR Leader
create policy "Users can view trips" on public.trips for select using (
  public.is_associated_with_trip(id) 
  OR 
  leader_id = auth.uid()
);

-- INSERT: Authenticated users can create (must be leader)
create policy "Users can create trips" on public.trips for insert with check (
  auth.uid() = leader_id
);

-- UPDATE: Leaders only
create policy "Leaders can update trips" on public.trips for update using (
  leader_id = auth.uid()
);

-- DELETE: Leaders only
create policy "Leaders can delete trips" on public.trips for delete using (
  leader_id = auth.uid()
);

-- Fix Trip Creation RLS
-- The previous Select policy failed during INSERT because the user wasn't in trip_members yet.
-- We allow the leader (who is defining the trip) to see it immediately.

drop policy "Associated users can view trips" on public.trips;

create policy "Associated users and leaders can view trips" on public.trips for select using (
  public.is_associated_with_trip(id) 
  OR 
  leader_id = auth.uid()
);

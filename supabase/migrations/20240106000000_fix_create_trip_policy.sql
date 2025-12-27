-- Update "Members can view trips" policy to include Leaders (for creation visibility)
drop policy "Members can view trips" on public.trips;
create policy "Members can view trips" on public.trips for select using (
  public.is_member_of_trip(id) or leader_id = auth.uid()
);

-- Ensure "Authenticad users can create trips" is correct (idempotent-ish)
-- Note: 'create policy if not exists' is not standard in older pg versions, but we can drop and recreate to be safe and ensure it is correct.
drop policy if exists "Authenticad users can create trips" on public.trips;
create policy "Authenticad users can create trips" on public.trips for insert with check (
  auth.uid() = leader_id
);

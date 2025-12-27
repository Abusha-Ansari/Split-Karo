-- Add INSERT policy for Settlements
-- Policy allows users to insert settlements where they are the payer (from_user_id = auth.uid)
create policy "Users can record settlements" on public.settlements for insert with check (
  auth.uid() = from_user_id
  and exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = settlements.trip_id
    and trip_members.user_id = auth.uid()
  )
);

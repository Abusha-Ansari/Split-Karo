-- Fix RLS for Invites and Leader Actions

-- 1. Helper to check if user is leader
create or replace function public.is_trip_leader(_trip_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.trips
    where id = _trip_id
    and leader_id = auth.uid()
  );
end;
$$;

-- 2. Policy: Members can invite others (Insert)
create policy "Members can invite others" on public.trip_members for insert with check (
  public.is_member_of_trip(trip_id)
);

-- 3. Policy: Leaders can update members (Approve)
create policy "Leaders can update members" on public.trip_members for update using (
  public.is_trip_leader(trip_id)
);

-- 4. Policy: Leaders can remove members (Reject/Kick)
create policy "Leaders can delete members" on public.trip_members for delete using (
  public.is_trip_leader(trip_id)
);

-- 5. Policy: Users can leave trip (Delete self)
create policy "Users can leave trip" on public.trip_members for delete using (
  auth.uid() = user_id
);

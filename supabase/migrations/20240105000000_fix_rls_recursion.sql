-- Fix RLS Recursion by using Security Definer function

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
  );
end;
$$;

-- Update Trips Policy
drop policy "Members can view trips" on public.trips;
create policy "Members can view trips" on public.trips for select using (
  public.is_member_of_trip(id)
);

-- Update Trip Members Policy
drop policy "Members can view members" on public.trip_members;
create policy "Members can view members" on public.trip_members for select using (
  public.is_member_of_trip(trip_id)
);

-- Add Missing Insert Policy for Trip Members
-- Check if policy exists first to avoid error? Or just create. 
-- "create policy if not exists" is not standard pg syntax for policies generally, need valid name.
-- Assuming it didn't exist as per my read of init.sql.
create policy "Users can join trips" on public.trip_members for insert with check (
  auth.uid() = user_id
);

-- Update Expenses Policy
drop policy "Members can view expenses" on public.expenses;
create policy "Members can view expenses" on public.expenses for select using (
  public.is_member_of_trip(trip_id)
);

-- Update Settlements Policy
drop policy "Members can view settlements" on public.settlements;
create policy "Members can view settlements" on public.settlements for select using (
  public.is_member_of_trip(trip_id)
);

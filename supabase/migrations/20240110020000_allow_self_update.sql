-- Allow users to update their own status (e.g. accepting an invite)
-- We strictly limit this to updating their own row.
create policy "Users can update own membership status" on public.trip_members for update using (
    auth.uid() = user_id
) with check (
    auth.uid() = user_id
);

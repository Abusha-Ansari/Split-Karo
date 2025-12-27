-- RPC to lookup trip by invite code (bypassing RLS)
create or replace function public.get_trip_id_by_invite_code(invite_code_input text)
returns uuid
language plpgsql
security definer
as $$
declare
  _trip_id uuid;
begin
  select id into _trip_id
  from public.trips
  where invite_code = invite_code_input;
  
  return _trip_id;
end;
$$;

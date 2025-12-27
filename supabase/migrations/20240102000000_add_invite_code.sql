alter table public.trips 
add column invite_code text default substr(md5(random()::text), 0, 7) unique;

create index trips_invite_code_idx on public.trips(invite_code);

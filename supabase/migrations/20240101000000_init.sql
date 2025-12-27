-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique_invite_code text unique
);

-- Trips table
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  currency text default 'INR' not null,
  leader_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  starts_at date,
  ends_at date
);

-- Trip Members
create type public.trip_role as enum ('leader', 'member');
create type public.trip_status as enum ('invited', 'pending', 'accepted', 'declined');

create table public.trip_members (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  role public.trip_role default 'member'::public.trip_role not null,
  status public.trip_status default 'invited'::public.trip_status not null,
  joined_at timestamp with time zone,
  invited_by uuid references public.profiles(id),
  unique(trip_id, user_id)
);

-- Expenses
create type public.split_type as enum ('equal_all', 'equal_selected', 'custom');

create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  payer_id uuid references public.profiles(id) not null,
  amount numeric(10, 2) not null check (amount > 0),
  currency text default 'INR' not null,
  description text not null,
  date date default CURRENT_DATE not null,
  receipt_url text,
  split_type public.split_type default 'equal_all'::public.split_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expense Splits
create table public.expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  share_amount numeric(10, 2) not null,
  is_payer boolean default false not null
);

-- Settlements
create table public.settlements (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  from_user_id uuid references public.profiles(id) not null,
  to_user_id uuid references public.profiles(id) not null,
  amount numeric(10, 2) not null check (amount > 0),
  date date default CURRENT_DATE not null,
  method text, -- e.g. 'cash', 'venmo'
  status text default 'completed',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.trips enable row level security;
create policy "Members can view trips" on public.trips for select using (
  exists (
    select 1 from public.trip_members
    where trip_members.trip_id = trips.id
    and trip_members.user_id = auth.uid()
  )
);
create policy "Leaders can delete trips" on public.trips for delete using (
  auth.uid() = leader_id
);
create policy "Authenticad users can create trips" on public.trips for insert with check (
  auth.uid() = leader_id
);

alter table public.trip_members enable row level security;
create policy "Members can view members" on public.trip_members for select using (
  exists (
    select 1 from public.trip_members tm
    where tm.trip_id = trip_members.trip_id
    and tm.user_id = auth.uid()
  )
);

alter table public.expenses enable row level security;
create policy "Members can view expenses" on public.expenses for select using (
  exists (
    select 1 from public.trip_members
    where trip_members.trip_id = expenses.trip_id
    and trip_members.user_id = auth.uid()
  )
);

alter table public.expense_splits enable row level security;
create policy "Members can view splits" on public.expense_splits for select using (
  exists (
    select 1 from public.expenses
    join public.trip_members on trip_members.trip_id = expenses.trip_id
    where expenses.id = expense_splits.expense_id
    and trip_members.user_id = auth.uid()
  )
);

alter table public.settlements enable row level security;
create policy "Members can view settlements" on public.settlements for select using (
  exists (
    select 1 from public.trip_members
    where trip_members.trip_id = settlements.trip_id
    and trip_members.user_id = auth.uid()
  )
);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

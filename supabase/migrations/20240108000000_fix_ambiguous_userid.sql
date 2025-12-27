create or replace function public.get_net_balances(p_trip_id uuid)
returns table (
  user_id uuid,
  total_paid numeric,
  total_share numeric,
  net_balance numeric
)
language plpgsql
security definer
as $$
begin
  return query
  with payer_stats as (
    select e.payer_id as uid, sum(e.amount) as paid
    from public.expenses e
    where e.trip_id = p_trip_id
    group by e.payer_id
  ),
  share_stats as (
    select es.user_id as uid, sum(es.share_amount) as share
    from public.expense_splits es
    join public.expenses e on e.id = es.expense_id
    where e.trip_id = p_trip_id
    group by es.user_id
  ),
  settlement_stats_paid as (
      select s.from_user_id as uid, sum(s.amount) as paid
      from public.settlements s
      where s.trip_id = p_trip_id
      group by s.from_user_id
  ),
  settlement_stats_received as (
      select s.to_user_id as uid, sum(s.amount) as received
      from public.settlements s
      where s.trip_id = p_trip_id
      group by s.to_user_id
  ),
  members as (
    select tm.user_id as uid from public.trip_members tm where tm.trip_id = p_trip_id
  )
  select
    m.uid as user_id,
    coalesce(p.paid, 0) + coalesce(sp.paid, 0) as total_paid,
    coalesce(s.share, 0) + coalesce(sr.received, 0) as total_share,
    (coalesce(p.paid, 0) + coalesce(sp.paid, 0)) - (coalesce(s.share, 0) + coalesce(sr.received, 0)) as net_balance
  from members m
  left join payer_stats p on m.uid = p.uid
  left join share_stats s on m.uid = s.uid
  left join settlement_stats_paid sp on m.uid = sp.uid
  left join settlement_stats_received sr on m.uid = sr.uid;
end;
$$;

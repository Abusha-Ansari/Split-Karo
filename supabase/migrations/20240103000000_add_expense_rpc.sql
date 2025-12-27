create or replace function public.add_expense(
  p_trip_id uuid,
  p_payer_id uuid,
  p_amount numeric,
  p_currency text,
  p_description text,
  p_split_type public.split_type,
  p_splits jsonb, -- Array of {user_id, share_amount}
  p_receipt_url text default null,
  p_date date default CURRENT_DATE
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_expense_id uuid;
  v_split jsonb;
begin
  -- Insert expense
  insert into public.expenses (
    trip_id,
    created_by,
    payer_id,
    amount,
    currency,
    description,
    split_type,
    receipt_url,
    date
  ) values (
    p_trip_id,
    auth.uid(),
    p_payer_id,
    p_amount,
    p_currency,
    p_description,
    p_split_type,
    p_receipt_url,
    p_date
  )
  returning id into v_expense_id;

  -- Insert splits
  if p_splits is not null then
    for v_split in select * from jsonb_array_elements(p_splits)
    loop
      insert into public.expense_splits (
        expense_id,
        user_id,
        share_amount,
        is_payer
      ) values (
        v_expense_id,
        (v_split->>'user_id')::uuid,
        (v_split->>'share_amount')::numeric,
        (v_split->>'user_id')::uuid = p_payer_id -- boolean helper, logic might vary depending on input
      );
    end loop;
  end if;

  return v_expense_id;
end;
$$;

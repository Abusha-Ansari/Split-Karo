-- Update handle_new_user to capture display_name from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, avatar_url, display_name)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.email, 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$ language plpgsql security definer;

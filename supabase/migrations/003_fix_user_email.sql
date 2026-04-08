-- Fix the handle_new_user function to not insert email column
-- Run this in Supabase SQL Editor if you already ran the initial migration

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Add email column to users table if it doesn't exist (optional, for convenience)
alter table public.users add column if not exists email text;

-- Update the function to also store email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

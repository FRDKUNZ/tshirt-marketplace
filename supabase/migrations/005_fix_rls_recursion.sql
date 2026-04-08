-- Fix: infinite recursion in RLS policies for users table
-- The "Admins can view all users" policy queries public.users to check role,
-- which triggers the same RLS policy again → infinite recursion.
--
-- Solution: Use a SECURITY DEFINER function that bypasses RLS to check admin status.

-- Step 1: Create a function that checks if current user is admin (bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  )
$$;

-- Step 2: Drop the problematic recursive policy
drop policy if exists "Admins can view all users" on public.users;

-- Step 3: Recreate using the security definer function (no recursion)
create policy "Admins can view all users"
  on public.users for select
  using (public.is_admin());

-- Also fix the same pattern in other tables if present
drop policy if exists "Admins can view all designs" on public.designs;
create policy "Admins can view all designs"
  on public.designs for select
  using (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments"
  on public.payments for select
  using (public.is_admin());

drop policy if exists "Admins can update payments" on public.payments;
create policy "Admins can update payments"
  on public.payments for update
  using (public.is_admin());

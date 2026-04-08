-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  address text,
  city text,
  province text,
  postal_code text,
  country text default 'Indonesia',
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Designs table
create table public.designs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  tshirt_color text default '#ffffff',
  front_design jsonb, -- stores position, scale, rotation of uploaded images
  back_design jsonb,
  preview_url text, -- URL to the saved canvas preview
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  status text default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(10, 2) not null,
  shipping_cost numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_province text not null,
  shipping_postal_code text not null,
  shipping_country text default 'Indonesia',
  recipient_name text not null,
  recipient_phone text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  design_id uuid references public.designs(id) on delete set null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null,
  tshirt_color text not null,
  size text not null check (size in ('S', 'M', 'L', 'XL', 'XXL')),
  front_design_url text,
  back_design_url text,
  preview_url text
);

-- Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  midtrans_order_id text unique not null,
  midtrans_transaction_id text,
  payment_type text,
  payment_status text default 'pending' check (payment_status in ('pending', 'settlement', 'capture', 'cancel', 'expire', 'failure')),
  gross_amount numeric(10, 2) not null,
  midtrans_response jsonb,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.designs enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Users policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Designs policies
create policy "Users can view own designs"
  on public.designs for select
  using (auth.uid() = user_id);

create policy "Users can create designs"
  on public.designs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own designs"
  on public.designs for update
  using (auth.uid() = user_id);

create policy "Users can delete own designs"
  on public.designs for delete
  using (auth.uid() = user_id);

create policy "Admins can view all designs"
  on public.designs for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Orders policies
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Order items policies
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can create order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Payments policies
create policy "Users can view own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can create payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can view all payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update payments"
  on public.payments for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user creation
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

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger set_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_designs
  before update on public.designs
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_orders
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_payments
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

-- Create storage buckets (run this in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('designs', 'designs', false);
-- insert into storage.buckets (id, name, public) values ('previews', 'previews', true);

-- RPC function to update order status (bypasses RLS for admin)
create or replace function public.update_order_status(
  order_id uuid,
  new_status text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.orders
  set status = new_status, updated_at = now()
  where id = order_id;
end;
$$;

-- Custom print uploads table
-- Stores images that users want to print on t-shirts, separate from order flow
create table public.custom_print_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  file_name text not null,
  file_url text not null,
  file_size integer, -- in bytes
  file_type text, -- e.g., 'image/png', 'image/jpeg'
  description text, -- optional description from user
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text, -- optional notes from admin
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.custom_print_uploads enable row level security;

-- Users can view their own uploads
create policy "Users can view own print uploads"
  on public.custom_print_uploads for select
  using (auth.uid() = user_id);

-- Users can create print uploads
create policy "Users can create print uploads"
  on public.custom_print_uploads for insert
  with check (auth.uid() = user_id);

-- Users can update their own print uploads (e.g., add description)
create policy "Users can update own print uploads"
  on public.custom_print_uploads for update
  using (auth.uid() = user_id);

-- Users can delete their own print uploads
create policy "Users can delete own print uploads"
  on public.custom_print_uploads for delete
  using (auth.uid() = user_id);

-- Admins can view all print uploads
create policy "Admins can view all print uploads"
  on public.custom_print_uploads for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all print uploads (status, notes)
create policy "Admins can update all print uploads"
  on public.custom_print_uploads for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete all print uploads
create policy "Admins can delete all print uploads"
  on public.custom_print_uploads for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create storage bucket for custom print uploads (public for admin access)
insert into storage.buckets (id, name, public)
values ('custom-prints', 'custom-prints', true)
on conflict (id) do nothing;

-- Storage policies for custom-prints bucket
create policy "Users can upload custom print images"
  on storage.objects for insert
  with check (
    bucket_id = 'custom-prints'
    and auth.uid() is not null
  );

create policy "Users can view own custom print images"
  on storage.objects for select
  using (
    bucket_id = 'custom-prints'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own custom print images"
  on storage.objects for delete
  using (
    bucket_id = 'custom-prints'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all custom print images
create policy "Admins can view all custom print images"
  on storage.objects for select
  using (
    bucket_id = 'custom-prints'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete all custom print images
create policy "Admins can delete all custom print images"
  on storage.objects for delete
  using (
    bucket_id = 'custom-prints'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trigger for updated_at
create trigger set_updated_at_custom_print_uploads
  before update on public.custom_print_uploads
  for each row execute procedure public.handle_updated_at();

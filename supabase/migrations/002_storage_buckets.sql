-- Create storage buckets for design images and previews
insert into storage.buckets (id, name, public)
values
  ('designs', 'designs', false),
  ('previews', 'previews', true)
on conflict (id) do nothing;

-- Storage policies for designs bucket (private)
create policy "Users can upload design images"
  on storage.objects for insert
  with check (
    bucket_id = 'designs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own design images"
  on storage.objects for select
  using (
    bucket_id = 'designs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own design images"
  on storage.objects for delete
  using (
    bucket_id = 'designs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for previews bucket (public)
create policy "Anyone can view previews"
  on storage.objects for select
  using (bucket_id = 'previews');

create policy "Users can upload previews"
  on storage.objects for insert
  with check (
    bucket_id = 'previews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own previews"
  on storage.objects for delete
  using (
    bucket_id = 'previews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

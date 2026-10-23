-- Run after 01 and 02: extra storage buckets used by uploads.
insert into storage.buckets (id, name, public) values
  ('content-images', 'content-images', true),   -- place/explore/memory/complaint images
  ('student-cards', 'student-cards', false)     -- private, reviewed by admins only
on conflict (id) do nothing;

create index if not exists notifications_user_idx on notifications (user_id, is_read, created_at desc);
create index if not exists memories_city_idx on memories (city_id, created_at desc);

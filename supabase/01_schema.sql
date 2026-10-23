-- Hubs: multi-city schema (Supabase / Postgres)
-- Run in Supabase SQL Editor. Access goes through the Next.js server with the service-role key.
create extension if not exists pgcrypto;

create table cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  status text not null default 'coming_soon' check (status in ('active','coming_soon','hidden')),
  center_lat double precision,
  center_lng double precision,
  cover_image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- categories are global (admin can add new types without code changes)
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  icon text,
  visit_points int not null default 100,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  password_hash text not null,
  user_type text not null default 'tourist' check (user_type in ('student','tourist','expat','local')),
  role text not null default 'user' check (role in ('user','merchant','admin','owner')),
  permissions text[] not null default '{}',          -- for role='admin': merchants, content, points, complaints, reports
  points_balance int not null default 0 check (points_balance >= 0),   -- one balance for ALL cities
  photo_consent boolean not null default false,
  student_card_url text,
  student_status text not null default 'none' check (student_status in ('none','pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create unique index users_email_idx on users (lower(email));

create table merchants (
  user_id uuid primary key references users(id) on delete cascade,
  business_name text not null,
  phone text,
  city_id uuid references cities(id),
  commercial_reg_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reject_reason text,
  commission_rate numeric(5,2) not null default 10,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  category_id uuid not null references categories(id),
  merchant_id uuid references users(id),            -- a merchant can own places in several cities
  name_ar text not null,
  name_en text,
  description text,
  price_tier char(1) check (price_tier in ('A','B','C')),
  address text,
  lat double precision,
  lng double precision,
  radius_m int not null default 150,
  phone text,
  working_hours text,
  images text[] not null default '{}',
  status text not null default 'active' check (status in ('pending','active','hidden')),
  visit_count int not null default 0,
  created_at timestamptz not null default now()
);
create index places_city_cat_idx on places (city_id, category_id);

create table hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  name text not null,
  price_egp numeric(10,2),
  details text,
  images text[] not null default '{}'
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  title text not null,
  description text,
  discount_pct int,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true
);

create table explore_items (          -- "اكتشف + اسم المدينة"
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  slug text not null,
  title_ar text not null,
  summary text,
  history text,
  significance text,
  story text,
  images text[] not null default '{}',
  sort_order int not null default 0,
  is_published boolean not null default true,
  unique (city_id, slug)
);

create table transport_lines (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  name text not null,
  vehicle text,
  stops text[] not null,              -- ordered; the line also runs in reverse (راجع)
  notes text
);

create table day_plans (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  title text not null,
  theme text not null default 'general' check (theme in ('historical','food','family','general')),
  duration_hours int not null check (duration_hours in (4,8,24)),
  tier char(1) check (tier in ('A','B','C')),
  bonus_points int not null default 200,
  is_published boolean not null default true
);
create table day_plan_stops (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references day_plans(id) on delete cascade,
  place_id uuid not null references places(id),
  position int not null,
  visit_minutes int not null default 45
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  kind text not null check (kind in ('verified','simple')),   -- verified = photo+GPS, simple = "أنا زرت المكان"
  photo_url text,
  lat double precision,
  lng double precision,
  distance_m int,
  points_awarded int not null default 0,
  created_at timestamptz not null default now()
);
create index visits_user_place_idx on visits (user_id, place_id, created_at desc);

create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid not null references users(id) on delete cascade,
  kind text not null check (kind in ('points','loyalty')),
  percent int not null,
  place_id uuid references places(id),          -- loyalty codes are tied to the shop
  points_spent int not null default 0,
  status text not null default 'active' check (status in ('active','used','expired')),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_merchant uuid references users(id),
  used_place_id uuid references places(id),
  platform_fee_egp numeric(10,2),               -- fixed fee charged to the merchant on use
  created_at timestamptz not null default now()
);

create table points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  delta int not null,
  reason text not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);

create table memories (                -- "ارفع ذكرياتك"
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  city_id uuid references cities(id),
  place_id uuid references places(id),
  caption text,
  photo_url text not null,
  status text not null default 'published' check (status in ('published','removed')),
  created_at timestamptz not null default now()
);
create table memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  kind text not null check (kind in ('app','place','suggestion')),
  body text not null,
  image_url text,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  admin_reply text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value text not null,
  description text
);

-- Atomic points change. The CHECK (points_balance >= 0) makes overspending fail.
create or replace function add_points(p_user uuid, p_delta int, p_reason text, p_ref uuid default null)
returns int language plpgsql as $$
declare new_balance int;
begin
  update users set points_balance = points_balance + p_delta
   where id = p_user returning points_balance into new_balance;
  if new_balance is null then raise exception 'user_not_found'; end if;
  insert into points_ledger (user_id, delta, reason, ref_id) values (p_user, p_delta, p_reason, p_ref);
  return new_balance;
end $$;

create or replace function bump_place_visit(p_place uuid) returns void language sql as $$
  update places set visit_count = visit_count + 1 where id = p_place;
$$;

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('visit-photos', 'visit-photos', true),
  ('merchant-docs', 'merchant-docs', false)
on conflict (id) do nothing;

-- All tables are reached only through the server with the service-role key.
-- Enabling RLS with no policies blocks direct access from the public anon key.
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

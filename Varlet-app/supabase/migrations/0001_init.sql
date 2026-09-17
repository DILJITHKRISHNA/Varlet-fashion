-- Varlet MVP schema
-- Local fashion discovery: consumers find products/outfits from nearby shops;
-- shops manage their own catalogue/orders; a platform admin oversees everything.

create extension if not exists postgis;
create extension if not exists pg_trgm;

create type user_role as enum ('consumer', 'manager', 'staff', 'admin', 'super_admin');
create type notification_type as enum ('collection', 'promotion', 'shop_update', 'recommendation', 'system');
create type banner_type as enum ('homepage', 'promotional', 'seasonal', 'campaign');
create type order_status as enum ('pending', 'confirmed', 'ready', 'completed', 'cancelled');
create type product_gender as enum ('men', 'women', 'unisex');

-- ─── Categories ──────────────────────────────────────────────────────────

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default '',
  color text not null default '#000000',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Shops ───────────────────────────────────────────────────────────────

create table shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_url text,
  cover_image_url text,
  category text,
  location_text text not null,
  location geography(point, 4326) not null,
  rating numeric(2, 1) not null default 0,
  review_count int not null default 0,
  follower_count int not null default 0,
  is_verified boolean not null default false,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create index shops_location_idx on shops using gist (location);

-- ─── Profiles (1:1 with auth.users) ─────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text,
  mobile text,
  avatar_url text,
  gender text,
  age_group text,
  fashion_preferences text[] not null default '{}',
  location_text text,
  role user_role not null default 'consumer',
  shop_id uuid references shops (id) on delete set null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index profiles_shop_id_idx on profiles (shop_id);

-- NOTE: 'admin' in user_role means "shop owner" (a ShopRole, see is_shop_staff).
-- Only 'super_admin' is the platform-wide administrator, so is_admin() here
-- must check that role exclusively.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function my_shop_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select shop_id from profiles where id = auth.uid();
$$;

create or replace function is_shop_staff(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and shop_id = target_shop_id
      and role in ('staff', 'manager', 'admin')
  );
$$;

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, mobile, fashion_preferences, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'mobile', new.phone),
    coalesce(
      (select array_agg(x) from jsonb_array_elements_text(new.raw_user_meta_data -> 'fashion_preferences') x),
      '{}'
    ),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'consumer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Products ────────────────────────────────────────────────────────────

create table products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id) on delete cascade,
  name text not null,
  brand text,
  category text,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  images text[] not null default '{}',
  description text not null default '',
  sizes text[] not null default '{}',
  colors jsonb not null default '[]',
  in_stock boolean not null default true,
  rating numeric(2, 1) not null default 0,
  review_count int not null default 0,
  tags text[] not null default '{}',
  occasion text,
  fit text,
  gender product_gender not null default 'unisex',
  is_trending boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_shop_id_idx on products (shop_id);
create index products_category_idx on products (category);
create index products_tags_idx on products using gin (tags);

-- ─── Outfits ─────────────────────────────────────────────────────────────

create table outfits (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops (id) on delete set null,
  title text not null,
  image_url text,
  style text,
  tags text[] not null default '{}',
  product_ids uuid[] not null default '{}',
  saved_count int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Banners ─────────────────────────────────────────────────────────────

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  type banner_type not null default 'homepage',
  cta_text text,
  cta_route text,
  background_color text default '#000000',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Notifications ───────────────────────────────────────────────────────

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  body text not null,
  type notification_type not null default 'system',
  is_read boolean not null default false,
  image_url text,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications (user_id);

-- ─── Wishlists ───────────────────────────────────────────────────────────

create table wishlists (
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ─── Shop follows ────────────────────────────────────────────────────────

create table shop_follows (
  user_id uuid not null references profiles (id) on delete cascade,
  shop_id uuid not null references shops (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

create or replace function sync_shop_follower_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update shops set follower_count = follower_count + 1 where id = new.shop_id;
  elsif tg_op = 'DELETE' then
    update shops set follower_count = greatest(follower_count - 1, 0) where id = old.shop_id;
  end if;
  return null;
end;
$$;

create trigger shop_follows_count
  after insert or delete on shop_follows
  for each row execute function sync_shop_follower_count();

-- ─── Orders ──────────────────────────────────────────────────────────────

create table orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  status order_status not null default 'pending',
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  size text,
  color text,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null
);

create index orders_shop_id_idx on orders (shop_id);
create index orders_user_id_idx on orders (user_id);
create index order_items_order_id_idx on order_items (order_id);

-- ─── Nearby shops RPC ────────────────────────────────────────────────────

create or replace function nearby_shops(lat double precision, lng double precision, radius_km double precision default 10)
returns table (
  id uuid,
  name text,
  description text,
  logo_url text,
  cover_image_url text,
  category text,
  location_text text,
  rating numeric,
  review_count int,
  follower_count int,
  is_verified boolean,
  is_open boolean,
  distance_km double precision
)
language sql
stable
as $$
  select
    s.id, s.name, s.description, s.logo_url, s.cover_image_url, s.category,
    s.location_text, s.rating, s.review_count, s.follower_count, s.is_verified, s.is_open,
    st_distance(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) / 1000 as distance_km
  from shops s
  where st_dwithin(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_km * 1000)
  order by distance_km asc;
$$;

-- ─── Row Level Security ──────────────────────────────────────────────────

alter table categories enable row level security;
alter table shops enable row level security;
alter table profiles enable row level security;
alter table products enable row level security;
alter table outfits enable row level security;
alter table banners enable row level security;
alter table notifications enable row level security;
alter table wishlists enable row level security;
alter table shop_follows enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Categories: public read, super_admin write
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());

-- Shops: public read, shop staff/admin write
create policy "shops_public_read" on shops for select using (true);
create policy "shops_staff_update" on shops for update using (is_shop_staff(id) or is_admin());
create policy "shops_admin_insert" on shops for insert with check (is_admin());
create policy "shops_admin_delete" on shops for delete using (is_admin());

-- Profiles: read/update own, admins read/update all
create policy "profiles_self_read" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles_self_update" on profiles for update using (auth.uid() = id or is_admin());

-- Products: public read, shop staff write for their own shop
create policy "products_public_read" on products for select using (true);
create policy "products_staff_write" on products for all
  using (is_shop_staff(shop_id) or is_admin())
  with check (is_shop_staff(shop_id) or is_admin());

-- Outfits: public read, shop staff/admin write
create policy "outfits_public_read" on outfits for select using (true);
create policy "outfits_staff_write" on outfits for all
  using (shop_id is null or is_shop_staff(shop_id) or is_admin())
  with check (shop_id is null or is_shop_staff(shop_id) or is_admin());

-- Banners: public read active, admin write
create policy "banners_public_read" on banners for select using (is_active or is_admin());
create policy "banners_admin_write" on banners for all using (is_admin()) with check (is_admin());

-- Notifications: own rows only
create policy "notifications_own_read" on notifications for select using (auth.uid() = user_id);
create policy "notifications_own_update" on notifications for update using (auth.uid() = user_id);

-- Wishlists: own rows only
create policy "wishlists_own_all" on wishlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shop follows: own rows only
create policy "shop_follows_own_all" on shop_follows for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders: consumer sees/creates own, shop staff sees/updates their shop's
create policy "orders_consumer_read" on orders for select using (auth.uid() = user_id or is_shop_staff(shop_id) or is_admin());
create policy "orders_consumer_insert" on orders for insert with check (auth.uid() = user_id);
create policy "orders_staff_update" on orders for update using (is_shop_staff(shop_id) or is_admin());

-- Order items: follow parent order's visibility
create policy "order_items_read" on order_items for select using (
  exists (
    select 1 from orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or is_shop_staff(o.shop_id) or is_admin())
  )
);
create policy "order_items_insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);

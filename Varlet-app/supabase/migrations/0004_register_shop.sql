-- Self-service store registration. There was no backend path for "Register
-- Store" at all: the direct `shops` INSERT policy is intentionally
-- super_admin-only (shops_admin_insert), so a newly signed-up shop owner
-- could not create their own shop row. This RPC is the supported way in:
-- it runs as the definer, but still scopes everything to auth.uid() and
-- grants execute only to `authenticated`, so a caller can only ever create
-- and attach themselves to a brand-new shop — never touch another shop or
-- another user's profile.

create or replace function register_shop(
  shop_name text,
  shop_description text,
  shop_category text,
  shop_location_text text,
  shop_lat double precision,
  shop_lng double precision
)
returns shops
language plpgsql
security definer
set search_path = public
as $$
declare
  new_shop shops;
  caller_shop_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to register a store';
  end if;

  select shop_id into caller_shop_id from profiles where id = auth.uid();
  if caller_shop_id is not null then
    raise exception 'This account is already linked to a store';
  end if;

  if coalesce(trim(shop_name), '') = '' then
    raise exception 'Store name is required';
  end if;

  insert into shops (name, description, category, location_text, location, is_open)
  values (
    trim(shop_name),
    coalesce(shop_description, ''),
    nullif(trim(shop_category), ''),
    coalesce(nullif(trim(shop_location_text), ''), 'Location not set'),
    st_setsrid(st_makepoint(shop_lng, shop_lat), 4326)::geography,
    true
  )
  returning * into new_shop;

  update profiles set role = 'admin', shop_id = new_shop.id where id = auth.uid();

  return new_shop;
end;
$$;

grant execute on function register_shop(text, text, text, text, double precision, double precision) to authenticated;

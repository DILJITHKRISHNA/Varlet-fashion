-- nearby_shops originally omitted each shop's product count (search screen
-- showed "0 products" for every nearby result). Add it via a lateral count.
-- Return shape changed, so the old signature must be dropped first.

drop function if exists nearby_shops(double precision, double precision, double precision);

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
  product_count bigint,
  distance_km double precision
)
language sql
stable
as $$
  select
    s.id, s.name, s.description, s.logo_url, s.cover_image_url, s.category,
    s.location_text, s.rating, s.review_count, s.follower_count, s.is_verified, s.is_open,
    (select count(*) from products p where p.shop_id = s.id) as product_count,
    st_distance(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) / 1000 as distance_km
  from shops s
  where st_dwithin(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_km * 1000)
  order by distance_km asc;
$$;

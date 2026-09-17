-- Local dev seed data, mirrors src/services/mockData.ts so the app renders
-- real content immediately. Auth users are seeded separately (scripts/seed-users.mjs)
-- because Supabase auth needs the admin API, not raw SQL, to hash passwords correctly.

insert into categories (name, icon, color, sort_order) values
  ('Men''s Wear', '👔', '#3B82F6', 1),
  ('Women''s Wear', '👗', '#EC4899', 2),
  ('Streetwear', '🧢', '#FF6B35', 3),
  ('Ethnic Wear', '🥻', '#8B5CF6', 4),
  ('Accessories', '👜', '#10B981', 5),
  ('Footwear', '👟', '#F59E0B', 6),
  ('Formal Wear', '🤵', '#374151', 7),
  ('Party Wear', '✨', '#EF4444', 8);

insert into shops (id, name, description, logo_url, cover_image_url, category, location_text, location, rating, review_count, follower_count, is_verified, is_open) values
  ('00000000-0000-0000-0000-000000000001', 'Urban Thread Co.', 'Premium streetwear & casual fashion for the modern youth.',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    'Streetwear', 'MG Road, Bengaluru', st_setsrid(st_makepoint(77.6070, 12.9757), 4326)::geography,
    4.8, 342, 1240, true, true),
  ('00000000-0000-0000-0000-000000000002', 'Ethnic Bazaar', 'Your one-stop destination for traditional and fusion ethnic wear.',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=800',
    'Ethnic Wear', 'Commercial Street, Bengaluru', st_setsrid(st_makepoint(77.6086, 12.9822), 4326)::geography,
    4.6, 198, 876, true, true),
  ('00000000-0000-0000-0000-000000000003', 'Sole Republic', 'Sneakers, boots, loafers — every step, a statement.',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    'Footwear', 'Koramangala, Bengaluru', st_setsrid(st_makepoint(77.6245, 12.9352), 4326)::geography,
    4.7, 289, 2100, true, false),
  ('00000000-0000-0000-0000-000000000004', 'Chic Collective', 'Contemporary womens fashion with a Parisian twist.',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    'Women''s Wear', 'Indiranagar, Bengaluru', st_setsrid(st_makepoint(77.6412, 12.9719), 4326)::geography,
    4.9, 512, 3450, true, true);

insert into products (id, shop_id, name, brand, category, price, original_price, images, description, sizes, colors, in_stock, rating, review_count, tags, occasion, fit, gender, is_trending, is_new) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Oversized Graphic Tee', 'Urban Thread Co.', 'Streetwear',
    799, 1299,
    array['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600'],
    'The perfect oversized tee for every casual occasion. Made from 100% organic cotton with a relaxed fit.',
    array['XS','S','M','L','XL','XXL'],
    '[{"name":"Black","hex":"#1F2937"},{"name":"White","hex":"#F9FAFB"},{"name":"Slate","hex":"#64748B"}]',
    true, 4.6, 124, array['oversized','graphic','casual','streetwear'], 'Casual', 'Oversized', 'unisex', true, false),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Cargo Joggers', 'Urban Thread Co.', 'Streetwear',
    1499, 2199,
    array['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', 'https://images.unsplash.com/photo-1594938298603-c8148e4b2a3f?w=600'],
    'Multi-pocket cargo joggers with tapered fit. Perfect blend of utility and style.',
    array['S','M','L','XL'],
    '[{"name":"Olive","hex":"#4D7C0F"},{"name":"Khaki","hex":"#A16207"},{"name":"Black","hex":"#1F2937"}]',
    true, 4.8, 89, array['cargo','joggers','utility','streetwear'], 'Casual', 'Tapered', 'men', true, true),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002', 'Floral Anarkali Kurta', 'Ethnic Bazaar', 'Ethnic Wear',
    2199, 3499,
    array['https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600'],
    'Elegant floral print Anarkali kurta with thread embroidery. Perfect for festive occasions.',
    array['XS','S','M','L','XL'],
    '[{"name":"Rose","hex":"#F43F5E"},{"name":"Teal","hex":"#0D9488"}]',
    true, 4.7, 67, array['ethnic','kurta','festive','floral'], 'Festive', 'Regular', 'women', false, true),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000003', 'Air Cushion Sneakers', 'Sole Republic', 'Footwear',
    3499, 4999,
    array['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600'],
    'Next-gen air cushion sneakers with responsive foam midsole. All-day comfort guaranteed.',
    array['6','7','8','9','10','11'],
    '[{"name":"White/Red","hex":"#FFFFFF"},{"name":"Black/Gold","hex":"#1F2937"}]',
    true, 4.9, 234, array['sneakers','air','comfort','sports'], 'Casual', 'Regular', 'unisex', true, false),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000004', 'Linen Blazer', 'Chic Collective', 'Women''s Wear',
    4299, 5999,
    array['https://images.unsplash.com/photo-1594938298603-c8148e4b2a3f?w=600'],
    'Breathable linen blazer perfect for work-to-weekend transition. Slim-fit silhouette.',
    array['XS','S','M','L'],
    '[{"name":"Ivory","hex":"#FFFBEB"},{"name":"Navy","hex":"#1E3A5F"},{"name":"Blush","hex":"#FBCFE8"}]',
    true, 4.8, 156, array['blazer','linen','formal','work'], 'Formal', 'Slim', 'women', false, true),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 'Korean Puffer Jacket', 'Urban Thread Co.', 'Streetwear',
    2799, 3999,
    array['https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=600'],
    'Trendy Korean-style cropped puffer jacket. Lightweight insulation for cool weather.',
    array['S','M','L','XL'],
    '[{"name":"Mint","hex":"#6EE7B7"},{"name":"Lavender","hex":"#C4B5FD"},{"name":"Black","hex":"#1F2937"}]',
    true, 4.5, 92, array['korean','puffer','jacket','winter'], 'Casual', 'Cropped', 'women', true, true);

insert into outfits (shop_id, title, image_url, style, tags, product_ids, saved_count) values
  ('00000000-0000-0000-0000-000000000001', 'Clean Streetwear Look', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', 'Streetwear', array['casual','minimal','monochrome'], array['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102']::uuid[], 2341),
  ('00000000-0000-0000-0000-000000000002', 'Festive Ethnic Glam', 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600', 'Ethnic', array['festive','traditional','colorful'], array['00000000-0000-0000-0000-000000000103']::uuid[], 1876),
  ('00000000-0000-0000-0000-000000000004', 'Office Chic', 'https://images.unsplash.com/photo-1594938298603-c8148e4b2a3f?w=600', 'Formal', array['work','professional','elegant'], array['00000000-0000-0000-0000-000000000105']::uuid[], 987),
  ('00000000-0000-0000-0000-000000000001', 'Weekend Casual', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', 'Casual', array['weekend','relaxed','comfortable'], array['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000104']::uuid[], 1543),
  ('00000000-0000-0000-0000-000000000001', 'Korean Street Style', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', 'Korean', array['kfashion','trendy','youth'], array['00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000104']::uuid[], 3210),
  ('00000000-0000-0000-0000-000000000004', 'Party Night', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600', 'Party', array['glam','night-out','bold'], array['00000000-0000-0000-0000-000000000105']::uuid[], 2109);

insert into banners (title, subtitle, image_url, type, cta_text, cta_route, background_color, sort_order) values
  ('Summer Fiesta', 'Up to 60% off on summer collection', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200', 'seasonal', 'Shop Now', 'Search', '#FF6B35', 1),
  ('New Arrivals', 'Fresh drops every week', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', 'homepage', 'Explore', 'Feed', '#1F2937', 2),
  ('Korean Wave', 'Discover K-fashion near you', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200', 'campaign', 'Discover', 'Feed', '#8B5CF6', 3);

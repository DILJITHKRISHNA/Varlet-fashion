/**
 * Real data-access layer backed by Supabase, shaped to match the interfaces
 * in mockData.ts so screens need minimal changes when switching over.
 */
import { supabase } from './supabase';
import type {
  Product, Shop, Outfit, Category, Banner, Notification,
} from './mockData';
import type { Database } from './database.types';

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

// ─── Mappers: DB row (snake_case) → app shape (camelCase) ────────────────

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? '',
    category: row.category ?? '',
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    images: row.images ?? [],
    description: row.description ?? '',
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    inStock: row.in_stock,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    shopId: row.shop_id,
    shopName: row.shops?.name ?? row.shop_name ?? '',
    tags: row.tags ?? [],
    occasion: row.occasion ?? '',
    fit: row.fit ?? '',
    gender: row.gender,
    isTrending: row.is_trending,
    isNew: row.is_new,
  };
}

function mapShop(row: any, distanceKm?: number): Shop {
  const productCount = Array.isArray(row.products) ? (row.products[0]?.count ?? 0) : row.product_count ?? 0;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    logo: row.logo_url ?? '',
    coverImage: row.cover_image_url ?? '',
    category: row.category ?? '',
    rating: Number(row.rating),
    reviewCount: row.review_count,
    followerCount: row.follower_count,
    distance: distanceKm != null ? `${distanceKm.toFixed(1)} km` : row.distance_km != null ? `${Number(row.distance_km).toFixed(1)} km` : '—',
    location: row.location_text,
    isVerified: row.is_verified,
    productCount,
    isOpen: row.is_open,
  };
}

function mapOutfit(row: any): Outfit {
  return {
    id: row.id,
    title: row.title,
    image: row.image_url ?? '',
    style: row.style ?? '',
    tags: row.tags ?? [],
    products: row.product_ids ?? [],
    savedCount: row.saved_count,
    shopId: row.shop_id,
  };
}

function mapCategory(row: any, productCount = 0): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    productCount,
    color: row.color,
  };
}

function mapBanner(row: any): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? '',
    image: row.image_url ?? '',
    type: row.type,
    ctaText: row.cta_text ?? '',
    ctaRoute: row.cta_route ?? '',
    backgroundColor: row.background_color ?? '#000000',
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
    imageUrl: row.image_url ?? undefined,
  };
}

// ─── Categories ────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []).map((r) => mapCategory(r));
}

// ─── Shops ─────────────────────────────────────────────────────────────

export async function getShops(): Promise<Shop[]> {
  const { data, error } = await supabase.from('shops').select('*, products(count)').order('name');
  if (error) throw error;
  return (data ?? []).map((r) => mapShop(r));
}

export async function getNearbyShops(lat: number, lng: number, radiusKm = 10): Promise<Shop[]> {
  const { data, error } = await supabase.rpc('nearby_shops', { lat, lng, radius_km: radiusKm });
  if (error) throw error;
  return (data ?? []).map((r: any) => mapShop(r, r.distance_km));
}

export async function getShop(id: string): Promise<Shop | null> {
  const { data, error } = await supabase.from('shops').select('*, products(count)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapShop(data) : null;
}

// ─── Products ──────────────────────────────────────────────────────────

export interface ProductFilters {
  query?: string;
  category?: string;
  shopId?: string;
  gender?: 'men' | 'women' | 'unisex';
  trendingOnly?: boolean;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let q = supabase.from('products').select('*, shops(name)');
  if (filters.query) q = q.or(`name.ilike.%${filters.query}%,category.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`);
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.shopId) q = q.eq('shop_id', filters.shopId);
  if (filters.gender) q = q.eq('gender', filters.gender);
  if (filters.trendingOnly) q = q.eq('is_trending', true);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*, shops(name)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

// ─── Outfits ───────────────────────────────────────────────────────────

export async function getOutfits(): Promise<Outfit[]> {
  const { data, error } = await supabase.from('outfits').select('*').order('saved_count', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOutfit);
}

// ─── Banners ───────────────────────────────────────────────────────────

export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data ?? []).map(mapBanner);
}

// ─── Notifications ─────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

// ─── Wishlist ──────────────────────────────────────────────────────────

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.product_id);
}

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('products(*, shops(name))')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => mapProduct(r.products)).filter(Boolean);
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
  if (error) throw error;
}

// ─── Shop follows ──────────────────────────────────────────────────────

export async function isFollowingShop(userId: string, shopId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('shop_follows')
    .select('shop_id')
    .eq('user_id', userId)
    .eq('shop_id', shopId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function followShop(userId: string, shopId: string): Promise<void> {
  const { error } = await supabase.from('shop_follows').insert({ user_id: userId, shop_id: shopId });
  if (error && error.code !== '23505') throw error;
}

export async function unfollowShop(userId: string, shopId: string): Promise<void> {
  const { error } = await supabase.from('shop_follows').delete().eq('user_id', userId).eq('shop_id', shopId);
  if (error) throw error;
}

export async function getFollowedShops(userId: string): Promise<Shop[]> {
  const { data, error } = await supabase
    .from('shop_follows')
    .select('shops(*, products(count))')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => mapShop(r.shops)).filter(Boolean);
}

// ─── Outfit saves ──────────────────────────────────────────────────────

export async function getSavedOutfitIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('outfit_saves').select('outfit_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.outfit_id);
}

export async function getSavedOutfits(userId: string): Promise<Outfit[]> {
  const { data, error } = await supabase.from('outfit_saves').select('outfits(*)').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => mapOutfit(r.outfits)).filter(Boolean);
}

export async function saveOutfit(userId: string, outfitId: string): Promise<void> {
  const { error } = await supabase.from('outfit_saves').insert({ user_id: userId, outfit_id: outfitId });
  if (error && error.code !== '23505') throw error;
}

export async function unsaveOutfit(userId: string, outfitId: string): Promise<void> {
  const { error } = await supabase.from('outfit_saves').delete().eq('user_id', userId).eq('outfit_id', outfitId);
  if (error) throw error;
}

// ─── Shop management (staff/admin) ────────────────────────────────────

export async function getShopProducts(shopId: string): Promise<Product[]> {
  return getProducts({ shopId });
}

export async function createProduct(input: ProductInsert): Promise<void> {
  const { error } = await supabase.from('products').insert(input);
  if (error) throw error;
}

export async function updateProduct(id: string, patch: ProductUpdate): Promise<void> {
  const { error } = await supabase.from('products').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function getShopOrders(shopId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(name, mobile)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Store registration ────────────────────────────────────────────────

export interface RegisterShopInput {
  name: string;
  description: string;
  category: string;
  locationText: string;
  lat: number;
  lng: number;
}

/** Caller must already have a session (sign up/in first) — see register_shop RPC. */
export async function registerShop(input: RegisterShopInput): Promise<Shop> {
  const { data, error } = await supabase.rpc('register_shop', {
    shop_name: input.name,
    shop_description: input.description,
    shop_category: input.category,
    shop_location_text: input.locationText,
    shop_lat: input.lat,
    shop_lng: input.lng,
  });
  if (error) throw error;
  return mapShop(data);
}

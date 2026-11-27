/**
 * Data-access layer for the Varlet API, shaped to match the interfaces in
 * mockData.ts so screens do not depend on the server's field names.
 * The `userId` arguments are kept for the screens; the server identifies the
 * user from the signed-in session.
 */
import { ApiError, request } from './http';
import type {
  Product, Shop, Outfit, Category, Banner, Notification,
} from './mockData';

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
    shopName: row.shop_name ?? '',
    tags: row.tags ?? [],
    occasion: row.occasion ?? '',
    fit: row.fit ?? '',
    gender: row.gender,
    isTrending: row.is_trending,
    isNew: row.is_new,
  };
}

function mapShop(row: any): Shop {
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
    distance: row.distance_km != null ? `${Number(row.distance_km).toFixed(1)} km` : '—',
    location: row.location_text,
    isVerified: row.is_verified,
    productCount: row.product_count ?? 0,
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
  const rows = await request<any[]>('/categories');
  return rows.map((r) => mapCategory(r, r.product_count));
}

// ─── Shops ─────────────────────────────────────────────────────────────

export async function getShops(): Promise<Shop[]> {
  return (await request<any[]>('/shops')).map((r) => mapShop(r));
}

export async function getNearbyShops(lat: number, lng: number, radiusKm = 10): Promise<Shop[]> {
  const rows = await request<any[]>('/shops/nearby', { query: { lat, lng, radius_km: radiusKm } });
  return rows.map((r) => mapShop(r));
}

/** Turns "not found" into null and passes every other failure on. */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getShop(id: string): Promise<Shop | null> {
  const row = await orNull(request<any>(`/shops/${encodeURIComponent(id)}`));
  return row ? mapShop(row) : null;
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
  const rows = await request<any[]>('/products', {
    query: {
      q: filters.query?.slice(0, 100),
      category: filters.category,
      shop_id: filters.shopId,
      gender: filters.gender,
      trending: filters.trendingOnly || undefined,
      limit: 200,
    },
  });
  return rows.map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const row = await orNull(request<any>(`/products/${encodeURIComponent(id)}`));
  return row ? mapProduct(row) : null;
}

// ─── Outfits ───────────────────────────────────────────────────────────

export async function getOutfits(): Promise<Outfit[]> {
  return (await request<any[]>('/outfits')).map(mapOutfit);
}

// ─── Banners ───────────────────────────────────────────────────────────

export async function getBanners(): Promise<Banner[]> {
  return (await request<any[]>('/banners')).map(mapBanner);
}

// ─── Notifications ─────────────────────────────────────────────────────

export async function getNotifications(_userId: string): Promise<Notification[]> {
  return (await request<any[]>('/me/notifications')).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/me/notifications/${id}/read`, { method: 'PATCH' });
}

// ─── Wishlist ──────────────────────────────────────────────────────────

export async function getWishlistProducts(_userId: string): Promise<Product[]> {
  return (await request<any[]>('/me/wishlist')).map(mapProduct);
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  return (await getWishlistProducts(userId)).map((p) => p.id);
}

export async function addToWishlist(_userId: string, productId: string): Promise<void> {
  await request(`/me/wishlist/${productId}`, { method: 'PUT' });
}

export async function removeFromWishlist(_userId: string, productId: string): Promise<void> {
  await request(`/me/wishlist/${productId}`, { method: 'DELETE' });
}

// ─── Shop follows ──────────────────────────────────────────────────────

export async function getFollowedShops(_userId: string): Promise<Shop[]> {
  return (await request<any[]>('/me/following')).map((r) => mapShop(r));
}

export async function isFollowingShop(userId: string, shopId: string): Promise<boolean> {
  return (await getFollowedShops(userId)).some((s) => s.id === shopId);
}

export async function followShop(_userId: string, shopId: string): Promise<void> {
  await request(`/me/following/${shopId}`, { method: 'PUT' });
}

export async function unfollowShop(_userId: string, shopId: string): Promise<void> {
  await request(`/me/following/${shopId}`, { method: 'DELETE' });
}

// ─── Outfit saves ──────────────────────────────────────────────────────

export async function getSavedOutfits(_userId: string): Promise<Outfit[]> {
  return (await request<any[]>('/me/saved-outfits')).map(mapOutfit);
}

export async function getSavedOutfitIds(userId: string): Promise<string[]> {
  return (await getSavedOutfits(userId)).map((o) => o.id);
}

export async function saveOutfit(_userId: string, outfitId: string): Promise<void> {
  await request(`/me/saved-outfits/${outfitId}`, { method: 'PUT' });
}

export async function unsaveOutfit(_userId: string, outfitId: string): Promise<void> {
  await request(`/me/saved-outfits/${outfitId}`, { method: 'DELETE' });
}

// ─── Shop management (staff/owner) ─────────────────────────────────────

export async function getShopProducts(shopId: string): Promise<Product[]> {
  return getProducts({ shopId });
}

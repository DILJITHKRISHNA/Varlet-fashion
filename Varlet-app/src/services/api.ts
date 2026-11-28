/**
 * Data-access layer for the Varlet API, shaped to match the interfaces in
 * mockData.ts so screens do not depend on the server's field names.
 * The `userId` arguments are kept for the screens; the server identifies the
 * user from the signed-in session.
 */
import { API_URL, ApiError, request } from './http';
import { LocalFile, toFormData } from './upload';
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
    sku: row.sku ?? undefined,
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
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    lat: row.lat,
    lng: row.lng,
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
  brand?: string;
  shopId?: string;
  gender?: 'men' | 'women' | 'unisex';
  minPrice?: number;
  maxPrice?: number;
  trendingOnly?: boolean;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const rows = await request<any[]>('/products', {
    query: {
      q: filters.query?.slice(0, 100),
      category: filters.category,
      brand: filters.brand,
      shop_id: filters.shopId,
      gender: filters.gender,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
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

export async function getShopProducts(shopId: string): Promise<Product[]> {
  return getProducts({ shopId });
}

// ─── Finding things ────────────────────────────────────────────────────

export async function getBrands(): Promise<string[]> {
  return request<string[]>('/products/brands');
}

export interface PriceBand {
  label: string;
  count: number;
  products: Product[];
}

export async function getPriceCollections(): Promise<PriceBand[]> {
  const rows = await request<any[]>('/collections/price');
  return rows.map((r) => ({ label: r.label, count: r.count, products: r.products.map(mapProduct) }));
}

/** Pieces that go with this one. */
export async function getCombinations(productId: string): Promise<Product[]> {
  return (await request<any[]>(`/products/${productId}/combinations`)).map(mapProduct);
}

export interface PhotoMatch {
  exact: boolean;
  product: Product;
}

export interface PhotoSearchResult {
  detected: { name: string; brand?: string; colors: string[] }[];
  results: PhotoMatch[];
}

export async function searchByPhoto(
  file: LocalFile,
  filters: { brand?: string; maxPrice?: number } = {}
): Promise<PhotoSearchResult> {
  const data = await request<any>('/search/image', {
    method: 'POST',
    form: await toFormData(file),
    query: { brand: filters.brand, max_price: filters.maxPrice },
    timeoutMs: 150_000,
  });
  return {
    detected: data.detected.map((d: any) => ({
      name: d.name,
      brand: d.brand ?? undefined,
      colors: d.colors,
    })),
    results: data.results.map((r: any) => ({
      exact: r.match === 'exact',
      product: mapProduct(r.product),
    })),
  };
}

// ─── Offers ────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  shopId: string;
  shopName: string;
  title: string;
  description: string;
  discountPercent?: number;
  startsAt: string;
  endsAt?: string;
  isActive: boolean;
  distance?: string;
}

function mapOffer(row: any): Offer {
  return {
    id: row.id,
    shopId: row.shop_id,
    shopName: row.shop_name,
    title: row.title,
    description: row.description,
    discountPercent: row.discount_percent ?? undefined,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    isActive: row.is_active,
    distance: row.distance_km != null ? `${Number(row.distance_km).toFixed(1)} km` : undefined,
  };
}

/** Offers running now, nearest first when a location is given. */
export async function getOffers(
  options: { shopId?: string; lat?: number; lng?: number } = {}
): Promise<Offer[]> {
  const rows = await request<any[]>('/offers', {
    query: { shop_id: options.shopId, lat: options.lat, lng: options.lng },
  });
  return rows.map(mapOffer);
}

export async function getMyOffers(): Promise<Offer[]> {
  return (await request<any[]>('/shops/mine/offers')).map(mapOffer);
}

export interface OfferInput {
  title: string;
  description: string;
  discountPercent: number | null;
  /** null means no end date; undefined keeps the current one. */
  endsAt?: string | null;
  isActive: boolean;
}

function offerBody(input: Partial<OfferInput>) {
  return {
    title: input.title,
    description: input.description,
    discount_percent: input.discountPercent,
    ends_at: input.endsAt,
    is_active: input.isActive,
  };
}

export async function saveOffer(input: Partial<OfferInput>, id?: string): Promise<void> {
  await request(id ? `/shops/mine/offers/${id}` : '/shops/mine/offers', {
    method: id ? 'PATCH' : 'POST',
    body: offerBody(input),
  });
}

export async function deleteOffer(id: string): Promise<void> {
  await request(`/shops/mine/offers/${id}`, { method: 'DELETE' });
}

// ─── Customer enquiries ────────────────────────────────────────────────

export type EnquiryKind = 'whatsapp' | 'call' | 'directions';

export async function recordEnquiry(
  shopId: string,
  kind: EnquiryKind,
  productId?: string
): Promise<void> {
  await request('/enquiries', {
    method: 'POST',
    body: { shop_id: shopId, kind, product_id: productId ?? null },
  });
}

export type EnquiryCounts = Record<EnquiryKind, number>;

export interface EnquirySummary {
  total: number;
  totals: EnquiryCounts;
  byDay: (EnquiryCounts & { date: string })[];
  topProducts: { productId: string; name: string; count: number }[];
}

export async function getEnquirySummary(days: number): Promise<EnquirySummary> {
  const data = await request<any>('/shops/mine/enquiries/summary', { query: { days } });
  return {
    total: data.total,
    totals: data.totals,
    byDay: data.by_day,
    topProducts: data.top_products.map((p: any) => ({
      productId: p.product_id,
      name: p.name,
      count: p.count,
    })),
  };
}

export interface Enquiry {
  id: string;
  kind: EnquiryKind;
  productName?: string;
  createdAt: string;
}

export async function getRecentEnquiries(limit = 30): Promise<Enquiry[]> {
  const rows = await request<any[]>('/shops/mine/enquiries', { query: { limit } });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    productName: r.product_name ?? undefined,
    createdAt: r.created_at,
  }));
}

// ─── My store (staff/owner) ────────────────────────────────────────────

export async function getMyShop(): Promise<Shop> {
  return mapShop(await request<any>('/shops/mine'));
}

export interface ShopInput {
  name: string;
  description: string;
  category: string | null;
  location_text: string;
  phone: string | null;
  whatsapp: string | null;
  is_open: boolean;
  lat?: number;
  lng?: number;
}

export async function updateMyShop(input: ShopInput): Promise<Shop> {
  return mapShop(await request<any>('/shops/mine', { method: 'PATCH', body: input }));
}

export async function getMyProducts(): Promise<Product[]> {
  return (await request<any[]>('/shops/mine/products')).map(mapProduct);
}

export interface ProductInput {
  name: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  price: number;
  original_price: number | null;
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  images: string[];
  description: string;
  tags: string[];
  gender: 'men' | 'women' | 'unisex';
  in_stock: boolean;
}

export async function saveProduct(input: Partial<ProductInput>, id?: string): Promise<void> {
  await request(id ? `/shops/mine/products/${id}` : '/shops/mine/products', {
    method: id ? 'PATCH' : 'POST',
    body: input,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await request(`/shops/mine/products/${id}`, { method: 'DELETE' });
}

export interface BulkResult {
  totalRows: number;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

/** With `dryRun` the file is only checked; nothing is saved. */
export async function bulkUploadProducts(file: LocalFile, dryRun: boolean): Promise<BulkResult> {
  const data = await request<any>('/shops/mine/products/bulk', {
    method: 'POST',
    form: await toFormData(file),
    query: { dry_run: dryRun },
    timeoutMs: 150_000,
  });
  return {
    totalRows: data.total_rows,
    created: data.created,
    updated: data.updated,
    errors: data.errors,
  };
}

export const PRODUCT_TEMPLATE_URL = `${API_URL}/api/v1/shops/mine/products/bulk-template.csv`;

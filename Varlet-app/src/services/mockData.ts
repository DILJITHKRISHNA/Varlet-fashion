/**
 * Mock Data — Products
 * Replace API_BASE_URL and swap mock functions with real fetch calls when backend is ready.
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  shopId: string;
  shopName: string;
  tags: string[];
  occasion: string;
  fit: string;
  gender: 'men' | 'women' | 'unisex';
  isTrending?: boolean;
  isNew?: boolean;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  category: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  distance: string;
  location: string;
  isVerified: boolean;
  productCount: number;
  isOpen: boolean;
}

export interface Outfit {
  id: string;
  title: string;
  image: string;
  style: string;
  tags: string[];
  products: string[];
  savedCount: number;
  shopId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  color: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'homepage' | 'promotional' | 'seasonal' | 'campaign';
  ctaText: string;
  ctaRoute: string;
  backgroundColor: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'collection' | 'promotion' | 'shop_update' | 'recommendation' | 'system';
  isRead: boolean;
  createdAt: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar?: string;
  gender: string;
  ageGroup: string;
  fashionPreferences: string[];
  location: string;
  role: 'consumer' | 'admin' | 'manager' | 'staff' | 'super_admin';
  isVerified: boolean;
  joinedAt: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

// `icon` is a key into CATEGORY_ICONS (src/constants/categoryIcons.ts), not an emoji.
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: "Men's Wear", icon: 'Shirt', productCount: 342, color: '#3B82F6' },
  { id: 'cat2', name: "Women's Wear", icon: 'Gem', productCount: 581, color: '#EC4899' },
  { id: 'cat3', name: 'Streetwear', icon: 'Backpack', productCount: 218, color: '#FF6B35' },
  { id: 'cat4', name: 'Ethnic Wear', icon: 'Palette', productCount: 195, color: '#8B5CF6' },
  { id: 'cat5', name: 'Accessories', icon: 'Handbag', productCount: 410, color: '#10B981' },
  { id: 'cat6', name: 'Footwear', icon: 'Footprints', productCount: 276, color: '#F59E0B' },
  { id: 'cat7', name: 'Formal Wear', icon: 'Briefcase', productCount: 143, color: '#374151' },
  { id: 'cat8', name: 'Party Wear', icon: 'PartyPopper', productCount: 167, color: '#EF4444' },
];

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'shop1', name: 'Urban Thread Co.', description: 'Premium streetwear & casual fashion for the modern youth.',
    logo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200',
    coverImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    category: 'Streetwear', rating: 4.8, reviewCount: 342, followerCount: 1240,
    distance: '0.8 km', location: 'MG Road, Bengaluru', isVerified: true, productCount: 156, isOpen: true,
  },
  {
    id: 'shop2', name: 'Ethnic Bazaar', description: 'Your one-stop destination for traditional and fusion ethnic wear.',
    logo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    category: 'Ethnic Wear', rating: 4.6, reviewCount: 198, followerCount: 876,
    distance: '1.2 km', location: 'Commercial Street, Bengaluru', isVerified: true, productCount: 243, isOpen: true,
  },
  {
    id: 'shop3', name: 'Sole Republic', description: 'Sneakers, boots, loafers — every step, a statement.',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    coverImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    category: 'Footwear', rating: 4.7, reviewCount: 289, followerCount: 2100,
    distance: '2.1 km', location: 'Koramangala, Bengaluru', isVerified: true, productCount: 89, isOpen: false,
  },
  {
    id: 'shop4', name: 'Chic Collective', description: 'Contemporary womens fashion with a Parisian twist.',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    category: "Women's Wear", rating: 4.9, reviewCount: 512, followerCount: 3450,
    distance: '0.5 km', location: 'Indiranagar, Bengaluru', isVerified: true, productCount: 312, isOpen: true,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1', name: 'Oversized Graphic Tee', brand: 'Urban Thread Co.', category: 'Streetwear',
    price: 799, originalPrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
    ],
    description: 'The perfect oversized tee for every casual occasion. Made from 100% organic cotton with a relaxed fit.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#1F2937' }, { name: 'White', hex: '#F9FAFB' }, { name: 'Slate', hex: '#64748B' }],
    inStock: true, rating: 4.6, reviewCount: 124, shopId: 'shop1', shopName: 'Urban Thread Co.',
    tags: ['oversized', 'graphic', 'casual', 'streetwear'], occasion: 'Casual', fit: 'Oversized', gender: 'unisex',
    isTrending: true, isNew: false,
  },
  {
    id: 'prod2', name: 'Cargo Joggers', brand: 'Urban Thread Co.', category: 'Streetwear',
    price: 1499, originalPrice: 2199,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    ],
    description: 'Multi-pocket cargo joggers with tapered fit. Perfect blend of utility and style.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Olive', hex: '#4D7C0F' }, { name: 'Khaki', hex: '#A16207' }, { name: 'Black', hex: '#1F2937' }],
    inStock: true, rating: 4.8, reviewCount: 89, shopId: 'shop1', shopName: 'Urban Thread Co.',
    tags: ['cargo', 'joggers', 'utility', 'streetwear'], occasion: 'Casual', fit: 'Tapered', gender: 'men',
    isTrending: true, isNew: true,
  },
  {
    id: 'prod3', name: 'Floral Anarkali Kurta', brand: 'Ethnic Bazaar', category: 'Ethnic Wear',
    price: 2199, originalPrice: 3499,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    ],
    description: 'Elegant floral print Anarkali kurta with thread embroidery. Perfect for festive occasions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Rose', hex: '#F43F5E' }, { name: 'Teal', hex: '#0D9488' }],
    inStock: true, rating: 4.7, reviewCount: 67, shopId: 'shop2', shopName: 'Ethnic Bazaar',
    tags: ['ethnic', 'kurta', 'festive', 'floral'], occasion: 'Festive', fit: 'Regular', gender: 'women',
    isTrending: false, isNew: true,
  },
  {
    id: 'prod4', name: 'Air Cushion Sneakers', brand: 'Sole Republic', category: 'Footwear',
    price: 3499, originalPrice: 4999,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    ],
    description: 'Next-gen air cushion sneakers with responsive foam midsole. All-day comfort guaranteed.',
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: [{ name: 'White/Red', hex: '#FFFFFF' }, { name: 'Black/Gold', hex: '#1F2937' }],
    inStock: true, rating: 4.9, reviewCount: 234, shopId: 'shop3', shopName: 'Sole Republic',
    tags: ['sneakers', 'air', 'comfort', 'sports'], occasion: 'Casual', fit: 'Regular', gender: 'unisex',
    isTrending: true, isNew: false,
  },
  {
    id: 'prod5', name: 'Linen Blazer', brand: 'Chic Collective', category: "Women's Wear",
    price: 4299, originalPrice: 5999,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    ],
    description: 'Breathable linen blazer perfect for work-to-weekend transition. Slim-fit silhouette.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Ivory', hex: '#FFFBEB' }, { name: 'Navy', hex: '#1E3A5F' }, { name: 'Blush', hex: '#FBCFE8' }],
    inStock: true, rating: 4.8, reviewCount: 156, shopId: 'shop4', shopName: 'Chic Collective',
    tags: ['blazer', 'linen', 'formal', 'work'], occasion: 'Formal', fit: 'Slim', gender: 'women',
    isTrending: false, isNew: true,
  },
  {
    id: 'prod6', name: 'Korean Puffer Jacket', brand: 'Urban Thread Co.', category: 'Streetwear',
    price: 2799, originalPrice: 3999,
    images: [
      'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=600',
    ],
    description: 'Trendy Korean-style cropped puffer jacket. Lightweight insulation for cool weather.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Mint', hex: '#6EE7B7' }, { name: 'Lavender', hex: '#C4B5FD' }, { name: 'Black', hex: '#1F2937' }],
    inStock: true, rating: 4.5, reviewCount: 92, shopId: 'shop1', shopName: 'Urban Thread Co.',
    tags: ['korean', 'puffer', 'jacket', 'winter'], occasion: 'Casual', fit: 'Cropped', gender: 'women',
    isTrending: true, isNew: true,
  },
];

export const MOCK_OUTFITS: Outfit[] = [
  { id: 'out1', title: 'Clean Streetwear Look', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', style: 'Streetwear', tags: ['casual', 'minimal', 'monochrome'], products: ['prod1', 'prod2'], savedCount: 2341, shopId: 'shop1' },
  { id: 'out2', title: 'Festive Ethnic Glam', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', style: 'Ethnic', tags: ['festive', 'traditional', 'colorful'], products: ['prod3'], savedCount: 1876, shopId: 'shop2' },
  { id: 'out3', title: 'Office Chic', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', style: 'Formal', tags: ['work', 'professional', 'elegant'], products: ['prod5'], savedCount: 987, shopId: 'shop4' },
  { id: 'out4', title: 'Weekend Casual', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', style: 'Casual', tags: ['weekend', 'relaxed', 'comfortable'], products: ['prod1', 'prod4'], savedCount: 1543, shopId: 'shop1' },
  { id: 'out5', title: 'Korean Street Style', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', style: 'Korean', tags: ['kfashion', 'trendy', 'youth'], products: ['prod6', 'prod4'], savedCount: 3210, shopId: 'shop1' },
  { id: 'out6', title: 'Party Night', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600', style: 'Party', tags: ['glam', 'night-out', 'bold'], products: ['prod5'], savedCount: 2109, shopId: 'shop4' },
];

export const MOCK_BANNERS: Banner[] = [
  { id: 'ban1', title: 'Summer Fiesta', subtitle: 'Up to 60% off on summer collection', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200', type: 'seasonal', ctaText: 'Shop Now', ctaRoute: 'Search', backgroundColor: '#FF6B35' },
  { id: 'ban2', title: 'New Arrivals', subtitle: 'Fresh drops every week', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', type: 'homepage', ctaText: 'Explore', ctaRoute: 'Feed', backgroundColor: '#1F2937' },
  { id: 'ban3', title: 'Korean Wave', subtitle: 'Discover K-fashion near you', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200', type: 'campaign', ctaText: 'Discover', ctaRoute: 'Feed', backgroundColor: '#8B5CF6' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Collection Alert', body: 'Urban Thread Co. just dropped a new streetwear collection!', type: 'collection', isRead: false, createdAt: '2026-06-07T08:00:00Z', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100' },
  { id: 'n2', title: '50% off at Sole Republic', body: 'Flash sale for 24 hours only. Don\'t miss out!', type: 'promotion', isRead: false, createdAt: '2026-06-06T14:00:00Z' },
  { id: 'n3', title: 'Chic Collective is live', body: 'A shop you follow just posted new items.', type: 'shop_update', isRead: true, createdAt: '2026-06-05T10:00:00Z' },
  { id: 'n4', title: 'Style just for you', body: 'Based on your preferences, we found 12 new outfits!', type: 'recommendation', isRead: true, createdAt: '2026-06-04T09:00:00Z' },
];

export const MOCK_ANALYTICS = {
  totalUsers: 12847,
  activeUsers: 4231,
  totalProducts: 1456,
  totalShops: 89,
  revenue: 248600,
  mostSearched: ['oversized tee', 'cargo pants', 'sneakers', 'kurta', 'blazer'],
  popularColors: ['Black', 'White', 'Olive', 'Beige', 'Navy'],
  popularSizes: ['M', 'L', 'S', 'XL', 'XS'],
  popularCategories: ["Women's Wear", 'Streetwear', 'Footwear', 'Ethnic Wear', 'Accessories'],
  popularBrands: ['Urban Thread Co.', 'Sole Republic', 'Chic Collective', 'Ethnic Bazaar'],
  userDemographics: { '18-24': 38, '25-34': 31, '35-44': 18, '45+': 13 },
  weeklyVisits: [420, 510, 480, 620, 780, 890, 740],
  monthlyRevenue: [18000, 22000, 19500, 26000, 31000, 24800],
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Aanya Sharma', email: 'aanya@email.com', mobile: '+91 9876543210', gender: 'Female', ageGroup: '18-24', fashionPreferences: ['Streetwear', 'Korean Fashion'], location: 'Bengaluru', role: 'consumer', isVerified: true, joinedAt: '2026-01-15', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: 'u2', name: 'Rohan Mehta', email: 'rohan@email.com', mobile: '+91 9123456789', gender: 'Male', ageGroup: '25-34', fashionPreferences: ['Casual', 'Formal'], location: 'Mumbai', role: 'consumer', isVerified: true, joinedAt: '2026-02-20', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 'u3', name: 'Priya Nair', email: 'priya@varlet.in', mobile: '+91 9988776655', gender: 'Female', ageGroup: '25-34', fashionPreferences: ['Ethnic', 'Party Wear'], location: 'Kochi', role: 'admin', isVerified: true, joinedAt: '2026-01-01', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
];

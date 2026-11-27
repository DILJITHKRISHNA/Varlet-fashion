// Zustand auth store backed by the Varlet API (see services/http.ts).

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, getTokens, request, setSessionEndedHandler, setTokens } from '../services/http';

export type UserRole = 'consumer' | 'admin' | 'manager' | 'staff' | 'super_admin' | null;
export type ShopRole = Extract<UserRole, 'admin' | 'manager' | 'staff'>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar?: string;
  fashionPreferences: string[];
  location?: string;
  joinedAt?: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  gender?: string;
  ageGroup?: string;
  fashionPreferences?: string[];
}

export interface StoreSignUpInput {
  ownerName: string;
  email: string;
  password: string;
  storeName: string;
  description: string;
  category: string;
  locationText: string;
  lat: number;
  lng: number;
}

/** The account as the API sends it. */
interface Account {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  avatar_url: string | null;
  fashion_preferences: string[];
  location_text: string | null;
  role: NonNullable<UserRole>;
  shop_id: string | null;
  created_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: Account;
}

interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  role: UserRole;
  shopId: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signUpWithEmail: (input: SignUpInput) => Promise<void>;
  /** Creates the owner account and the store together. */
  signUpStoreOwner: (input: StoreSignUpInput) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
  updateUser: (partial: Partial<AuthUser>) => Promise<void>;
  /** Re-reads the account, e.g. after its role or store changes on the server. */
  refreshProfile: () => Promise<void>;
}

// Last known account, so the app can open signed in while offline.
const ACCOUNT_KEY = 'varlet.account';

const SIGNED_OUT = { isAuthenticated: false, role: null, shopId: null, user: null } as const;

function toState(account: Account) {
  return {
    isAuthenticated: true,
    role: account.role,
    shopId: account.shop_id,
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      mobile: account.mobile ?? '',
      avatar: account.avatar_url ?? undefined,
      fashionPreferences: account.fashion_preferences ?? [],
      location: account.location_text ?? undefined,
      joinedAt: account.created_at,
    },
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  const apply = async (account: Account) => {
    set(toState(account));
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  };

  const clear = async () => {
    set(SIGNED_OUT);
    await AsyncStorage.removeItem(ACCOUNT_KEY);
  };

  /** Runs a sign-in or sign-up call and opens the session it returns. */
  const startSession = async (path: string, body: object) => {
    set({ isLoading: true, error: null });
    try {
      await setTokens(null);
      const session = await request<Session>(path, { method: 'POST', body });
      await setTokens({ accessToken: session.access_token, refreshToken: session.refresh_token });
      await apply(session.user);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Sign in failed' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  };

  setSessionEndedHandler(() => {
    clear().catch(() => {});
  });

  return {
    ...SIGNED_OUT,
    isInitializing: true,
    isLoading: false,
    error: null,

    // Call once at app startup (see App.tsx). Restores a saved session.
    initialize: async () => {
      try {
        if (await getTokens()) {
          await apply(await request<Account>('/auth/me'));
        }
      } catch (e) {
        // Server unreachable: keep the person signed in with what we last saw.
        if (!(e instanceof ApiError && e.status === 401)) {
          const saved = await AsyncStorage.getItem(ACCOUNT_KEY);
          if (saved) set(toState(JSON.parse(saved)));
        }
      } finally {
        set({ isInitializing: false });
      }
    },

    signUpWithEmail: ({ name, email, password, mobile, gender, ageGroup, fashionPreferences }) =>
      startSession('/auth/register', {
        name,
        email: email.trim(),
        password,
        mobile: mobile?.trim() || null,
        gender: gender || null,
        age_group: ageGroup || null,
        fashion_preferences: fashionPreferences ?? [],
      }),

    signUpStoreOwner: (input) =>
      startSession('/shops/register', {
        owner_name: input.ownerName,
        email: input.email.trim(),
        password: input.password,
        shop: {
          name: input.storeName,
          description: input.description,
          category: input.category || null,
          location_text: input.locationText,
          lat: input.lat,
          lng: input.lng,
        },
      }),

    signInWithEmail: (email, password) =>
      startSession('/auth/login', { email: email.trim(), password }),

    logout: async () => {
      const tokens = await getTokens();
      await setTokens(null);
      await clear();
      if (tokens) {
        // Best effort: the phone is signed out even if the server is unreachable.
        request('/auth/logout', {
          method: 'POST',
          body: { refresh_token: tokens.refreshToken },
        }).catch(() => {});
      }
    },

    setLoading: (v) => set({ isLoading: v }),

    updateUser: async (partial) => {
      if (!get().user) return;
      const patch: Record<string, unknown> = {};
      if (partial.name !== undefined) patch.name = partial.name;
      if (partial.mobile !== undefined) patch.mobile = partial.mobile || null;
      if (partial.avatar !== undefined) patch.avatar_url = partial.avatar || null;
      if (partial.fashionPreferences !== undefined) {
        patch.fashion_preferences = partial.fashionPreferences;
      }
      await apply(await request<Account>('/auth/me', { method: 'PATCH', body: patch }));
    },

    refreshProfile: async () => {
      if (!get().user) return;
      await apply(await request<Account>('/auth/me'));
    },
  };
});

export function isShopRole(role: UserRole): role is ShopRole {
  return role === 'admin' || role === 'manager' || role === 'staff';
}

export function isPlatformAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

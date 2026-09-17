// Zustand auth store backed by Supabase Auth + the `profiles` table.

import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Database } from '../services/database.types';

export type UserRole = 'consumer' | 'admin' | 'manager' | 'staff' | 'super_admin' | null;
export type ShopRole = Extract<UserRole, 'admin' | 'manager' | 'staff'>;

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar?: string;
  fashionPreferences: string[];
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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
  updateUser: (partial: Partial<AuthUser>) => Promise<void>;
  /** Re-reads the current user's profile — call after an action that changes
   *  role/shop_id server-side (e.g. registerShop) so navigation re-routes. */
  refreshProfile: () => Promise<void>;
}

function mapProfile(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email ?? '',
    mobile: profile.mobile ?? '',
    avatar: profile.avatar_url ?? undefined,
    fashionPreferences: profile.fashion_preferences ?? [],
  };
}

async function loadProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

function applyProfile(set: (partial: Partial<AuthState>) => void, profile: ProfileRow) {
  set({
    isAuthenticated: true,
    role: profile.role,
    shopId: profile.shop_id,
    user: mapProfile(profile),
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isInitializing: true,
  role: null,
  shopId: null,
  user: null,
  isLoading: false,
  error: null,

  // Call once at app startup (see App.tsx). Restores an existing session and
  // subscribes to future sign-in/sign-out events (including token refresh).
  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await loadProfile(session.user.id);
      if (profile) applyProfile(set, profile);
    }
    set({ isInitializing: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        set({ isAuthenticated: false, role: null, shopId: null, user: null });
        return;
      }
      const profile = await loadProfile(session.user.id);
      if (profile) applyProfile(set, profile);
    });
  },

  signUpWithEmail: async ({ name, email, password, mobile, gender, ageGroup, fashionPreferences }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, mobile, fashion_preferences: fashionPreferences ?? [] } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Sign up did not return a user');

      if (gender || ageGroup) {
        await supabase
          .from('profiles')
          .update({ gender, age_group: ageGroup })
          .eq('id', data.user.id);
      }

      // With email confirmation disabled (local dev default) signUp already
      // returns a session; otherwise the user must confirm before signing in.
      if (data.session) {
        const profile = await loadProfile(data.user.id);
        if (profile) applyProfile(set, profile);
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Sign up failed' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const profile = await loadProfile(data.user.id);
      if (!profile) throw new Error('No profile found for this account');
      applyProfile(set, profile);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Sign in failed' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, role: null, shopId: null, user: null });
  },

  setLoading: (v) => set({ isLoading: v }),

  updateUser: async (partial) => {
    const { user } = get();
    if (!user) return;
    const patch: Database['public']['Tables']['profiles']['Update'] = {};
    if (partial.name !== undefined) patch.name = partial.name;
    if (partial.mobile !== undefined) patch.mobile = partial.mobile;
    if (partial.avatar !== undefined) patch.avatar_url = partial.avatar;
    if (partial.fashionPreferences !== undefined) patch.fashion_preferences = partial.fashionPreferences;

    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
    if (error) throw error;
    set({ user: { ...user, ...partial } });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await loadProfile(user.id);
    if (profile) applyProfile(set, profile);
  },
}));

export function isShopRole(role: UserRole): role is ShopRole {
  return role === 'admin' || role === 'manager' || role === 'staff';
}

export function isPlatformAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

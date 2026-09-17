import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!configuredUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in the values from `npx supabase status`.'
  );
}

/**
 * A loopback address in EXPO_PUBLIC_SUPABASE_URL (127.0.0.1/localhost) only
 * resolves on web and the iOS Simulator, which share the host machine's
 * network stack. A physical device or Android emulator has its own loopback
 * that points at itself, not your dev machine — hitting it there is exactly
 * what produces "Network request failed" on sign up/sign in.
 *
 * Fix: when running through the Expo dev server (Metro), swap the loopback
 * host for the LAN IP the device already used to load the JS bundle
 * (Constants.expoConfig.hostUri) — that address is guaranteed reachable
 * from wherever the app is actually running. A real hosted Supabase URL
 * (https://xxxx.supabase.co) is untouched.
 */
function resolveSupabaseUrl(url: string): string {
  const isLoopback = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/i.test(url);
  if (!isLoopback || Platform.OS === 'web') return url;

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const lanHost = hostUri?.split(':')[0];
  if (!lanHost) return url;

  return url.replace(/(127\.0\.0\.1|localhost)/i, lanHost);
}

const supabaseUrl = resolveSupabaseUrl(configuredUrl);

if (__DEV__ && supabaseUrl !== configuredUrl) {
  console.log(`[supabase] Rewrote loopback URL for device access: ${configuredUrl} -> ${supabaseUrl}`);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

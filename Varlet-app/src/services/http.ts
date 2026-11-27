/**
 * Talks to the Varlet API (Varlet-fashion/backend): base address, stored
 * sign-in tokens, and one automatic refresh when the access token expires.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REQUEST_TIMEOUT_MS = 20_000;
const SESSION_KEY = 'varlet.session';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Address ───────────────────────────────────────────────────────────

/**
 * 127.0.0.1 / localhost only means "this computer" on web and the iOS
 * Simulator. On a phone or Android emulator, swap it for the address the
 * device already uses to load the app from Metro.
 */
function resolveApiUrl(url: string): string {
  const isLoopback = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/i.test(url);
  if (!isLoopback || Platform.OS === 'web') return url;
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const lanHost = hostUri?.split(':')[0];
  return lanHost ? url.replace(/(127\.0\.0\.1|localhost)/i, lanHost) : url;
}

const configuredUrl = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
export const API_URL = configuredUrl ? resolveApiUrl(configuredUrl) : '';

// ─── Stored session ────────────────────────────────────────────────────

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Keychain / Keystore on phones; the web build has no secure store.
const storage =
  Platform.OS === 'web'
    ? {
        get: (key: string) => AsyncStorage.getItem(key),
        set: (key: string, value: string) => AsyncStorage.setItem(key, value),
        remove: (key: string) => AsyncStorage.removeItem(key),
      }
    : {
        get: (key: string) => SecureStore.getItemAsync(key),
        set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        remove: (key: string) => SecureStore.deleteItemAsync(key),
      };

let tokens: Tokens | null | undefined; // undefined = not read from storage yet
let onSessionEnded: () => void = () => {};

export async function getTokens(): Promise<Tokens | null> {
  if (tokens === undefined) {
    try {
      const saved = await storage.get(SESSION_KEY);
      tokens = saved ? (JSON.parse(saved) as Tokens) : null;
    } catch {
      tokens = null;
    }
  }
  return tokens;
}

export async function setTokens(next: Tokens | null): Promise<void> {
  tokens = next;
  if (next) await storage.set(SESSION_KEY, JSON.stringify(next));
  else await storage.remove(SESSION_KEY);
}

/** Called when the server no longer accepts the saved sign-in. */
export function setSessionEndedHandler(handler: () => void): void {
  onSessionEnded = handler;
}

// ─── Requests ──────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Options {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function describe(status: number, detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    const field = String(detail[0].loc?.[detail[0].loc.length - 1] ?? 'the form');
    return `Please check ${field.replace(/_/g, ' ')}: ${detail[0].msg}`;
  }
  return status >= 500
    ? 'Varlet is having trouble right now. Please try again.'
    : 'Something went wrong. Please try again.';
}

async function send(path: string, options: Options, accessToken?: string): Promise<Response> {
  if (!API_URL) {
    throw new ApiError(
      'The app has no server address. Set EXPO_PUBLIC_API_URL in .env.local and restart Expo.',
      0
    );
  }
  const query = Object.entries(options.query ?? {})
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}/api/v1${path}${query ? `?${query}` : ''}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError("Can't reach the Varlet server. Check your connection and try again.", 0);
  } finally {
    clearTimeout(timer);
  }
}

let refreshing: Promise<Tokens | null> | null = null;

/** Only one refresh runs at a time, because each refresh token works once. */
function refreshTokens(current: Tokens): Promise<Tokens | null> {
  refreshing ??= (async () => {
    const response = await send('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: current.refreshToken },
    });
    if (response.status === 401) {
      await setTokens(null);
      onSessionEnded();
      return null;
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(describe(response.status, data?.detail), response.status);
    const next = { accessToken: data.access_token, refreshToken: data.refresh_token };
    await setTokens(next);
    return next;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function request<T>(path: string, options: Options = {}): Promise<T> {
  const used = await getTokens();
  let response = await send(path, options, used?.accessToken);

  // A 401 on the sign-in routes means wrong credentials, not an expired session.
  const isSignIn = path === '/auth/login' || path === '/auth/register';
  if (response.status === 401 && used && !isSignIn) {
    // Another request may already have refreshed while this one was in flight.
    const latest = await getTokens();
    const next =
      latest && latest.accessToken !== used.accessToken ? latest : latest && (await refreshTokens(latest));
    response = await send(path, options, next?.accessToken);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(describe(response.status, data?.detail), response.status);
  return data as T;
}

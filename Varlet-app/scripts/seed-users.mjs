#!/usr/bin/env node
// Creates demo auth accounts against the local Supabase stack, using the
// admin API (needs the service role key, never ship this key to the app).
// Run after `npx supabase start`:
//   node scripts/seed-users.mjs

import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

function readLocalSupabaseEnv() {
  const raw = execSync('npx --yes supabase status -o env', { encoding: 'utf8' });
  const env = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z_]+)="?(.*?)"?$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const { API_URL, SERVICE_ROLE_KEY } = readLocalSupabaseEnv();
if (!API_URL || !SERVICE_ROLE_KEY) {
  console.error('Could not read Supabase local status — is `npx supabase start` running?');
  process.exit(1);
}

const supabase = createClient(API_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const URBAN_THREAD_SHOP_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_PASSWORD = 'password123';

const DEMO_USERS = [
  {
    email: 'consumer@varlet.dev',
    metadata: { name: 'Aanya Sharma', role: 'consumer', fashion_preferences: ['Streetwear', 'Korean Fashion'] },
  },
  {
    email: 'manager@varlet.dev',
    metadata: { name: 'Priya Nair', role: 'manager' },
    shopId: URBAN_THREAD_SHOP_ID,
  },
  {
    email: 'admin@varlet.dev',
    metadata: { name: 'Varlet Platform Admin', role: 'super_admin' },
  },
];

async function upsertDemoUser({ email, metadata, shopId }) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });

  let userId = created?.user?.id;

  if (createError) {
    if (!createError.message.includes('already been registered')) throw createError;
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    userId = list.users.find((u) => u.email === email)?.id;
  }

  if (!userId) throw new Error(`Could not resolve user id for ${email}`);

  if (shopId) {
    const { error } = await supabase.from('profiles').update({ shop_id: shopId }).eq('id', userId);
    if (error) throw error;
  }

  console.log(`✓ ${email} (${metadata.role}) — password: ${DEMO_PASSWORD}`);
}

for (const demoUser of DEMO_USERS) {
  await upsertDemoUser(demoUser);
}

console.log('\nDone. Sign in with any of the emails above and password "password123".');

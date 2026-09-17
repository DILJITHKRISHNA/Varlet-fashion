import { supabase } from "./supabase";

export interface RegisterShopInput {
  name: string;
  description: string;
  category: string;
  locationText: string;
  lat: number;
  lng: number;
}

/**
 * Calls the register_shop RPC (see Varlet-app/supabase/migrations/0004_register_shop.sql)
 * — the same backend action the mobile app's "Register your store" screen
 * uses. Caller must already have a Supabase session (sign up/in first).
 */
export async function registerShop(input: RegisterShopInput) {
  const { data, error } = await supabase.rpc("register_shop", {
    shop_name: input.name,
    shop_description: input.description,
    shop_category: input.category,
    shop_location_text: input.locationText,
    shop_lat: input.lat,
    shop_lng: input.lng,
  });
  if (error) throw error;
  return data;
}

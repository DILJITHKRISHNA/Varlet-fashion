/**
 * Category icons — keyed by name, not emoji, so the `categories.icon` column
 * in Supabase can stay a small string ("Shirt", "Gem", …) that both the DB
 * and the client agree on. Falls back to Tag for any unrecognized value.
 */
import { Shirt, Gem, Backpack, Palette, Handbag, Footprints, Briefcase, PartyPopper, Tag, type LucideIcon } from 'lucide-react-native';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Shirt, Gem, Backpack, Palette, Handbag, Footprints, Briefcase, PartyPopper, Tag,
};

export function getCategoryIcon(name: string | null | undefined): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Tag;
}

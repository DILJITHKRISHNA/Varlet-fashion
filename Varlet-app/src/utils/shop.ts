import type { Offer } from '../services/api';
import type { UserRole } from '../store/authStore';

/** Owners and managers run offers, the store profile and enquiries; staff manage products. */
export const canManageStore = (role: UserRole) => role === 'admin' || role === 'manager';

export type OfferStatus = 'Live' | 'Scheduled' | 'Ended' | 'Paused';

export function offerStatus(offer: Offer, now = Date.now()): OfferStatus {
  if (offer.endsAt && Date.parse(offer.endsAt) <= now) return 'Ended';
  if (!offer.isActive) return 'Paused';
  return Date.parse(offer.startsAt) > now ? 'Scheduled' : 'Live';
}

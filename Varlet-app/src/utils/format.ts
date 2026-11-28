export const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export function discountOff(price: number, original?: number): number | null {
  return original && original > price ? Math.round((1 - price / original) * 100) : null;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

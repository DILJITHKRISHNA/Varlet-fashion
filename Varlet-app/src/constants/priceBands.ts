/** The same bands, with the same names, as the server's price collections. */
export const PRICE_BANDS: { label: string; min: number; max?: number }[] = [
  { label: 'Under ₹500', min: 0, max: 499.99 },
  { label: '₹500 – ₹999', min: 500, max: 999.99 },
  { label: '₹1,000 – ₹1,999', min: 1000, max: 1999.99 },
  { label: '₹2,000 – ₹4,999', min: 2000, max: 4999.99 },
  { label: '₹5,000 and above', min: 5000 },
];

export const USD_TO_INR = 83.0;

export function formatINR(usdPrice: number): string {
  const inrPrice = usdPrice * USD_TO_INR;
  // Use Indian number formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inrPrice);
}

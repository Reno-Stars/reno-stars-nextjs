/**
 * Currency and date formatting helpers for PDF generation.
 */

export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  // Manual formatting to avoid locale-dependent behavior in server-side rendering
  const formatted = dollars.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${formatted}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

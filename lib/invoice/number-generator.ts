import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Generate the next sequential invoice number for a given type.
 *
 * Format: EST-0001, EST-0002, INV-0001, etc.
 * Queries the DB for the highest existing number with the given prefix,
 * parses the numeric suffix, and increments it.
 */
export async function generateInvoiceNumber(
  type: 'estimate' | 'invoice'
): Promise<string> {
  const prefix = type === 'estimate' ? 'EST' : 'INV';
  const pattern = `${prefix}-%`;

  // Find the highest existing number for this prefix
  const result = await db
    .select({
      maxNumber: sql<string | null>`MAX(${invoices.invoiceNumber})`,
    })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`);

  const maxNumber = result[0]?.maxNumber;

  let nextSeq = 1;
  if (maxNumber) {
    const parts = maxNumber.split('-');
    const current = parseInt(parts[1], 10);
    if (!isNaN(current)) {
      nextSeq = current + 1;
    }
  }

  return `${prefix}-${String(nextSeq).padStart(4, '0')}`;
}

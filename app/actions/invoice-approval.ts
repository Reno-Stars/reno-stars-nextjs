'use server';

import { revalidatePath } from 'next/cache';
import {
  getInvoiceByShareToken,
  approveInvoice as approveInvoiceDb,
  createInvoiceVersion,
} from '@/lib/db/invoice-queries';

export interface ApprovalResult {
  success: boolean;
  message: string;
}

/**
 * Approve an invoice/estimate by its public shareToken.
 * This is a client-facing action — no admin auth required.
 */
export async function approveInvoice(
  shareToken: string
): Promise<ApprovalResult> {
  // Validate share token format (64-char hex)
  if (!/^[a-f0-9]{64}$/.test(shareToken)) {
    return { success: false, message: 'Invalid token.' };
  }

  const invoice = await getInvoiceByShareToken(shareToken);
  if (!invoice) {
    return { success: false, message: 'Document not found.' };
  }

  if (invoice.status !== 'sent' && invoice.status !== 'viewed') {
    if (invoice.status === 'approved') {
      return { success: false, message: 'This document has already been approved.' };
    }
    return { success: false, message: 'This document cannot be approved in its current state.' };
  }

  const updated = await approveInvoiceDb(invoice.id);
  if (!updated) {
    return { success: false, message: 'Failed to approve. Please try again.' };
  }

  // Create version record for audit trail
  await createInvoiceVersion(
    invoice.id,
    'approved',
    `${invoice.type === 'estimate' ? 'Estimate' : 'Invoice'} approved by client`,
    'client'
  );

  // Revalidate the share page so it reflects the new status
  revalidatePath(`/en/invoice/${shareToken}`);
  revalidatePath(`/zh/invoice/${shareToken}`);

  return { success: true, message: 'Approved successfully.' };
}

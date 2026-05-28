'use server';

import { revalidatePath } from 'next/cache';
import { invoiceClient, isNotFoundError } from '@/lib/clients/invoice';

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

  // Resolve the share token to an invoice (the service auto-tracks viewedAt
  // and flips sent → viewed on this call — same behavior as the legacy path).
  let payload;
  try {
    payload = await invoiceClient.getShare(shareToken);
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, message: 'Document not found.' };
    }
    console.error('approveInvoice: failed to resolve share token:', err);
    return { success: false, message: 'Failed to approve. Please try again.' };
  }

  const invoice = payload.invoice;

  if (invoice.status !== 'sent' && invoice.status !== 'viewed') {
    if (invoice.status === 'approved') {
      return { success: false, message: 'This document has already been approved.' };
    }
    return { success: false, message: 'This document cannot be approved in its current state.' };
  }

  try {
    await invoiceClient.setStatus(invoice.id, 'approved', 'client');
  } catch (err) {
    console.error('approveInvoice: setStatus failed:', err);
    return { success: false, message: 'Failed to approve. Please try again.' };
  }

  // Revalidate the share page so it reflects the new status
  revalidatePath(`/en/invoice/${shareToken}`);
  revalidatePath(`/zh/invoice/${shareToken}`);

  return { success: true, message: 'Approved successfully.' };
}

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';

export async function updateContactStatus(
  id: string,
  status: 'new' | 'contacted' | 'converted' | 'rejected'
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid contact ID.' };
  const VALID_STATUSES = ['new', 'contacted', 'converted', 'rejected'] as const;
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' };
  }
  try {
    await db
      .update(contactSubmissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id));
    revalidatePath('/admin/contacts');
    return {};
  } catch (error) {
    console.error('Failed to update contact status:', error);
    return { error: 'Failed to update status.' };
  }
}

export async function updateContactNotes(
  id: string,
  notes: string
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid contact ID.' };
  if (notes.length > 5000) {
    return { error: 'Notes must be under 5,000 characters.' };
  }
  try {
    await db
      .update(contactSubmissions)
      .set({ notes, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id));
    revalidatePath('/admin/contacts');
    return {};
  } catch (error) {
    console.error('Failed to update contact notes:', error);
    return { error: 'Failed to update notes.' };
  }
}

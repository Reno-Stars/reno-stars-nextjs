'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { CONTACT_STATUSES, MAX_NOTES_LENGTH, type ContactStatus } from '@/lib/admin/form-utils';

export async function updateContactStatus(
  id: string,
  status: ContactStatus
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid contact ID.' };
  if (!(CONTACT_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' };
  }
  try {
    const updated = await db
      .update(contactSubmissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id))
      .returning({ id: contactSubmissions.id });
    if (updated.length === 0) {
      return { error: 'Contact not found.' };
    }
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
  if (notes.length > MAX_NOTES_LENGTH) {
    return { error: `Notes must be under ${MAX_NOTES_LENGTH.toLocaleString()} characters.` };
  }
  try {
    const updated = await db
      .update(contactSubmissions)
      .set({ notes, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id))
      .returning({ id: contactSubmissions.id });
    if (updated.length === 0) {
      return { error: 'Contact not found.' };
    }
    revalidatePath('/admin/contacts');
    return {};
  } catch (error) {
    console.error('Failed to update contact notes:', error);
    return { error: 'Failed to update notes.' };
  }
}

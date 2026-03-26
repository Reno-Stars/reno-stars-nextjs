'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
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

export async function deleteContact(
  id: string
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid contact ID.' };
  try {
    const deleted = await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .returning({ id: contactSubmissions.id });
    if (deleted.length === 0) {
      return { error: 'Contact not found.' };
    }
    revalidatePath('/admin/contacts');
    return {};
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return { error: 'Failed to delete contact.' };
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

const MAX_BATCH_SIZE = 100;

export async function batchDeleteContacts(
  ids: string[]
): Promise<{ error?: string; deleted?: number }> {
  await requireAuth();
  if (!Array.isArray(ids) || ids.length === 0) return { error: 'No contacts selected.' };
  if (ids.length > MAX_BATCH_SIZE) return { error: `Cannot delete more than ${MAX_BATCH_SIZE} contacts at once.` };
  if (!ids.every(isValidUUID)) return { error: 'Invalid contact ID.' };
  try {
    const deleted = await db
      .delete(contactSubmissions)
      .where(inArray(contactSubmissions.id, ids))
      .returning({ id: contactSubmissions.id });
    revalidatePath('/admin/contacts');
    return { deleted: deleted.length };
  } catch (error) {
    console.error('Failed to batch delete contacts:', error);
    return { error: 'Failed to delete contacts.' };
  }
}

export async function batchUpdateContactStatus(
  ids: string[],
  status: ContactStatus
): Promise<{ error?: string; updated?: number }> {
  await requireAuth();
  if (!Array.isArray(ids) || ids.length === 0) return { error: 'No contacts selected.' };
  if (ids.length > MAX_BATCH_SIZE) return { error: `Cannot update more than ${MAX_BATCH_SIZE} contacts at once.` };
  if (!ids.every(isValidUUID)) return { error: 'Invalid contact ID.' };
  if (!(CONTACT_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' };
  }
  try {
    const updated = await db
      .update(contactSubmissions)
      .set({ status, updatedAt: new Date() })
      .where(inArray(contactSubmissions.id, ids))
      .returning({ id: contactSubmissions.id });
    revalidatePath('/admin/contacts');
    return { updated: updated.length };
  } catch (error) {
    console.error('Failed to batch update contact status:', error);
    return { error: 'Failed to update status.' };
  }
}

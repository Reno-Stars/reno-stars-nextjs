'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { showroomInfo } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { isValidPhone } from '@/lib/utils';

export async function updateShowroomInfo(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const data = {
      address: getString(formData, 'address'),
      appointmentTextEn: getString(formData, 'appointmentTextEn'),
      appointmentTextZh: getString(formData, 'appointmentTextZh'),
      phone: getString(formData, 'phone'),
      email: getString(formData, 'email'),
      hoursOpen: getString(formData, 'hoursOpen'),
      hoursClose: getString(formData, 'hoursClose'),
      updatedAt: new Date(),
    };

    // Validate text lengths
    const textError = validateTextLengths({
      address: data.address,
      appointmentTextEn: data.appointmentTextEn,
      appointmentTextZh: data.appointmentTextZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { error: 'Invalid email format.' };
    }

    // Validate phone format if provided
    if (data.phone && !isValidPhone(data.phone)) {
      return { error: 'Invalid phone format.' };
    }

    const rows = await db.select({ id: showroomInfo.id }).from(showroomInfo).limit(1);
    if (!rows[0]) return { error: 'Showroom info row not found. Run db:seed first.' };

    const updated = await db.update(showroomInfo).set(data).where(eq(showroomInfo.id, rows[0].id)).returning({ id: showroomInfo.id });
    if (updated.length === 0) return { error: 'Failed to update showroom info.' };

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update showroom info:', error);
    return { error: 'Failed to update showroom info.' };
  }
}

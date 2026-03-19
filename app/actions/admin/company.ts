'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { companyInfo } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/admin/auth';
import { getString } from '@/lib/admin/form-utils';
import { deleteS3Object } from '@/lib/admin/s3';

export async function updateCompanyInfo(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();

  try {
    const data = {
      name: getString(formData, 'name'),
      tagline: getString(formData, 'tagline'),
      phone: getString(formData, 'phone'),
      email: getString(formData, 'email'),
      address: getString(formData, 'address'),
      logoUrl: getString(formData, 'logoUrl'),
      heroVideoUrl: getString(formData, 'heroVideoUrl'),
      heroImageUrl: getString(formData, 'heroImageUrl'),
      quoteUrl: getString(formData, 'quoteUrl'),
      geoLatitude: getString(formData, 'geoLatitude'),
      geoLongitude: getString(formData, 'geoLongitude'),
      updatedAt: new Date(),
    };

    if (!data.name?.trim()) {
      return { error: 'Company name is required.' };
    }

    // Get the singleton row (need old URLs for cleanup)
    const rows = await db
      .select({
        id: companyInfo.id,
        logoUrl: companyInfo.logoUrl,
        heroVideoUrl: companyInfo.heroVideoUrl,
        heroImageUrl: companyInfo.heroImageUrl,
      })
      .from(companyInfo)
      .limit(1);
    if (!rows[0]) {
      return { error: 'Company info row not found. Run db:seed first.' };
    }

    await db.update(companyInfo).set(data).where(eq(companyInfo.id, rows[0].id));

    // Clean up replaced S3 uploads (fire-and-forget)
    const old = rows[0];
    const cleanups: Promise<void>[] = [];
    if (old.logoUrl && data.logoUrl !== old.logoUrl) cleanups.push(deleteS3Object(old.logoUrl));
    if (old.heroVideoUrl && data.heroVideoUrl !== old.heroVideoUrl) cleanups.push(deleteS3Object(old.heroVideoUrl));
    if (old.heroImageUrl && data.heroImageUrl !== old.heroImageUrl) cleanups.push(deleteS3Object(old.heroImageUrl));
    if (cleanups.length > 0) void Promise.all(cleanups).catch(() => {});

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update company info:', error);
    return { error: 'Failed to update company info.' };
  }
}

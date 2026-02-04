'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { companyInfo } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/admin/auth';
import { getString } from '@/lib/admin/form-utils';

function parseIntOrNull(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

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
      quoteUrl: getString(formData, 'quoteUrl'),
      foundingYear: parseIntOrNull(getString(formData, 'foundingYear')),
      teamSize: parseIntOrNull(getString(formData, 'teamSize')),
      warranty: getString(formData, 'warranty'),
      liabilityCoverage: getString(formData, 'liabilityCoverage'),
      rating: getString(formData, 'rating'),
      reviewCount: parseIntOrNull(getString(formData, 'reviewCount')),
      ratingSource: getString(formData, 'ratingSource'),
      geoLatitude: getString(formData, 'geoLatitude'),
      geoLongitude: getString(formData, 'geoLongitude'),
      updatedAt: new Date(),
    };

    if (!data.name?.trim()) {
      return { error: 'Company name is required.' };
    }

    // Get the singleton row id
    const rows = await db.select({ id: companyInfo.id }).from(companyInfo).limit(1);
    if (!rows[0]) {
      return { error: 'Company info row not found. Run db:seed first.' };
    }

    await db.update(companyInfo).set(data).where(eq(companyInfo.id, rows[0].id));

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update company info:', error);
    return { error: 'Failed to update company info.' };
  }
}

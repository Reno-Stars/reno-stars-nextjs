'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { aboutSections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';

export async function updateAboutSections(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const data = {
      ourJourneyEn: getString(formData, 'ourJourneyEn'),
      ourJourneyZh: getString(formData, 'ourJourneyZh'),
      whatWeOfferEn: getString(formData, 'whatWeOfferEn'),
      whatWeOfferZh: getString(formData, 'whatWeOfferZh'),
      ourValuesEn: getString(formData, 'ourValuesEn'),
      ourValuesZh: getString(formData, 'ourValuesZh'),
      whyChooseUsEn: getString(formData, 'whyChooseUsEn'),
      whyChooseUsZh: getString(formData, 'whyChooseUsZh'),
      letsBuildTogetherEn: getString(formData, 'letsBuildTogetherEn'),
      letsBuildTogetherZh: getString(formData, 'letsBuildTogetherZh'),
      updatedAt: new Date(),
    };

    const { updatedAt: _, ...textFields } = data;
    const textError = validateTextLengths(textFields, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    const rows = await db.select({ id: aboutSections.id }).from(aboutSections).limit(1);
    if (!rows[0]) return { error: 'About sections row not found. Run db:seed first.' };

    await db.update(aboutSections).set(data).where(eq(aboutSections.id, rows[0].id));

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update about sections:', error);
    return { error: 'Failed to update about sections.' };
  }
}

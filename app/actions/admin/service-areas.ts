'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { serviceAreas, faqs } from '@/lib/db/schema';
import { eq, count, like } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, validateTextLengths, MAX_SHORT_TEXT_LENGTH, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { parseLocalizations } from '@/lib/admin/parse-localizations';
import { ensureUniqueSlug } from '@/lib/utils';
import { revalidatePathAllLocales, revalidatePathsAllLocales } from '@/lib/seo/revalidate-paths';
import { listingCardChanged, SERVICE_AREA_LIST_FIELDS } from '@/lib/admin/listing-cache';

export async function createServiceArea(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const slug = getString(formData, 'slug').trim().toLowerCase();
    const nameEn = getString(formData, 'nameEn').trim();
    const nameZh = getString(formData, 'nameZh').trim();
    const descriptionEn = getString(formData, 'descriptionEn') || null;
    const descriptionZh = getString(formData, 'descriptionZh') || null;
    const displayOrder = parseInt(getString(formData, 'displayOrder') || '0', 10);
    const isActive = formData.get('isActive') === 'on';

    if (!slug) return { error: 'Slug is required.' };
    if (!isValidSlug(slug)) return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    if (!nameEn || !nameZh) return { error: 'Names are required.' };
    const nameError = validateTextLengths({ nameEn, nameZh }, MAX_SHORT_TEXT_LENGTH);
    if (nameError) return { error: nameError };
    const descError = validateTextLengths({ descriptionEn, descriptionZh }, MAX_TEXT_LENGTH);
    if (descError) return { error: descError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const contentEn = getString(formData, 'contentEn') || null;
    const contentZh = getString(formData, 'contentZh') || null;
    const highlightsEn = getString(formData, 'highlightsEn') || null;
    const highlightsZh = getString(formData, 'highlightsZh') || null;
    const metaTitleEn = getString(formData, 'metaTitleEn') || null;
    const metaTitleZh = getString(formData, 'metaTitleZh') || null;
    const metaDescriptionEn = getString(formData, 'metaDescriptionEn') || null;
    const metaDescriptionZh = getString(formData, 'metaDescriptionZh') || null;

    const metaTitleError = validateTextLengths({ metaTitleEn, metaTitleZh }, 120);
    if (metaTitleError) return { error: metaTitleError };
    const metaDescError = validateTextLengths({ metaDescriptionEn, metaDescriptionZh }, 320);
    if (metaDescError) return { error: metaDescError };

    const conflictingSlugs = await db.select({ slug: serviceAreas.slug }).from(serviceAreas).where(like(serviceAreas.slug, `${slug}%`));
    const uniqueSlug = ensureUniqueSlug(slug, conflictingSlugs.map((r: { slug: string }) => r.slug));

    const localizations = parseLocalizations(formData);

    await db.insert(serviceAreas).values({
      slug: uniqueSlug,
      nameEn,
      nameZh,
      descriptionEn,
      descriptionZh,
      contentEn,
      contentZh,
      highlightsEn,
      highlightsZh,
      metaTitleEn,
      metaTitleZh,
      metaDescriptionEn,
      metaDescriptionZh,
      displayOrder,
      isActive,
      ...(Object.keys(localizations).length > 0 ? { localizations } : {}),
    });

    revalidatePath('/admin/service-areas');
    // Revalidate the new city page + the areas index (no broad `service-areas`
    // tag — it over-invalidates the whole site). Footer/cross-links → TTL.
    revalidatePathsAllLocales(`/areas/${uniqueSlug}`, '/areas');
  } catch (error) {
    console.error('Failed to create service area:', error);
    return { error: 'Failed to create service area.' };
  }

  redirect('/admin/service-areas');
}

export async function deleteServiceArea(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service area ID.' };
  try {
    const [{ value: faqRefCount }] = await db
      .select({ value: count() })
      .from(faqs)
      .where(eq(faqs.serviceAreaId, id));
    if (faqRefCount > 0) {
      return { error: `Cannot delete: ${faqRefCount} FAQ(s) are assigned to this area. Reassign them first.` };
    }

    const deleted = await db.delete(serviceAreas).where(eq(serviceAreas.id, id)).returning({ id: serviceAreas.id, slug: serviceAreas.slug });
    if (deleted.length === 0) return { error: 'Service area not found.' };
    revalidatePath('/admin/service-areas');
    revalidatePathsAllLocales('/areas', deleted[0]?.slug ? `/areas/${deleted[0].slug}` : undefined);
    return {};
  } catch (error) {
    console.error('Failed to delete service area:', error);
    return { error: 'Failed to delete service area.' };
  }
}

export async function reorderServiceAreas(orderedIds: string[]): Promise<{ error?: string }> {
  await requireAuth();

  if (orderedIds.length > 200) return { error: 'Too many items.' };
  if (new Set(orderedIds).size !== orderedIds.length) return { error: 'Duplicate IDs.' };
  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid service area ID in list.' };
  }

  try {
    const now = new Date();
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(serviceAreas)
          .set({ displayOrder: i, updatedAt: now })
          .where(eq(serviceAreas.id, id))
      )
    );

    revalidatePath('/admin/service-areas');
    revalidatePathAllLocales('/areas');
    return {};
  } catch (error) {
    console.error('Failed to reorder service areas:', error);
    return { error: 'Failed to reorder service areas.' };
  }
}

export async function updateServiceArea(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service area ID.' };
  try {
    const localizations = parseLocalizations(formData);
    const data = {
      nameEn: getString(formData, 'nameEn').trim(),
      nameZh: getString(formData, 'nameZh').trim(),
      descriptionEn: getString(formData, 'descriptionEn') || null,
      descriptionZh: getString(formData, 'descriptionZh') || null,
      contentEn: getString(formData, 'contentEn') || null,
      contentZh: getString(formData, 'contentZh') || null,
      highlightsEn: getString(formData, 'highlightsEn') || null,
      highlightsZh: getString(formData, 'highlightsZh') || null,
      metaTitleEn: getString(formData, 'metaTitleEn') || null,
      metaTitleZh: getString(formData, 'metaTitleZh') || null,
      metaDescriptionEn: getString(formData, 'metaDescriptionEn') || null,
      metaDescriptionZh: getString(formData, 'metaDescriptionZh') || null,
      displayOrder: parseInt(getString(formData, 'displayOrder'), 10),
      isActive: formData.get('isActive') === 'on',
      localizations,
      updatedAt: new Date(),
    };

    if (!data.nameEn || !data.nameZh) return { error: 'Names are required.' };
    const nameError = validateTextLengths({ nameEn: data.nameEn, nameZh: data.nameZh }, MAX_SHORT_TEXT_LENGTH);
    if (nameError) return { error: nameError };
    const descError = validateTextLengths({ descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh }, MAX_TEXT_LENGTH);
    if (descError) return { error: descError };
    const metaTitleError = validateTextLengths({ metaTitleEn: data.metaTitleEn, metaTitleZh: data.metaTitleZh }, 120);
    if (metaTitleError) return { error: metaTitleError };
    const metaDescError = validateTextLengths({ metaDescriptionEn: data.metaDescriptionEn, metaDescriptionZh: data.metaDescriptionZh }, 320);
    if (metaDescError) return { error: metaDescError };
    if (!Number.isFinite(data.displayOrder) || data.displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    // Snapshot the list-visible fields + slug BEFORE the update so we can tell
    // whether this edit needs the broad `service-areas` bust or just the
    // narrow per-city one.
    const before = await db
      .select({
        slug: serviceAreas.slug,
        nameEn: serviceAreas.nameEn,
        nameZh: serviceAreas.nameZh,
        isActive: serviceAreas.isActive,
        displayOrder: serviceAreas.displayOrder,
      })
      .from(serviceAreas)
      .where(eq(serviceAreas.id, id))
      .limit(1);
    if (before.length === 0) return { error: 'Service area not found.' };

    const updated = await db.update(serviceAreas).set(data).where(eq(serviceAreas.id, id)).returning({ id: serviceAreas.id });
    if (updated.length === 0) return { error: 'Service area not found.' };

    revalidatePath('/admin/service-areas');
    // Revalidate this city's own page (path, surgical). Only refresh the areas
    // index when a list-visible field changed — not for description/content/meta
    // edits. No broad `service-areas` tag (it over-invalidates the whole site);
    // footer/cross-link area lists refresh on their TTL. (slug isn't editable.)
    revalidatePathsAllLocales(
      `/areas/${before[0].slug}`,
      listingCardChanged(before[0], data, SERVICE_AREA_LIST_FIELDS) ? '/areas' : undefined,
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to update service area:', error);
    return { error: 'Failed to update service area.' };
  }
}

export async function toggleServiceAreaActive(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service area ID.' };
  try {
    const updated = await db.update(serviceAreas).set({ isActive: !current, updatedAt: new Date() }).where(eq(serviceAreas.id, id)).returning({ id: serviceAreas.id, slug: serviceAreas.slug });
    if (updated.length === 0) return { error: 'Service area not found.' };
    revalidatePath('/admin/service-areas');
    // Activating/deactivating changes the listing + the city page's availability.
    revalidatePathsAllLocales('/areas', updated[0]?.slug ? `/areas/${updated[0].slug}` : undefined);
    return {};
  } catch (error) {
    console.error('Failed to toggle service area active:', error);
    return { error: 'Failed to toggle service area active.' };
  }
}

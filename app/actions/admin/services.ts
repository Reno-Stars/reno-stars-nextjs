'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { services, projects, contactSubmissions } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';

export async function createService(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const slug = getString(formData, 'slug').trim().toLowerCase();
    const titleEn = getString(formData, 'titleEn').trim();
    const titleZh = getString(formData, 'titleZh').trim();
    const descriptionEn = getString(formData, 'descriptionEn').trim();
    const descriptionZh = getString(formData, 'descriptionZh').trim();
    const longDescriptionEn = getString(formData, 'longDescriptionEn') || null;
    const longDescriptionZh = getString(formData, 'longDescriptionZh') || null;
    const iconUrl = getString(formData, 'iconUrl') || null;
    const imageUrl = getString(formData, 'imageUrl') || null;
    const displayOrder = parseInt(getString(formData, 'displayOrder') || '0', 10);

    if (!slug) return { error: 'Slug is required.' };
    if (!isValidSlug(slug)) return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    if (!titleEn || !titleZh) return { error: 'Titles are required.' };
    if (!descriptionEn || !descriptionZh) return { error: 'Short descriptions are required.' };

    const titleError = validateTextLengths({ titleEn, titleZh }, MAX_SHORT_TEXT_LENGTH);
    if (titleError) return { error: titleError };
    const textError = validateTextLengths({
      descriptionEn, descriptionZh, longDescriptionEn, longDescriptionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    if (iconUrl && !isValidUrl(iconUrl)) return { error: 'Icon URL is not a valid URL.' };
    if (imageUrl && !isValidUrl(imageUrl)) return { error: 'Image URL is not a valid URL.' };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const existingSlugs = await db.select({ slug: services.slug }).from(services);
    const uniqueSlug = ensureUniqueSlug(slug, existingSlugs.map((r: { slug: string }) => r.slug));

    await db.insert(services).values({
      slug: uniqueSlug,
      titleEn,
      titleZh,
      descriptionEn,
      descriptionZh,
      longDescriptionEn,
      longDescriptionZh,
      iconUrl,
      imageUrl,
      displayOrder,
    });

    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create service:', error);
    return { error: 'Failed to create service.' };
  }

  redirect('/admin/services');
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service ID.' };
  try {
    const [[{ value: contactRefCount }], [{ value: projectRefCount }]] = await Promise.all([
      db.select({ value: count() }).from(contactSubmissions).where(eq(contactSubmissions.preferredServiceId, id)),
      db.select({ value: count() }).from(projects).where(eq(projects.serviceId, id)),
    ]);
    if (contactRefCount > 0) {
      return { error: `Cannot delete: ${contactRefCount} contact(s) reference this service.` };
    }
    if (projectRefCount > 0) {
      return { error: `Cannot delete: ${projectRefCount} project(s) reference this service.` };
    }

    const deleted = await db.delete(services).where(eq(services.id, id)).returning({ id: services.id });
    if (deleted.length === 0) return { error: 'Service not found.' };
    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete service:', error);
    return { error: 'Failed to delete service.' };
  }
}

export async function reorderServices(orderedIds: string[]): Promise<{ error?: string }> {
  await requireAuth();

  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid service ID in list.' };
  }

  try {
    const now = new Date();
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(services)
          .set({ displayOrder: i, updatedAt: now })
          .where(eq(services.id, id))
      )
    );

    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to reorder services:', error);
    return { error: 'Failed to reorder services.' };
  }
}

export async function updateService(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service ID.' };

  try {
    const data = {
      titleEn: getString(formData, 'titleEn').trim(),
      titleZh: getString(formData, 'titleZh').trim(),
      descriptionEn: getString(formData, 'descriptionEn').trim(),
      descriptionZh: getString(formData, 'descriptionZh').trim(),
      longDescriptionEn: getString(formData, 'longDescriptionEn') || null,
      longDescriptionZh: getString(formData, 'longDescriptionZh') || null,
      iconUrl: getString(formData, 'iconUrl') || null,
      imageUrl: getString(formData, 'imageUrl') || null,
      updatedAt: new Date(),
    };

    if (!data.titleEn || !data.titleZh) {
      return { error: 'Titles are required.' };
    }
    if (!data.descriptionEn || !data.descriptionZh) {
      return { error: 'Short descriptions are required.' };
    }
    const titleError = validateTextLengths(
      { titleEn: data.titleEn, titleZh: data.titleZh }, MAX_SHORT_TEXT_LENGTH
    );
    if (titleError) return { error: titleError };
    if (data.iconUrl && !isValidUrl(data.iconUrl)) {
      return { error: 'Icon URL is not a valid URL.' };
    }
    if (data.imageUrl && !isValidUrl(data.imageUrl)) {
      return { error: 'Image URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh,
      longDescriptionEn: data.longDescriptionEn, longDescriptionZh: data.longDescriptionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    const updated = await db.update(services).set(data).where(eq(services.id, id)).returning({ id: services.id });
    if (updated.length === 0) {
      return { error: 'Service not found.' };
    }

    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update service:', error);
    return { error: 'Failed to update service.' };
  }
}

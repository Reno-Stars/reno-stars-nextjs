'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { services, serviceTags, serviceBenefits, projects, contactSubmissions } from '@/lib/db/schema';
import { eq, count, inArray, like } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { parseLocalizations } from '@/lib/admin/parse-localizations';
import { ensureUniqueSlug } from '@/lib/utils';

const MAX_TAGS = 50;
const MAX_TAG_LENGTH = 200;
const MAX_BENEFITS = 20;
const MAX_BENEFIT_LENGTH = 200;

function parseTags(formData: FormData) {
  const tags: { tagEn: string; tagZh: string; displayOrder: number }[] = [];
  let i = 0;
  while (formData.has(`tags[${i}].en`) && i < MAX_TAGS) {
    const en = getString(formData, `tags[${i}].en`).trim();
    const zh = getString(formData, `tags[${i}].zh`).trim();
    if (en) {
      tags.push({ tagEn: en, tagZh: zh || en, displayOrder: i });
    }
    i++;
  }
  return tags;
}

function validateTags(tags: { tagEn: string; tagZh: string }[]): string | null {
  for (const tag of tags) {
    if (tag.tagEn.length > MAX_TAG_LENGTH) return `Tag EN "${tag.tagEn.slice(0, 30)}..." exceeds ${MAX_TAG_LENGTH} characters.`;
    if (tag.tagZh.length > MAX_TAG_LENGTH) return `Tag ZH "${tag.tagZh.slice(0, 30)}..." exceeds ${MAX_TAG_LENGTH} characters.`;
  }
  return null;
}

function parseBenefits(formData: FormData) {
  const benefits: { benefitEn: string; benefitZh: string; displayOrder: number }[] = [];
  let i = 0;
  while (formData.has(`benefits[${i}].en`) && i < MAX_BENEFITS) {
    const en = getString(formData, `benefits[${i}].en`).trim();
    const zh = getString(formData, `benefits[${i}].zh`).trim();
    if (en) {
      benefits.push({ benefitEn: en, benefitZh: zh || en, displayOrder: i });
    }
    i++;
  }
  return benefits;
}

function validateBenefits(benefits: { benefitEn: string; benefitZh: string }[]): string | null {
  for (const b of benefits) {
    if (b.benefitEn.length > MAX_BENEFIT_LENGTH) return `Benefit EN "${b.benefitEn.slice(0, 30)}..." exceeds ${MAX_BENEFIT_LENGTH} characters.`;
    if (b.benefitZh.length > MAX_BENEFIT_LENGTH) return `Benefit ZH "${b.benefitZh.slice(0, 30)}..." exceeds ${MAX_BENEFIT_LENGTH} characters.`;
  }
  return null;
}

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
    const showOnServicesPage = formData.get('showOnServicesPage') === 'on';
    const isProjectType = formData.get('isProjectType') === 'on';

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

    const tagData = parseTags(formData);
    const tagError = validateTags(tagData);
    if (tagError) return { error: tagError };

    const benefitData = parseBenefits(formData);
    const benefitError = validateBenefits(benefitData);
    if (benefitError) return { error: benefitError };

    const conflictingSlugs = await db.select({ slug: services.slug }).from(services).where(like(services.slug, `${slug}%`));
    const uniqueSlug = ensureUniqueSlug(slug, conflictingSlugs.map((r: { slug: string }) => r.slug));

    const localizations = parseLocalizations(formData);

    const [inserted] = await db.insert(services).values({
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
      showOnServicesPage,
      isProjectType,
      ...(Object.keys(localizations).length > 0 ? { localizations } : {}),
    }).returning({ id: services.id });

    // Insert tags (already parsed and validated above)
    if (tagData.length > 0) {
      await db.insert(serviceTags).values(
        tagData.map((tag) => ({ ...tag, serviceId: inserted.id }))
      );
    }

    // Insert benefits
    if (benefitData.length > 0) {
      await db.insert(serviceBenefits).values(
        benefitData.map((b) => ({ ...b, serviceId: inserted.id }))
      );
    }

    revalidatePath('/admin/services');
    updateTag('services');
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
    updateTag('services');
    return {};
  } catch (error) {
    console.error('Failed to delete service:', error);
    return { error: 'Failed to delete service.' };
  }
}

export async function reorderServices(orderedIds: string[]): Promise<{ error?: string }> {
  await requireAuth();

  if (orderedIds.length > 200) return { error: 'Too many items.' };
  if (new Set(orderedIds).size !== orderedIds.length) return { error: 'Duplicate IDs.' };
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
    updateTag('services');
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
    const slug = getString(formData, 'slug').trim().toLowerCase();
    if (!slug) return { error: 'Slug is required.' };
    if (!isValidSlug(slug)) return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };

    const localizations = parseLocalizations(formData);
    const data = {
      slug,
      titleEn: getString(formData, 'titleEn').trim(),
      titleZh: getString(formData, 'titleZh').trim(),
      descriptionEn: getString(formData, 'descriptionEn').trim(),
      descriptionZh: getString(formData, 'descriptionZh').trim(),
      longDescriptionEn: getString(formData, 'longDescriptionEn') || null,
      longDescriptionZh: getString(formData, 'longDescriptionZh') || null,
      iconUrl: getString(formData, 'iconUrl') || null,
      imageUrl: getString(formData, 'imageUrl') || null,
      showOnServicesPage: formData.get('showOnServicesPage') === 'on',
      isProjectType: formData.get('isProjectType') === 'on',
      // Replace localizations jsonb wholesale — the form provider sends every
      // non-en/zh value it tracks, so an empty payload is a real "clear all".
      localizations,
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

    const tagData = parseTags(formData);
    const tagError = validateTags(tagData);
    if (tagError) return { error: tagError };

    const benefitData = parseBenefits(formData);
    const benefitError = validateBenefits(benefitData);
    if (benefitError) return { error: benefitError };

    // Ensure slug is unique (exclude current service's own slug)
    const currentService = await db.select({ slug: services.slug }).from(services).where(eq(services.id, id)).limit(1);
    const currentSlug = currentService[0]?.slug;
    const conflictingSlugs = await db.select({ slug: services.slug }).from(services).where(like(services.slug, `${slug}%`));
    data.slug = ensureUniqueSlug(slug, conflictingSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    const updated = await db.update(services).set(data).where(eq(services.id, id)).returning({ id: services.id });
    if (updated.length === 0) {
      return { error: 'Service not found.' };
    }

    // Insert-before-delete pattern for tags (Neon doesn't support interactive transactions)
    const existingTags = await db.select({ id: serviceTags.id }).from(serviceTags).where(eq(serviceTags.serviceId, id));

    if (tagData.length > 0) {
      await db.insert(serviceTags).values(
        tagData.map((tag) => ({ ...tag, serviceId: id }))
      );
    }

    const oldTagIds = existingTags.map((r: { id: string }) => r.id);
    if (oldTagIds.length > 0) {
      await db.delete(serviceTags).where(inArray(serviceTags.id, oldTagIds));
    }

    // Insert-before-delete pattern for benefits
    const existingBenefits = await db.select({ id: serviceBenefits.id }).from(serviceBenefits).where(eq(serviceBenefits.serviceId, id));

    if (benefitData.length > 0) {
      await db.insert(serviceBenefits).values(
        benefitData.map((b) => ({ ...b, serviceId: id }))
      );
    }

    const oldBenefitIds = existingBenefits.map((r: { id: string }) => r.id);
    if (oldBenefitIds.length > 0) {
      await db.delete(serviceBenefits).where(inArray(serviceBenefits.id, oldBenefitIds));
    }

    revalidatePath('/admin/services');
    updateTag('services');
    return { success: true };
  } catch (error) {
    console.error('Failed to update service:', error);
    return { error: 'Failed to update service.' };
  }
}

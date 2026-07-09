import { asc, eq } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery } from '../cache';
import { socialLinks as socialLinksTable } from '../schema';
import type { SocialLink } from '../../types';

/**
 * Fetch active social links ordered by display_order.
 */
const fetchSocialLinks = async (): Promise<SocialLink[]> => {
  return safeQuery('getSocialLinksFromDb', async () => {
    const rows = await db
      .select()
      .from(socialLinksTable)
      .where(eq(socialLinksTable.isActive, true))
      .orderBy(asc(socialLinksTable.displayOrder));

    return rows.map((row: typeof socialLinksTable.$inferSelect) => ({
      platform: row.platform as SocialLink['platform'],
      url: row.url,
      label: row.label ?? row.platform,
    }));
  }, []);
};
export const getSocialLinksFromDb = cachedQuery(fetchSocialLinks, ['getSocialLinksFromDb'], { tags: ['social-links'] });
export const getSocialLinksForNav = cachedQuery(fetchSocialLinks, ['getSocialLinksForNav'], { tags: ['nav:globals'] });

/** Fetch all social links (admin — includes inactive). */
export async function getAllSocialLinksAdmin(): Promise<(typeof socialLinksTable.$inferSelect)[]> {
  return db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.displayOrder));
}

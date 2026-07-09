import { desc, eq } from 'drizzle-orm';
import { db } from '../index';
import {
  socialMediaPosts as socialMediaPostsTable,
  blogPosts as blogPostsTable,
  projects as projectsTable,
  projectSites as sitesTable,
} from '../schema';

/** Fetch all social media posts (admin). */
export async function getAllSocialMediaPostsAdmin() {
  return db.select().from(socialMediaPostsTable).orderBy(desc(socialMediaPostsTable.createdAt));
}

/** Fetch a single social media post by ID (admin). */
export async function getSocialMediaPostByIdAdmin(id: string) {
  const rows = await db.select().from(socialMediaPostsTable).where(eq(socialMediaPostsTable.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Fetch source options (blog posts, projects, sites) for social post form dropdowns. */
export async function getSocialPostSourceOptions() {
  const [blogRows, projectRows, siteRows] = await Promise.all([
    db.select({ id: blogPostsTable.id, titleEn: blogPostsTable.titleEn, titleZh: blogPostsTable.titleZh })
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt)),
    db.select({ id: projectsTable.id, titleEn: projectsTable.titleEn, titleZh: projectsTable.titleZh })
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt)),
    db.select({ id: sitesTable.id, titleEn: sitesTable.titleEn, titleZh: sitesTable.titleZh })
      .from(sitesTable)
      .orderBy(desc(sitesTable.createdAt)),
  ]);
  return { blogRows, projectRows, siteRows };
}

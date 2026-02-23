import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import BlogPostForm from '../BlogPostForm';
import { createBlogPost } from '@/app/actions/admin/blog';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function NewBlogPostPage() {
  // Fetch available projects for the dropdown
  const projectRows = await db
    .select({ id: projects.id, titleEn: projects.titleEn, titleZh: projects.titleZh })
    .from(projects)
    .orderBy(desc(projects.createdAt));

  return (
    <div>
      <AdminPageHeader titleKey="blog.newBlogPost" backHref="/admin/blog" backLabelKey="nav.blog" />
      <BlogPostForm action={createBlogPost} submitLabel="Create Post" projects={projectRows} />
    </div>
  );
}

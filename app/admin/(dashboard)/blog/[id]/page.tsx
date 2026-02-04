import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import BlogPostForm from '../BlogPostForm';
import { updateBlogPost } from '@/app/actions/admin/blog';
import { NAVY } from '@/lib/theme';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  const post = rows[0];
  if (!post) notFound();

  const boundAction = updateBlogPost.bind(null, id);

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Edit Blog Post
      </h1>
      <BlogPostForm
        action={boundAction}
        submitLabel="Update Post"
        initialData={{
          slug: post.slug,
          titleEn: post.titleEn,
          titleZh: post.titleZh,
          excerptEn: post.excerptEn ?? '',
          excerptZh: post.excerptZh ?? '',
          contentEn: post.contentEn,
          contentZh: post.contentZh,
          featuredImageUrl: post.featuredImageUrl ?? '',
          author: post.author ?? '',
          seoKeywords: post.seoKeywords ?? '',
          isPublished: post.isPublished,
          publishedAt: post.publishedAt?.toISOString().split('T')[0] ?? '',
        }}
      />
    </div>
  );
}

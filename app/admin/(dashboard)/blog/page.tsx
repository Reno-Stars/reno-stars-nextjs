import Link from 'next/link';
import { getAllBlogPostsAdmin } from '@/lib/db/queries';
import BlogListClient from './BlogListClient';
import { NAVY, GOLD } from '@/lib/theme';

export default async function BlogAdminPage() {
  const posts = await getAllBlogPostsAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: GOLD,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          New Post
        </Link>
      </div>
      <BlogListClient posts={posts} />
    </div>
  );
}

import { getAllBlogPostsAdmin } from '@/lib/db/queries';
import BlogListClient from './BlogListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function BlogAdminPage() {
  const posts = await getAllBlogPostsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="blog.title" actionKey="blog.newPost" actionHref="/admin/blog/new" />
      <BlogListClient posts={posts} />
    </div>
  );
}

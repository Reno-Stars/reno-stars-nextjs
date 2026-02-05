import BlogPostForm from '../BlogPostForm';
import { createBlogPost } from '@/app/actions/admin/blog';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewBlogPostPage() {
  return (
    <div>
      <AdminPageHeader titleKey="blog.newBlogPost" />
      <BlogPostForm action={createBlogPost} submitLabel="Create Post" />
    </div>
  );
}

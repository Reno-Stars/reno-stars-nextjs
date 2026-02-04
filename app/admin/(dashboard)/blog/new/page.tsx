import BlogPostForm from '../BlogPostForm';
import { createBlogPost } from '@/app/actions/admin/blog';
import { NAVY } from '@/lib/theme';

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        New Blog Post
      </h1>
      <BlogPostForm action={createBlogPost} submitLabel="Create Post" />
    </div>
  );
}

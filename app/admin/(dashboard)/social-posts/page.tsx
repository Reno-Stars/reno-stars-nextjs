import { getAllSocialMediaPostsAdmin } from '@/lib/db/queries';
import SocialPostListClient from './SocialPostListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function SocialPostsAdminPage() {
  const posts = await getAllSocialMediaPostsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="socialPosts.title" actionKey="socialPosts.newPost" actionHref="/admin/social-posts/new" />
      <SocialPostListClient posts={posts} />
    </div>
  );
}

import { getSocialPostSourceOptions } from '@/lib/db/queries';
import SocialPostForm from '../SocialPostForm';
import { createSocialMediaPost } from '@/app/actions/admin/social-posts';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function NewSocialPostPage() {
  const { blogRows, projectRows, siteRows } = await getSocialPostSourceOptions();

  return (
    <div>
      <AdminPageHeader titleKey="socialPosts.newSocialPost" backHref="/admin/social-posts" backLabelKey="nav.socialPosts" />
      <SocialPostForm
        action={createSocialMediaPost}
        blogPosts={blogRows}
        projects={projectRows}
        sites={siteRows}
        submitLabelKey="createPost"
      />
    </div>
  );
}

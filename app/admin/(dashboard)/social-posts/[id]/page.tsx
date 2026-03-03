import { notFound } from 'next/navigation';
import { getSocialMediaPostByIdAdmin, getSocialPostSourceOptions } from '@/lib/db/queries';
import SocialPostForm from '../SocialPostForm';
import { updateSocialMediaPost } from '@/app/actions/admin/social-posts';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSocialPostPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch post and source options in parallel
  const [post, { blogRows, projectRows, siteRows }] = await Promise.all([
    getSocialMediaPostByIdAdmin(id),
    getSocialPostSourceOptions(),
  ]);

  if (!post) notFound();

  const boundAction = updateSocialMediaPost.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="socialPosts.editSocialPost" backHref="/admin/social-posts" backLabelKey="nav.socialPosts" />
      <SocialPostForm
        action={boundAction}
        blogPosts={blogRows}
        projects={projectRows}
        sites={siteRows}
        submitLabelKey="updatePost"
        initialData={{
          titleEn: post.titleEn,
          titleZh: post.titleZh,
          instagramCaptionEn: post.instagramCaptionEn,
          instagramCaptionZh: post.instagramCaptionZh,
          instagramHashtagsEn: post.instagramHashtagsEn,
          instagramHashtagsZh: post.instagramHashtagsZh,
          facebookCaptionEn: post.facebookCaptionEn,
          facebookCaptionZh: post.facebookCaptionZh,
          facebookHashtagsEn: post.facebookHashtagsEn,
          facebookHashtagsZh: post.facebookHashtagsZh,
          xiaohongshuCaptionZh: post.xiaohongshuCaptionZh,
          xiaohongshuCaptionEn: post.xiaohongshuCaptionEn,
          xiaohongshuTopicTagsZh: post.xiaohongshuTopicTagsZh,
          selectedImageUrls: Array.isArray(post.selectedImageUrls)
            ? (post.selectedImageUrls as unknown[]).filter((u): u is string => typeof u === 'string')
            : [],
          blogPostId: post.blogPostId,
          projectId: post.projectId,
          siteId: post.siteId,
          status: post.status,
          scheduledAt: post.scheduledAt?.toISOString() ?? null,
          notes: post.notes,
        }}
      />
    </div>
  );
}

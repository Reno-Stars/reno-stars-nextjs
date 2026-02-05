import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { socialLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import SocialLinkForm from '../SocialLinkForm';
import { updateSocialLink } from '@/app/actions/admin/social-links';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSocialLinkPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const rows = await db.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
  const socialLink = rows[0];
  if (!socialLink) notFound();

  const boundAction = updateSocialLink.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="socialLinks.editSocialLink" />
      <SocialLinkForm
        action={boundAction}
        initialData={{
          platform: socialLink.platform,
          url: socialLink.url,
          label: socialLink.label ?? '',
          displayOrder: socialLink.displayOrder,
          isActive: socialLink.isActive,
        }}
      />
    </div>
  );
}

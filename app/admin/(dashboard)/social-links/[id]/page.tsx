import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { socialLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import SocialLinkForm from '../SocialLinkForm';
import { updateSocialLink } from '@/app/actions/admin/social-links';
import { NAVY } from '@/lib/theme';

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
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Edit Social Link
      </h1>
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

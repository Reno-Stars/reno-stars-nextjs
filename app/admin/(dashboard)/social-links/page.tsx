import { getAllSocialLinksAdmin } from '@/lib/db/queries';
import SocialLinksListClient from './SocialLinksListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function SocialLinksAdminPage() {
  const socialLinks = await getAllSocialLinksAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="socialLinks.title" />
      <SocialLinksListClient socialLinks={socialLinks} />
    </div>
  );
}

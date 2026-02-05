import { getAllSocialLinksAdmin } from '@/lib/db/queries';
import SocialLinksListClient from './SocialLinksListClient';
import { NAVY } from '@/lib/theme';

export default async function SocialLinksAdminPage() {
  const socialLinks = await getAllSocialLinksAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Social Links</h1>
      </div>
      <SocialLinksListClient socialLinks={socialLinks} />
    </div>
  );
}

import { getAboutSectionsAdmin } from '@/lib/db/queries';
import AboutForm from './AboutForm';
import { NAVY } from '@/lib/theme';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function AboutAdminPage() {
  const about = await getAboutSectionsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="about.title" />
      {about ? (
        <AboutForm about={about} />
      ) : (
        <p style={{ color: NAVY }}>No about sections found. Run db:seed first.</p>
      )}
    </div>
  );
}

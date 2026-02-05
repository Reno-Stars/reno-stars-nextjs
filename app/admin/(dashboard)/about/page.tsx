import { getAboutSectionsAdmin } from '@/lib/db/queries';
import AboutForm from './AboutForm';
import { NAVY } from '@/lib/theme';

export default async function AboutAdminPage() {
  const about = await getAboutSectionsAdmin();

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        About Sections
      </h1>
      {about ? (
        <AboutForm about={about} />
      ) : (
        <p style={{ color: NAVY }}>No about sections found. Run db:seed first.</p>
      )}
    </div>
  );
}

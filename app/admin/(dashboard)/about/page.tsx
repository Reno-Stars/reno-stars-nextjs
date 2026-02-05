import { db } from '@/lib/db';
import { aboutSections } from '@/lib/db/schema';
import AboutForm from './AboutForm';
import { NAVY } from '@/lib/theme';

export default async function AboutAdminPage() {
  const rows = await db.select().from(aboutSections).limit(1);
  const about = rows[0] ?? null;

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

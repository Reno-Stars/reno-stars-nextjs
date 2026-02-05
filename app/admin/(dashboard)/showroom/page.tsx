import { db } from '@/lib/db';
import { showroomInfo } from '@/lib/db/schema';
import ShowroomForm from './ShowroomForm';
import { NAVY } from '@/lib/theme';

export default async function ShowroomAdminPage() {
  const rows = await db.select().from(showroomInfo).limit(1);
  const showroom = rows[0] ?? null;

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Showroom Info
      </h1>
      {showroom ? (
        <ShowroomForm showroom={showroom} />
      ) : (
        <p style={{ color: NAVY }}>No showroom info found. Run db:seed first.</p>
      )}
    </div>
  );
}

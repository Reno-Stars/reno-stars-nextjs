import { getShowroomInfoAdmin } from '@/lib/db/queries';
import ShowroomForm from './ShowroomForm';
import { NAVY } from '@/lib/theme';

export default async function ShowroomAdminPage() {
  const showroom = await getShowroomInfoAdmin();

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

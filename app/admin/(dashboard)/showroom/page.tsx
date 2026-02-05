import { getShowroomInfoAdmin } from '@/lib/db/queries';
import ShowroomForm from './ShowroomForm';
import { NAVY } from '@/lib/theme';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function ShowroomAdminPage() {
  const showroom = await getShowroomInfoAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="showroom.title" />
      {showroom ? (
        <ShowroomForm showroom={showroom} />
      ) : (
        <p style={{ color: NAVY }}>No showroom info found. Run db:seed first.</p>
      )}
    </div>
  );
}

import SiteForm from '@/components/admin/SiteForm';
import { createSite } from '@/app/actions/admin/sites';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getAllServiceAreasAdmin } from '@/lib/db/queries';

export default async function NewSitePage() {
  const serviceAreas = await getAllServiceAreasAdmin();
  const cities = serviceAreas.map((area) => ({
    nameEn: area.nameEn,
    nameZh: area.nameZh,
  }));

  return (
    <div>
      <AdminPageHeader titleKey="sites.newSite" />
      <SiteForm
        action={createSite}
        cities={cities}
        submitLabel="Create Site"
      />
    </div>
  );
}

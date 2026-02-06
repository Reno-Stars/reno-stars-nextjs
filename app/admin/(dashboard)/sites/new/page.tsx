import SiteForm from '@/components/admin/SiteForm';
import { createSite } from '@/app/actions/admin/sites';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewSitePage() {
  return (
    <div>
      <AdminPageHeader titleKey="sites.newSite" />
      <SiteForm
        action={createSite}
        submitLabel="Create Site"
      />
    </div>
  );
}

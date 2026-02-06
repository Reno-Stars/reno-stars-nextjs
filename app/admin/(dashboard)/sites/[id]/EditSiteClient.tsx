'use client';

import SiteForm from '@/components/admin/SiteForm';
import { updateSite } from '@/app/actions/admin/sites';

interface Props {
  id: string;
  initialData: {
    id: string;
    slug: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    locationCity: string;
    heroImageUrl: string;
    badgeEn: string;
    badgeZh: string;
    showAsProject: boolean;
    featured: boolean;
    isPublished: boolean;
  };
}

export default function EditSiteClient({ id, initialData }: Props) {
  const action = updateSite.bind(null, id);
  return (
    <SiteForm
      action={action}
      initialData={initialData}
      submitLabel="Update Site"
    />
  );
}

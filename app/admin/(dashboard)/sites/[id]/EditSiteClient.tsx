'use client';

import SiteForm from '@/components/admin/SiteForm';
import { updateSite } from '@/app/actions/admin/sites';

interface City {
  nameEn: string;
  nameZh: string;
}

interface Props {
  id: string;
  cities: City[];
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

export default function EditSiteClient({ id, initialData, cities }: Props) {
  const action = updateSite.bind(null, id);
  return (
    <SiteForm
      action={action}
      cities={cities}
      initialData={initialData}
      submitLabel="Update Site"
    />
  );
}

'use client';

import ProjectForm from '@/components/admin/ProjectForm';
import { updateProject } from '@/app/actions/admin/projects';

interface SiteOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface Props {
  id: string;
  initialData: Parameters<typeof ProjectForm>[0]['initialData'];
  sites?: SiteOption[];
}

export default function EditProjectClient({ id, initialData, sites }: Props) {
  const boundAction = updateProject.bind(null, id);

  return (
    <ProjectForm
      action={boundAction}
      initialData={initialData}
      sites={sites}
      submitLabel="Update Project"
    />
  );
}

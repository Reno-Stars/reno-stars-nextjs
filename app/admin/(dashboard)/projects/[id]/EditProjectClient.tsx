'use client';

import ProjectForm from '@/components/admin/ProjectForm';
import { updateProject } from '@/app/actions/admin/projects';

interface HouseOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface Props {
  id: string;
  initialData: Parameters<typeof ProjectForm>[0]['initialData'];
  houses?: HouseOption[];
}

export default function EditProjectClient({ id, initialData, houses }: Props) {
  const boundAction = updateProject.bind(null, id);

  return (
    <ProjectForm
      action={boundAction}
      initialData={initialData}
      houses={houses}
      submitLabel="Update Project"
    />
  );
}

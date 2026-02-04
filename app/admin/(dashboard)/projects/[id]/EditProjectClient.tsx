'use client';

import ProjectForm from '@/components/admin/ProjectForm';
import { updateProject } from '@/app/actions/admin/projects';

interface Props {
  id: string;
  initialData: Parameters<typeof ProjectForm>[0]['initialData'];
}

export default function EditProjectClient({ id, initialData }: Props) {
  const boundAction = updateProject.bind(null, id);

  return (
    <ProjectForm
      action={boundAction}
      initialData={initialData}
      submitLabel="Update Project"
    />
  );
}

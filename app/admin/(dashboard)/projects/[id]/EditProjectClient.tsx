'use client';

import ProjectForm from '@/components/admin/ProjectForm';
import { updateProject } from '@/app/actions/admin/projects';

interface ParentOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface ChildProject {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  childDisplayOrder: number;
}

interface Props {
  id: string;
  initialData: Parameters<typeof ProjectForm>[0]['initialData'];
  wholeHouseProjects?: ParentOption[];
  childProjects?: ChildProject[];
}

export default function EditProjectClient({ id, initialData, wholeHouseProjects, childProjects }: Props) {
  const boundAction = updateProject.bind(null, id);

  return (
    <ProjectForm
      action={boundAction}
      initialData={initialData}
      wholeHouseProjects={wholeHouseProjects}
      childProjects={childProjects}
      submitLabel="Update Project"
    />
  );
}

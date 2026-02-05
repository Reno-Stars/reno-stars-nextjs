import ProjectForm from '@/components/admin/ProjectForm';
import { createProject } from '@/app/actions/admin/projects';
import { db } from '@/lib/db';
import { houses } from '@/lib/db/schema';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function NewProjectPage() {
  // Fetch houses for house selection
  const houseRows = await db.select({
    id: houses.id,
    titleEn: houses.titleEn,
    titleZh: houses.titleZh,
  }).from(houses);

  return (
    <div>
      <AdminPageHeader titleKey="projects.newProject" />
      <ProjectForm
        action={createProject}
        houses={houseRows}
        submitLabel="Create Project"
      />
    </div>
  );
}

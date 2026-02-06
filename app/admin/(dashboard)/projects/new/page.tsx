import ProjectForm from '@/components/admin/ProjectForm';
import { createProject } from '@/app/actions/admin/projects';
import { db } from '@/lib/db';
import { projectSites } from '@/lib/db/schema';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function NewProjectPage() {
  // Fetch sites for site selection (required)
  const siteRows = await db.select({
    id: projectSites.id,
    titleEn: projectSites.titleEn,
    titleZh: projectSites.titleZh,
  }).from(projectSites);

  return (
    <div>
      <AdminPageHeader titleKey="projects.newProject" />
      <ProjectForm
        action={createProject}
        sites={siteRows}
        submitLabel="Create Project"
      />
    </div>
  );
}

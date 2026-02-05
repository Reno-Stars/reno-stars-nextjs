import { getAllProjectsAdmin } from '@/lib/db/queries';
import ProjectsListClient from './ProjectsListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function ProjectsAdminPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="projects.title" actionKey="projects.newProject" actionHref="/admin/projects/new" />
      <ProjectsListClient projects={projects} />
    </div>
  );
}

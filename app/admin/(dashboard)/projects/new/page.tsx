import ProjectForm from '@/components/admin/ProjectForm';
import { createProject } from '@/app/actions/admin/projects';
import { NAVY } from '@/lib/theme';

export default function NewProjectPage() {
  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        New Project
      </h1>
      <ProjectForm action={createProject} submitLabel="Create Project" />
    </div>
  );
}

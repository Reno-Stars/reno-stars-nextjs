import ProjectForm from '@/components/admin/ProjectForm';
import { createProject } from '@/app/actions/admin/projects';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NAVY } from '@/lib/theme';

export default async function NewProjectPage() {
  // Fetch whole house projects for parent selection
  const wholeHouseRows = await db.select({
    id: projects.id,
    titleEn: projects.titleEn,
    titleZh: projects.titleZh,
  }).from(projects).where(eq(projects.isWholeHouse, true));

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        New Project
      </h1>
      <ProjectForm
        action={createProject}
        wholeHouseProjects={wholeHouseRows}
        submitLabel="Create Project"
      />
    </div>
  );
}

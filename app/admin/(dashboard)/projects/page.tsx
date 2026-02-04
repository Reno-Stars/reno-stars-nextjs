import Link from 'next/link';
import { getAllProjectsAdmin } from '@/lib/db/queries';
import ProjectsListClient from './ProjectsListClient';
import { NAVY, GOLD } from '@/lib/theme';

export default async function ProjectsAdminPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Projects</h1>
        <Link
          href="/admin/projects/new"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: GOLD,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          New Project
        </Link>
      </div>
      <ProjectsListClient projects={projects} />
    </div>
  );
}

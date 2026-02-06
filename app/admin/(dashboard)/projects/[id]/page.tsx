import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { projects, type DbProject } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirect old project edit URLs to the new site detail page.
 * Projects are now edited via the House Stack UI on their parent site page.
 */
export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  const rows: DbProject[] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const project = rows[0];
  if (!project) notFound();

  // Redirect to the site detail page
  redirect(`/admin/sites/${project.siteId}`);
}

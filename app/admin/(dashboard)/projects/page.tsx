import { redirect } from 'next/navigation';

/**
 * Redirect old projects listing to sites page.
 * Projects are now managed via the House Stack UI on site detail pages.
 */
export default async function ProjectsAdminPage() {
  redirect('/admin/sites');
}

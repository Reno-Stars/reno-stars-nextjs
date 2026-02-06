import { redirect } from 'next/navigation';

/**
 * Redirect old new project page to sites page.
 * Projects are now created via the House Stack UI on site detail pages.
 */
export default async function NewProjectPage() {
  redirect('/admin/sites');
}

/**
 * /projects/<slug>/ for a SERVICE that has no project category (DI-17).
 *
 * heat-pump-hvac, critical-load-panel and realtor are services but not project
 * categories, so /projects/<service>/ used to 404 — while the service×city
 * "View all projects" link (RelatedProjectsSection) and the project
 * breadcrumb still point there. The project route calls this only AFTER the
 * category, project and site lookups have all missed, so a real category or
 * project with that slug always wins and the redirect steps aside by itself.
 *
 * Returns the service slug to send the visitor to, or null (→ 404 as before).
 */
export function serviceRedirectFor(slug: string, services: readonly { slug: string }[]): string | null {
  return services.some((s) => s.slug === slug) ? slug : null;
}

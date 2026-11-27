/**
 * Lists that render on many pages must have a TOTAL order: with ties on the sort
 * key, Postgres returns tied rows in physical order, so any UPDATE to one row can
 * swap cards/nav items (task 158/163 — basement vs commercial in the nav,
 * hallway vs powder-room on /before-after/). Each tie-break reproduces the order
 * the site showed when it was added.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('order tie-breaks', () => {
  it('services: display_order, then created_at', () => {
    const s = src('lib/db/queries/services.ts');
    expect(s).toContain('.orderBy(asc(servicesTable.displayOrder), asc(servicesTable.createdAt))');
    expect(s).not.toMatch(/\.orderBy\(asc\(servicesTable\.displayOrder\)\);/);
  });

  it('getProjectsFromDb (before-after cards, hub cards, project pools): created_at DESC, display_order_in_site, slug DESC, id DESC', () => {
    const s = src('lib/db/queries/projects.ts');
    const fn = s.slice(s.indexOf('export const getProjectsFromDb'), s.indexOf('export const getProjectsListFromDb'));
    expect(fn).toContain(
      '.orderBy(desc(projectsTable.createdAt), asc(projectsTable.displayOrderInSite), desc(projectsTable.slug), desc(projectsTable.id))',
    );
  });

  it('blog lists: published_at DESC, then created_at DESC, then id DESC (task 165)', () => {
    const s = src('lib/db/queries/blog.ts');
    const n = s.split('.orderBy(desc(blogPostsTable.publishedAt), desc(blogPostsTable.createdAt), desc(blogPostsTable.id))').length - 1;
    expect(n).toBe(2);
    expect(s).not.toMatch(/\.orderBy\(desc\(blogPostsTable\.publishedAt\)\)/);
  });

  /**
   * Pinned AS THEY ARE (task 168): these still sort by created_at only, and no
   * tie-break is added on purpose. getProjectsByAreaFromDb feeds the service×city
   * pages — Test A included — with `.limit(6)`, so a tie-break inside the
   * 2026-08-08 00:16:45 group could swap WHICH projects a Test A page shows
   * (task 166: a slice over a tie changes the set, not just the order). The
   * DB migrations do not update the tied project rows (tied-sort-key skip), so
   * their physical order — and these lists — stay as today. Revisit after test A
   * is read out, together with getProjectsListFromDb and the guide queries.
   */
  it('project list / by-area / guide queries: created_at DESC only (deliberately no tie-break while test A runs)', () => {
    const projects = src('lib/db/queries/projects.ts');
    const list = projects.slice(projects.indexOf('export const getProjectsListFromDb'));
    expect(list).toContain('.orderBy(desc(projectsTable.createdAt));');
    const guides = src('lib/db/queries/guide-projects.ts');
    const byArea = guides.slice(guides.indexOf('export const getProjectsByAreaFromDb'), guides.indexOf("['getProjectsByAreaFromDb']"));
    expect(byArea).toMatch(/\.orderBy\(desc\(projectsTable\.createdAt\)\)/);
    expect(guides.split('.orderBy(desc(projectsTable.createdAt))').length - 1).toBe(6);
  });
});


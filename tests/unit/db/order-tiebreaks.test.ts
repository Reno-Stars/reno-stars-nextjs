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

  it('getProjectsFromDb (before-after cards, project pools): created_at DESC, then id DESC', () => {
    const s = src('lib/db/queries/projects.ts');
    const fn = s.slice(s.indexOf('export const getProjectsFromDb'), s.indexOf('export const getProjectsListFromDb'));
    expect(fn).toContain('.orderBy(desc(projectsTable.createdAt), desc(projectsTable.id))');
  });

  it('blog lists: published_at DESC, then created_at DESC, then id DESC (task 165)', () => {
    const s = src('lib/db/queries/blog.ts');
    const n = s.split('.orderBy(desc(blogPostsTable.publishedAt), desc(blogPostsTable.createdAt), desc(blogPostsTable.id))').length - 1;
    expect(n).toBe(2);
    expect(s).not.toMatch(/\.orderBy\(desc\(blogPostsTable\.publishedAt\)\)/);
  });
});

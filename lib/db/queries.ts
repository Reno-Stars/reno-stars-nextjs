/**
 * Barrel for the DB query layer.
 *
 * The 1977-line monolith was split into per-domain modules under
 * `lib/db/queries/` on 2026-07-09. This file re-exports every domain module
 * so all existing call sites that import from '@/lib/db/queries' keep working
 * unchanged. Shared internal helpers live in `lib/db/map-helpers.ts` and
 * `lib/db/project-mappers.ts`; the cache wrappers live in `lib/db/cache.ts`
 * and `lib/db/cache-fallback.ts`.
 *
 * `groupBy` is the one shared helper imported directly from this barrel by a
 * call site (app/actions/admin/social-posts.ts), so it is re-exported here.
 */

export { groupBy } from './map-helpers';

export * from './queries/company';
export * from './queries/social';
export * from './queries/services';
export * from './queries/projects';
export * from './queries/reviews';
export * from './queries/sites';
export * from './queries/service-areas';
export * from './queries/blog';
export * from './queries/content';
export * from './queries/guide-projects';
export * from './queries/video';
export * from './queries/social-posts';

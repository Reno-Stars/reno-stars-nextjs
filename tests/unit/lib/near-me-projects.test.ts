import { describe, it, expect } from 'vitest';
import { selectNearbyProjects } from '@/lib/near-me-projects';
import type { Project } from '@/lib/types';

/**
 * selectNearbyProjects is what makes the 4 room near-me pages genuinely
 * distinct (real, room-specific project cards) instead of ~99% duplicate
 * bodies. These tests lock in two guarantees:
 *  1. When a room has >= 3 real projects, we show ONLY that room's work.
 *  2. When it doesn't (e.g. basement, which has none), we NEVER fabricate —
 *     we return real recent work flagged `exact: false` so the UI frames it
 *     honestly as related.
 */

function mkProject(over: Partial<Project> & { slug: string }): Project {
  return {
    slug: over.slug,
    title: { en: `${over.slug} title`, zh: `${over.slug} 标题` },
    description: { en: '', zh: '' },
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: over.location_city ?? 'Vancouver',
    images: [],
    hero_image: 'hero' in over ? (over.hero_image as string) : `/img/${over.slug}.jpg`,
    ...over,
  } as Project;
}

describe('selectNearbyProjects', () => {
  const kitchen = Array.from({ length: 5 }, (_, i) =>
    mkProject({ slug: `kitchen-${i}`, service_type: 'kitchen', location_city: 'Richmond' }),
  );
  const bathroom = Array.from({ length: 4 }, (_, i) =>
    mkProject({ slug: `bathroom-${i}`, service_type: 'bathroom' }),
  );
  const all: Project[] = [...kitchen, ...bathroom];

  it('returns only the focal room when >= 3 matches exist (exact: true)', () => {
    const { projects, exact } = selectNearbyProjects(all, 'kitchen', 'en');
    expect(exact).toBe(true);
    expect(projects.every((p) => p.slug.startsWith('kitchen-'))).toBe(true);
  });

  it('caps the grid at 6 cards', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      mkProject({ slug: `k-${i}`, service_type: 'kitchen' }),
    );
    const { projects } = selectNearbyProjects(many, 'kitchen', 'en');
    expect(projects.length).toBe(6);
  });

  it('localizes the card title to the requested locale', () => {
    const { projects } = selectNearbyProjects(all, 'kitchen', 'zh');
    expect(projects[0].title).toContain('标题');
  });

  it('falls back to honest related work when the room has no projects (basement)', () => {
    const { projects, exact } = selectNearbyProjects(all, 'basement', 'en');
    expect(exact).toBe(false);
    // Real projects surfaced, none of them claimed to be basement.
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.length).toBeLessThanOrEqual(6);
  });

  it('falls back when there are fewer than 3 exact matches', () => {
    const sparse: Project[] = [
      mkProject({ slug: 'wh-0', service_type: 'whole-house' }),
      ...kitchen,
    ];
    const { projects, exact } = selectNearbyProjects(sparse, 'whole-house', 'en');
    expect(exact).toBe(false);
    // Related fill excludes the single exact match's slug from duplication but
    // still surfaces real recent work.
    expect(projects.length).toBeGreaterThan(0);
  });

  it('never surfaces a project without a hero image', () => {
    const withMissing: Project[] = [
      ...kitchen,
      mkProject({ slug: 'no-hero', service_type: 'kitchen', hero_image: '' }),
    ];
    const { projects } = selectNearbyProjects(withMissing, 'kitchen', 'en');
    expect(projects.some((p) => p.slug === 'no-hero')).toBe(false);
    expect(projects.every((p) => p.heroImage.length > 0)).toBe(true);
  });

  it('returns an empty exact-false set when there are no usable projects at all', () => {
    const { projects, exact } = selectNearbyProjects([], 'kitchen', 'en');
    expect(projects).toEqual([]);
    expect(exact).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import {
  parseBudgetRange,
  calculateCombinedBudget,
  aggregateDurations,
  mergeServiceScopes,
  collectAllImages,
} from '@/lib/db/helpers';
import type { Project } from '@/lib/types';

// Helper to create a minimal project for testing
function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-id',
    slug: 'test-project',
    title: { en: 'Test Project', zh: '测试项目' },
    description: { en: 'Description', zh: '描述' },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Vancouver',
    hero_image: '/test.jpg',
    images: [],
    featured: false,
    is_whole_house: false,
    child_display_order: 0,
    ...overrides,
  };
}

describe('parseBudgetRange', () => {
  it('should parse a standard budget range', () => {
    const result = parseBudgetRange('$15,000 - $25,000');
    expect(result).toEqual({ min: 15000, max: 25000 });
  });

  it('should parse a single value', () => {
    const result = parseBudgetRange('$50,000');
    expect(result).toEqual({ min: 50000, max: 50000 });
  });

  it('should handle values without dollar sign', () => {
    const result = parseBudgetRange('10000 - 20000');
    expect(result).toEqual({ min: 10000, max: 20000 });
  });

  it('should return null for TBD', () => {
    expect(parseBudgetRange('TBD')).toBeNull();
    expect(parseBudgetRange('tbd')).toBeNull();
  });

  it('should return null for "Call for quote"', () => {
    expect(parseBudgetRange('Call for quote')).toBeNull();
    expect(parseBudgetRange('call us for a quote')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseBudgetRange('')).toBeNull();
  });

  it('should return null for non-numeric strings', () => {
    expect(parseBudgetRange('varies')).toBeNull();
    expect(parseBudgetRange('competitive pricing')).toBeNull();
  });

  it('should handle budgets with different formats', () => {
    const result = parseBudgetRange('$25K - $45K');
    // Only parses explicit numbers, so 25 and 45 are extracted
    expect(result).toEqual({ min: 25, max: 45 });
  });
});

describe('calculateCombinedBudget', () => {
  it('should combine budgets from multiple projects', () => {
    const projects = [
      createMockProject({ budget_range: '$10,000 - $15,000' }),
      createMockProject({ budget_range: '$20,000 - $30,000' }),
    ];
    const result = calculateCombinedBudget(projects);
    expect(result).toBe('$30,000 - $45,000');
  });

  it('should return undefined for projects without budgets', () => {
    const projects = [
      createMockProject({ budget_range: undefined }),
      createMockProject({ budget_range: undefined }),
    ];
    const result = calculateCombinedBudget(projects);
    expect(result).toBeUndefined();
  });

  it('should skip non-numeric budgets', () => {
    const projects = [
      createMockProject({ budget_range: '$10,000 - $15,000' }),
      createMockProject({ budget_range: 'TBD' }),
    ];
    const result = calculateCombinedBudget(projects);
    expect(result).toBe('$10,000 - $15,000');
  });

  it('should return single value when min equals max', () => {
    const projects = [
      createMockProject({ budget_range: '$50,000' }),
    ];
    const result = calculateCombinedBudget(projects);
    expect(result).toBe('$50,000');
  });

  it('should return undefined for empty project array', () => {
    const result = calculateCombinedBudget([]);
    expect(result).toBeUndefined();
  });
});

describe('aggregateDurations', () => {
  it('should sum week-based durations', () => {
    const projects = [
      createMockProject({ duration: { en: '4 weeks', zh: '4周' } }),
      createMockProject({ duration: { en: '6 weeks', zh: '6周' } }),
    ];
    const result = aggregateDurations(projects);
    expect(result).toEqual({ en: '10 weeks total', zh: '共10周' });
  });

  it('should handle "wks" abbreviation', () => {
    const projects = [
      createMockProject({ duration: { en: '3 wks', zh: '3周' } }),
      createMockProject({ duration: { en: '2 weeks', zh: '2周' } }),
    ];
    const result = aggregateDurations(projects);
    expect(result).toEqual({ en: '5 weeks total', zh: '共5周' });
  });

  it('should concatenate non-week durations', () => {
    const projects = [
      createMockProject({ duration: { en: '2 months', zh: '2个月' } }),
      createMockProject({ duration: { en: '3 weeks', zh: '3周' } }),
    ];
    const result = aggregateDurations(projects);
    expect(result).toEqual({ en: '2 months, 3 weeks', zh: '2个月，3周' });
  });

  it('should return undefined for projects without durations', () => {
    const projects = [
      createMockProject({ duration: undefined }),
      createMockProject({ duration: undefined }),
    ];
    const result = aggregateDurations(projects);
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty project array', () => {
    const result = aggregateDurations([]);
    expect(result).toBeUndefined();
  });
});

describe('mergeServiceScopes', () => {
  it('should merge scopes from multiple projects', () => {
    const projects = [
      createMockProject({
        service_scope: { en: ['Demolition', 'Framing'], zh: ['拆除', '框架'] },
      }),
      createMockProject({
        service_scope: { en: ['Plumbing', 'Electrical'], zh: ['水管', '电气'] },
      }),
    ];
    const result = mergeServiceScopes(projects);
    expect(result.en).toContain('Demolition');
    expect(result.en).toContain('Framing');
    expect(result.en).toContain('Plumbing');
    expect(result.en).toContain('Electrical');
    expect(result.en).toHaveLength(4);
  });

  it('should deduplicate scopes', () => {
    const projects = [
      createMockProject({
        service_scope: { en: ['Demolition', 'Framing'], zh: ['拆除', '框架'] },
      }),
      createMockProject({
        service_scope: { en: ['Framing', 'Electrical'], zh: ['框架', '电气'] },
      }),
    ];
    const result = mergeServiceScopes(projects);
    expect(result.en).toHaveLength(3); // Demolition, Framing, Electrical
    expect(result.zh).toHaveLength(3);
  });

  it('should return empty arrays for projects without scopes', () => {
    const projects = [
      createMockProject({ service_scope: undefined }),
      createMockProject({ service_scope: undefined }),
    ];
    const result = mergeServiceScopes(projects);
    expect(result.en).toEqual([]);
    expect(result.zh).toEqual([]);
  });

  it('should return empty arrays for empty project array', () => {
    const result = mergeServiceScopes([]);
    expect(result.en).toEqual([]);
    expect(result.zh).toEqual([]);
  });
});

describe('collectAllImages', () => {
  it('should collect images from parent and children', () => {
    const parent = createMockProject({
      slug: 'parent-project',
      title: { en: 'Parent', zh: '父项目' },
      images: [
        { src: '/parent1.jpg', alt: { en: 'Parent 1', zh: '父1' }, is_before: false },
      ],
    });
    const children = [
      createMockProject({
        slug: 'child1',
        title: { en: 'Child 1', zh: '子1' },
        images: [
          { src: '/child1-1.jpg', alt: { en: 'Child 1-1', zh: '子1-1' }, is_before: false },
        ],
      }),
    ];
    const result = collectAllImages(parent, children);
    expect(result).toHaveLength(2);
    expect(result[0].childSlug).toBe('parent-project');
    expect(result[1].childSlug).toBe('child1');
  });

  it('should add parent images first', () => {
    const parent = createMockProject({
      slug: 'parent',
      title: { en: 'Parent', zh: '父项目' },
      images: [
        { src: '/parent.jpg', alt: { en: 'Parent', zh: '父' }, is_before: false },
      ],
    });
    const children = [
      createMockProject({
        slug: 'child',
        title: { en: 'Child', zh: '子' },
        images: [
          { src: '/child.jpg', alt: { en: 'Child', zh: '子' }, is_before: false },
        ],
      }),
    ];
    const result = collectAllImages(parent, children);
    expect(result[0].src).toBe('/parent.jpg');
    expect(result[1].src).toBe('/child.jpg');
  });

  it('should include childTitle for attribution', () => {
    const parent = createMockProject({
      slug: 'parent',
      title: { en: 'Parent Project', zh: '父项目' },
      images: [
        { src: '/img.jpg', alt: { en: 'Img', zh: '图' }, is_before: false },
      ],
    });
    const result = collectAllImages(parent, []);
    expect(result[0].childTitle).toEqual({ en: 'Parent Project', zh: '父项目' });
  });

  it('should handle empty images', () => {
    const parent = createMockProject({ images: [] });
    const children = [createMockProject({ images: [] })];
    const result = collectAllImages(parent, children);
    expect(result).toHaveLength(0);
  });

  it('should preserve is_before flag', () => {
    const parent = createMockProject({
      slug: 'parent',
      title: { en: 'Parent', zh: '父' },
      images: [
        { src: '/before.jpg', alt: { en: 'Before', zh: '之前' }, is_before: true },
        { src: '/after.jpg', alt: { en: 'After', zh: '之后' }, is_before: false },
      ],
    });
    const result = collectAllImages(parent, []);
    expect(result[0].is_before).toBe(true);
    expect(result[1].is_before).toBe(false);
  });
});

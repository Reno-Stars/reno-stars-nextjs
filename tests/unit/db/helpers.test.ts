import { describe, it, expect } from 'vitest';
import {
  mergeServiceScopes,
  collectAllImages,
  collectAllExternalProducts,
  SITE_IMAGE_SLUG,
} from '@/lib/db/helpers';
import type { Project, Site } from '@/lib/types';

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
    ...overrides,
  };
}

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
  it('should collect images from multiple projects', () => {
    const projects = [
      createMockProject({
        slug: 'project1',
        title: { en: 'Project 1', zh: '项目1' },
        images: [
          { src: '/project1.jpg', alt: { en: 'Project 1', zh: '项目1' }, is_before: false },
        ],
      }),
      createMockProject({
        slug: 'project2',
        title: { en: 'Project 2', zh: '项目2' },
        images: [
          { src: '/project2.jpg', alt: { en: 'Project 2', zh: '项目2' }, is_before: false },
        ],
      }),
    ];
    const result = collectAllImages(projects);
    expect(result).toHaveLength(2);
    expect(result[0].projectSlug).toBe('project1');
    expect(result[1].projectSlug).toBe('project2');
  });

  it('should prepend site images when site is provided', () => {
    const site: Partial<Site> = {
      id: 'site-id',
      slug: 'test-site',
      title: { en: 'Test Site', zh: '测试站点' },
      images: [
        { src: '/site-image.jpg', alt: { en: 'Site Image', zh: '站点图片' }, is_before: false },
      ],
    };
    const projects = [
      createMockProject({
        slug: 'project1',
        title: { en: 'Project 1', zh: '项目1' },
        images: [
          { src: '/project1.jpg', alt: { en: 'Project 1', zh: '项目1' }, is_before: false },
        ],
      }),
    ];
    const result = collectAllImages(projects, site as Site);
    expect(result).toHaveLength(2);
    expect(result[0].src).toBe('/site-image.jpg');
    expect(result[0].projectSlug).toBe(SITE_IMAGE_SLUG);
    expect(result[1].src).toBe('/project1.jpg');
  });

  it('should include projectTitle for attribution', () => {
    const projects = [
      createMockProject({
        slug: 'test-project',
        title: { en: 'Test Project', zh: '测试项目' },
        images: [
          { src: '/img.jpg', alt: { en: 'Img', zh: '图' }, is_before: false },
        ],
      }),
    ];
    const result = collectAllImages(projects);
    expect(result[0].projectTitle).toEqual({ en: 'Test Project', zh: '测试项目' });
  });

  it('should handle empty images', () => {
    const projects = [
      createMockProject({ images: [] }),
      createMockProject({ images: [] }),
    ];
    const result = collectAllImages(projects);
    expect(result).toHaveLength(0);
  });

  it('should preserve is_before flag', () => {
    const projects = [
      createMockProject({
        slug: 'project',
        title: { en: 'Project', zh: '项目' },
        images: [
          { src: '/before.jpg', alt: { en: 'Before', zh: '之前' }, is_before: true },
          { src: '/after.jpg', alt: { en: 'After', zh: '之后' }, is_before: false },
        ],
      }),
    ];
    const result = collectAllImages(projects);
    expect(result[0].is_before).toBe(true);
    expect(result[1].is_before).toBe(false);
  });

  it('should return empty array for empty project array', () => {
    const result = collectAllImages([]);
    expect(result).toHaveLength(0);
  });
});

describe('collectAllExternalProducts', () => {
  it('should collect external products from multiple projects', () => {
    const projects = [
      createMockProject({
        external_products: [
          { url: 'https://example.com/product1', label: { en: 'Product 1', zh: '产品1' } },
        ],
      }),
      createMockProject({
        external_products: [
          { url: 'https://example.com/product2', label: { en: 'Product 2', zh: '产品2' } },
        ],
      }),
    ];
    const result = collectAllExternalProducts(projects);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com/product1');
    expect(result[1].url).toBe('https://example.com/product2');
  });

  it('should deduplicate products by URL', () => {
    const projects = [
      createMockProject({
        external_products: [
          { url: 'https://example.com/product1', label: { en: 'Product 1', zh: '产品1' } },
        ],
      }),
      createMockProject({
        external_products: [
          { url: 'https://example.com/product1', label: { en: 'Product 1 Duplicate', zh: '产品1重复' } },
          { url: 'https://example.com/product2', label: { en: 'Product 2', zh: '产品2' } },
        ],
      }),
    ];
    const result = collectAllExternalProducts(projects);
    expect(result).toHaveLength(2);
    // First occurrence should be kept
    expect(result[0].label).toEqual({ en: 'Product 1', zh: '产品1' });
  });

  it('should include image_url when present', () => {
    const projects = [
      createMockProject({
        external_products: [
          {
            url: 'https://example.com/product1',
            image_url: 'https://example.com/image.jpg',
            label: { en: 'Product 1', zh: '产品1' },
          },
        ],
      }),
    ];
    const result = collectAllExternalProducts(projects);
    expect(result[0].image_url).toBe('https://example.com/image.jpg');
  });

  it('should return empty array for projects without external products', () => {
    const projects = [
      createMockProject({ external_products: undefined }),
      createMockProject({ external_products: undefined }),
    ];
    const result = collectAllExternalProducts(projects);
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty project array', () => {
    const result = collectAllExternalProducts([]);
    expect(result).toHaveLength(0);
  });

  it('should prepend site-level external products before project products', () => {
    const projects = [
      createMockProject({
        external_products: [
          { url: 'https://example.com/project-product', label: { en: 'Project Product', zh: '项目产品' } },
        ],
      }),
    ];
    const site: Partial<Site> = {
      title: { en: 'Test Site', zh: '测试工地' },
      external_products: [
        { url: 'https://example.com/site-product', label: { en: 'Site Product', zh: '工地产品' } },
      ],
    };
    const result = collectAllExternalProducts(projects, site as Site);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com/site-product');
    expect(result[1].url).toBe('https://example.com/project-product');
  });

  it('should deduplicate between site and project external products', () => {
    const projects = [
      createMockProject({
        external_products: [
          { url: 'https://example.com/shared', label: { en: 'Project Label', zh: '项目标签' } },
        ],
      }),
    ];
    const site: Partial<Site> = {
      title: { en: 'Test Site', zh: '测试工地' },
      external_products: [
        { url: 'https://example.com/shared', label: { en: 'Site Label', zh: '工地标签' } },
      ],
    };
    const result = collectAllExternalProducts(projects, site as Site);
    expect(result).toHaveLength(1);
    // Site-level product comes first (wins dedup)
    expect(result[0].label).toEqual({ en: 'Site Label', zh: '工地标签' });
  });
});

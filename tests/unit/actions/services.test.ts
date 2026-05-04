import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper: create a thenable object that also has chainable methods
function thenableChain(arr: unknown[]) {
  const obj: Record<string, unknown> = {
    where: vi.fn().mockImplementation(() => thenableChain(arr)),
    limit: vi.fn().mockImplementation(() => thenableChain(arr)),
    then: (resolve: (v: unknown[]) => void) => Promise.resolve(arr).then(resolve),
  };
  return obj;
}
function thenableArray(arr: unknown[]) {
  return thenableChain(arr);
}

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
      }),
    }),
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => thenableArray([{ value: 0 }])),
    })),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
      }),
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  services: { slug: 'slug', id: 'id' },
  serviceTags: { id: 'id', serviceId: 'serviceId' },
  serviceBenefits: { id: 'id', serviceId: 'serviceId' },
  projects: { serviceId: 'serviceId' },
  contactSubmissions: { preferredServiceId: 'preferredServiceId' },
}));

vi.mock('@/lib/admin/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
  isValidUUID: vi.fn().mockImplementation((id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }),
}));

vi.mock('@/lib/admin/form-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/admin/form-utils')>('@/lib/admin/form-utils');
  return actual;
});

vi.mock('@/lib/utils', () => ({
  ensureUniqueSlug: vi.fn().mockImplementation((slug) => slug),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Import after mocks
const { createService, deleteService, updateService } = await import(
  '@/app/actions/admin/services'
);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    slug: 'test-service',
    titleEn: 'Test Service',
    titleZh: '测试服务',
    descriptionEn: 'English description',
    descriptionZh: '中文描述',
    longDescriptionEn: '',
    longDescriptionZh: '',
    iconUrl: '',
    imageUrl: '',
    displayOrder: '0',
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

describe('Service Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createService', () => {
    it('should reject empty slug', async () => {
      const result = await createService({}, makeFormData({ slug: '' }));
      expect(result.error).toBe('Slug is required.');
    });

    it('should reject invalid slug format', async () => {
      const result = await createService({}, makeFormData({ slug: 'INVALID SLUG!' }));
      expect(result.error).toBe('Slug must contain only lowercase letters, numbers, and hyphens.');
    });

    it('should reject empty titles', async () => {
      const result = await createService({}, makeFormData({ titleEn: '' }));
      expect(result.error).toBe('Titles are required.');
    });

    it('should reject empty descriptions', async () => {
      const result = await createService({}, makeFormData({ descriptionEn: '' }));
      expect(result.error).toBe('Short descriptions are required.');
    });

    it('should reject invalid icon URL', async () => {
      const result = await createService({}, makeFormData({ iconUrl: 'not-a-url' }));
      expect(result.error).toBe('Icon URL is not a valid URL.');
    });

    it('should reject invalid image URL', async () => {
      const result = await createService({}, makeFormData({ imageUrl: 'not-a-url' }));
      expect(result.error).toBe('Image URL is not a valid URL.');
    });

    it('should reject negative display order', async () => {
      const result = await createService({}, makeFormData({ displayOrder: '-1' }));
      expect(result.error).toBe('Display order must be a non-negative number.');
    });

    it('should reject tags exceeding length limit', async () => {
      const fd = makeFormData();
      fd.set('tags[0].en', 'a'.repeat(201));
      fd.set('tags[0].zh', 'Valid');
      const result = await createService({}, fd);
      expect(result.error).toMatch(/exceeds 200 characters/);
    });

    it('should reject ZH tags exceeding length limit', async () => {
      const fd = makeFormData();
      fd.set('tags[0].en', 'Valid');
      fd.set('tags[0].zh', 'z'.repeat(201));
      const result = await createService({}, fd);
      expect(result.error).toMatch(/exceeds 200 characters/);
    });

    it('should accept valid tags', async () => {
      const { redirect } = await import('next/navigation');
      const fd = makeFormData();
      fd.set('tags[0].en', 'Floor Installation');
      fd.set('tags[0].zh', '地板安装');
      fd.set('tags[1].en', 'Plumbing');
      fd.set('tags[1].zh', '管道');
      await createService({}, fd);
      expect(redirect).toHaveBeenCalledWith('/admin/services');
    });

    it('should skip empty EN tags', async () => {
      const { redirect } = await import('next/navigation');
      const fd = makeFormData();
      fd.set('tags[0].en', '');
      fd.set('tags[0].zh', 'Chinese only');
      fd.set('tags[1].en', 'Valid');
      fd.set('tags[1].zh', '有效');
      await createService({}, fd);
      expect(redirect).toHaveBeenCalledWith('/admin/services');
    });

    it('should redirect on success', async () => {
      const { redirect } = await import('next/navigation');
      await createService({}, makeFormData());
      expect(redirect).toHaveBeenCalledWith('/admin/services');
    });
  });

  describe('deleteService', () => {
    it('should reject invalid UUID', async () => {
      const result = await deleteService('not-a-uuid');
      expect(result.error).toBe('Invalid service ID.');
    });

    it('should delete with valid UUID when no references exist', async () => {
      const result = await deleteService(VALID_UUID);
      expect(result.error).toBeUndefined();
    });
  });

  describe('updateService', () => {
    it('should reject invalid UUID', async () => {
      const result = await updateService('not-a-uuid', {}, makeFormData());
      expect(result.error).toBe('Invalid service ID.');
    });

    it('should reject empty titles', async () => {
      const result = await updateService(VALID_UUID, {}, makeFormData({ titleEn: '' }));
      expect(result.error).toBe('Titles are required.');
    });

    it('should reject empty descriptions', async () => {
      const result = await updateService(VALID_UUID, {}, makeFormData({ descriptionEn: '' }));
      expect(result.error).toBe('Short descriptions are required.');
    });

    it('should reject invalid icon URL', async () => {
      const result = await updateService(VALID_UUID, {}, makeFormData({ iconUrl: 'not-a-url' }));
      expect(result.error).toBe('Icon URL is not a valid URL.');
    });

    it('should reject invalid image URL', async () => {
      const result = await updateService(VALID_UUID, {}, makeFormData({ imageUrl: 'not-a-url' }));
      expect(result.error).toBe('Image URL is not a valid URL.');
    });

    it('should reject tags exceeding length limit', async () => {
      const fd = makeFormData();
      fd.set('tags[0].en', 'a'.repeat(201));
      fd.set('tags[0].zh', 'Valid');
      const result = await updateService(VALID_UUID, {}, fd);
      expect(result.error).toMatch(/exceeds 200 characters/);
    });

    it('should update with valid data', async () => {
      const result = await updateService(VALID_UUID, {}, makeFormData());
      expect(result.success).toBe(true);
    });

    it('should call ensureUniqueSlug with current slug for collision handling', async () => {
      const { ensureUniqueSlug } = await import('@/lib/utils');
      const { db } = await import('@/lib/db');

      // Mock select().from() to return current slug, then conflicting slugs
      const selectMock = vi.mocked(db.select);
      let callCount = 0;
      selectMock.mockImplementation(() => ({
        from: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // First call: fetch current service's slug
            return thenableChain([{ slug: 'existing-slug' }]);
          }
          // Second call: fetch conflicting slugs
          return thenableChain([{ slug: 'existing-slug' }, { slug: 'existing-slug-2' }]);
        }),
      }) as ReturnType<typeof db.select>);

      await updateService(VALID_UUID, {}, makeFormData({ slug: 'existing-slug' }));

      expect(ensureUniqueSlug).toHaveBeenCalledWith(
        'existing-slug',
        ['existing-slug', 'existing-slug-2'],
        'existing-slug'
      );
    });
  });
});

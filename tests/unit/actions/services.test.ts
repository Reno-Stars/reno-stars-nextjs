import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper: create a thenable object that also has chainable methods
function thenableArray(arr: unknown[]) {
  const obj = {
    where: vi.fn().mockResolvedValue(arr),
    then: (resolve: (v: unknown[]) => void) => Promise.resolve(arr).then(resolve),
  };
  return obj;
}

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
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

    it('should update with valid data', async () => {
      const result = await updateService(VALID_UUID, {}, makeFormData());
      expect(result.success).toBe(true);
    });
  });
});

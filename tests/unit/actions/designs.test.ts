import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
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
    transaction: vi.fn().mockImplementation(async (fn) => {
      const tx = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      };
      await fn(tx);
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  designs: {},
}));

vi.mock('@/lib/admin/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
  isValidUUID: vi.fn().mockImplementation((id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Import after mocks
const {
  createDesignItem,
  updateDesignItem,
  deleteDesignItem,
  toggleDesignItemPublished,
  reorderDesignItems
} = await import('@/app/actions/admin/designs');

describe('Design Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDesignItem', () => {
    it('should reject empty image URL', async () => {
      const formData = new FormData();
      formData.set('imageUrl', '');
      formData.set('displayOrder', '0');

      const result = await createDesignItem({}, formData);
      expect(result.error).toBe('Image URL is required.');
    });

    it('should reject invalid image URL', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'not-a-valid-url');
      formData.set('displayOrder', '0');

      const result = await createDesignItem({}, formData);
      expect(result.error).toBe('Invalid image URL format.');
    });

    it('should reject negative display order', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('displayOrder', '-1');

      const result = await createDesignItem({}, formData);
      expect(result.error).toBe('Display order must be a non-negative number.');
    });

    it('should accept valid data and redirect', async () => {
      const { redirect } = await import('next/navigation');
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('displayOrder', '0');

      await createDesignItem({}, formData);
      expect(redirect).toHaveBeenCalledWith('/admin/designs');
    });

    it('should accept valid relative path URLs', async () => {
      const { redirect } = await import('next/navigation');
      const formData = new FormData();
      formData.set('imageUrl', '/uploads/admin/image.jpg');
      formData.set('displayOrder', '0');

      await createDesignItem({}, formData);
      expect(redirect).toHaveBeenCalledWith('/admin/designs');
    });
  });

  describe('updateDesignItem', () => {
    it('should reject invalid UUID', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('displayOrder', '0');

      const result = await updateDesignItem('not-a-uuid', {}, formData);
      expect(result.error).toBe('Invalid design item ID.');
    });

    it('should update with valid data', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('displayOrder', '1');
      formData.set('titleEn', 'Test Title');

      const result = await updateDesignItem('550e8400-e29b-41d4-a716-446655440000', {}, formData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteDesignItem', () => {
    it('should reject invalid UUID', async () => {
      const result = await deleteDesignItem('not-a-uuid');
      expect(result.error).toBe('Invalid design item ID.');
    });

    it('should delete with valid UUID', async () => {
      const result = await deleteDesignItem('550e8400-e29b-41d4-a716-446655440000');
      expect(result.error).toBeUndefined();
    });
  });

  describe('toggleDesignItemPublished', () => {
    it('should reject invalid UUID', async () => {
      const result = await toggleDesignItemPublished('not-a-uuid', true);
      expect(result.error).toBe('Invalid design item ID.');
    });

    it('should toggle with valid UUID', async () => {
      const result = await toggleDesignItemPublished('550e8400-e29b-41d4-a716-446655440000', true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('reorderDesignItems', () => {
    it('should reject list with invalid UUID', async () => {
      const result = await reorderDesignItems([
        '550e8400-e29b-41d4-a716-446655440000',
        'not-a-uuid',
      ]);
      expect(result.error).toBe('Invalid design item ID in list.');
    });

    it('should reorder with valid UUIDs', async () => {
      const result = await reorderDesignItems([
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty list', async () => {
      const result = await reorderDesignItems([]);
      expect(result.error).toBeUndefined();
    });
  });
});

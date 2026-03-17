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
  galleryItems: {},
}));

vi.mock('@/lib/admin/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
  isValidUUID: vi.fn().mockImplementation((id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }),
}));

vi.mock('@/lib/db/queries', () => ({
  getServicesFromDb: vi.fn().mockResolvedValue([
    { slug: 'kitchen', title: { en: 'Kitchen', zh: '厨房' } },
    { slug: 'bathroom', title: { en: 'Bathroom', zh: '浴室' } },
    { slug: 'whole-house', title: { en: 'Whole House', zh: '全屋' } },
    { slug: 'commercial', title: { en: 'Commercial', zh: '商业' } },
  ]),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Import after mocks
const {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemPublished,
  reorderGalleryItems
} = await import('@/app/actions/admin/gallery');

describe('Gallery Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGalleryItem', () => {
    it('should reject empty image URL', async () => {
      const formData = new FormData();
      formData.set('imageUrl', '');
      formData.set('category', 'kitchen');
      formData.set('displayOrder', '0');

      const result = await createGalleryItem({}, formData);
      expect(result.error).toBe('Image URL is required.');
    });

    it('should reject invalid image URL', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'not-a-valid-url');
      formData.set('category', 'kitchen');
      formData.set('displayOrder', '0');

      const result = await createGalleryItem({}, formData);
      expect(result.error).toBe('Invalid image URL format.');
    });

    it('should reject invalid category', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('category', 'invalid-category');
      formData.set('displayOrder', '0');

      const result = await createGalleryItem({}, formData);
      expect(result.error).toBe('Invalid category.');
    });

    it('should reject negative display order', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('category', 'kitchen');
      formData.set('displayOrder', '-1');

      const result = await createGalleryItem({}, formData);
      expect(result.error).toBe('Display order must be a non-negative number.');
    });

    it('should accept empty category (nullable)', async () => {
      const { redirect } = await import('next/navigation');
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('category', '');
      formData.set('displayOrder', '0');

      await createGalleryItem({}, formData);
      expect(redirect).toHaveBeenCalledWith('/admin/gallery');
    });

    it('should accept valid relative path URLs', async () => {
      const { redirect } = await import('next/navigation');
      const formData = new FormData();
      formData.set('imageUrl', '/uploads/admin/image.jpg');
      formData.set('category', 'kitchen');
      formData.set('displayOrder', '0');

      // createGalleryItem calls redirect on success, which is mocked
      await createGalleryItem({}, formData);
      expect(redirect).toHaveBeenCalledWith('/admin/gallery');
    });
  });

  describe('updateGalleryItem', () => {
    it('should reject invalid UUID', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('category', 'kitchen');
      formData.set('displayOrder', '0');

      const result = await updateGalleryItem('not-a-uuid', {}, formData);
      expect(result.error).toBe('Invalid gallery item ID.');
    });

    it('should update with valid data', async () => {
      const formData = new FormData();
      formData.set('imageUrl', 'https://example.com/image.jpg');
      formData.set('category', 'bathroom');
      formData.set('displayOrder', '1');
      formData.set('titleEn', 'Test Title');

      const result = await updateGalleryItem('550e8400-e29b-41d4-a716-446655440000', {}, formData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteGalleryItem', () => {
    it('should reject invalid UUID', async () => {
      const result = await deleteGalleryItem('not-a-uuid');
      expect(result.error).toBe('Invalid gallery item ID.');
    });

    it('should delete with valid UUID', async () => {
      const result = await deleteGalleryItem('550e8400-e29b-41d4-a716-446655440000');
      expect(result.error).toBeUndefined();
    });
  });

  describe('toggleGalleryItemPublished', () => {
    it('should reject invalid UUID', async () => {
      const result = await toggleGalleryItemPublished('not-a-uuid', true);
      expect(result.error).toBe('Invalid gallery item ID.');
    });

    it('should toggle with valid UUID', async () => {
      const result = await toggleGalleryItemPublished('550e8400-e29b-41d4-a716-446655440000', true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('reorderGalleryItems', () => {
    it('should reject list with invalid UUID', async () => {
      const result = await reorderGalleryItems([
        '550e8400-e29b-41d4-a716-446655440000',
        'not-a-uuid',
      ]);
      expect(result.error).toBe('Invalid gallery item ID in list.');
    });

    it('should reorder with valid UUIDs', async () => {
      const result = await reorderGalleryItems([
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty list', async () => {
      const result = await reorderGalleryItems([]);
      expect(result.error).toBeUndefined();
    });
  });
});

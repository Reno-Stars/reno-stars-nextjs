import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mutable per-test DB state + call spies (hoisted so the vi.mock factory sees them)
const h = vi.hoisted(() => {
  const projectId = '550e8400-e29b-41d4-a716-446655440000';
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  return {
    insertValues,
    updateSet,
    deleteWhere,
    // Rows returned by db.select().from(projects).where().limit()
    projectRows: [{ id: projectId, slug: 'test-project' }] as unknown[],
    // Rows returned by db.select().from(projectReviews).innerJoin(projects)...
    reviewJoinRows: [{ slug: 'test-project' }] as unknown[],
  };
});

const PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';
const REVIEW_ID = '550e8400-e29b-41d4-a716-446655440001';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(async () => h.projectRows),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(async () => h.reviewJoinRows),
          }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: h.insertValues }),
    update: vi.fn().mockReturnValue({ set: h.updateSet }),
    delete: vi.fn().mockReturnValue({ where: h.deleteWhere }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  projectReviews: {},
  projects: {},
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
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/seo/revalidate-paths', () => ({
  revalidatePathAllLocales: vi.fn(),
}));

// Import after mocks
const { createProjectReview, updateProjectReview, deleteProjectReview } =
  await import('@/app/actions/admin/project-reviews');

function validFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set('authorName', 'Lisa Jung');
  formData.set('rating', '5');
  formData.set('body', 'Amazing kitchen renovation, highly recommend Reno Stars!');
  formData.set('bodyLang', 'en');
  formData.set('reviewDate', '2026-05');
  formData.set('sourceUrl', 'https://maps.google.com/review/123');
  formData.set('ownerResponse', '');
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe('Project Review Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.projectRows = [{ id: PROJECT_ID, slug: 'test-project' }];
    h.reviewJoinRows = [{ slug: 'test-project' }];
  });

  describe('createProjectReview', () => {
    it('should reject invalid project ID', async () => {
      const result = await createProjectReview('not-a-uuid', {}, validFormData());
      expect(result.error).toBe('Invalid project ID.');
    });

    it('should reject empty author name', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ authorName: '   ' }));
      expect(result.error).toBe('Author name is required.');
    });

    it('should reject out-of-range rating', async () => {
      const zero = await createProjectReview(PROJECT_ID, {}, validFormData({ rating: '0' }));
      expect(zero.error).toBe('Rating must be a whole number between 1 and 5.');
      const six = await createProjectReview(PROJECT_ID, {}, validFormData({ rating: '6' }));
      expect(six.error).toBe('Rating must be a whole number between 1 and 5.');
    });

    it('should reject empty review body', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ body: '' }));
      expect(result.error).toBe('Review text is required.');
    });

    it('should reject unsupported review language', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ bodyLang: 'fr' }));
      expect(result.error).toBe('Review language must be "en" or "zh".');
    });

    it('should reject malformed review date', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ reviewDate: 'May 2026' }));
      expect(result.error).toBe('Review date must be in YYYY-MM format.');
    });

    it('should reject impossible month', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ reviewDate: '2026-13' }));
      expect(result.error).toBe('Review date month must be between 01 and 12.');
    });

    it('should reject invalid source URL', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ sourceUrl: 'not a url' }));
      expect(result.error).toBe('Source URL is not a valid URL.');
    });

    it('should return error when project does not exist', async () => {
      h.projectRows = [];
      const result = await createProjectReview(PROJECT_ID, {}, validFormData());
      expect(result.error).toBe('Project not found.');
    });

    it('should insert with month-normalized date and revalidate the project pages', async () => {
      const { updateTag } = await import('next/cache');
      const { revalidatePathAllLocales } = await import('@/lib/seo/revalidate-paths');

      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ reviewDate: '2026-05' }));

      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: PROJECT_ID,
          authorName: 'Lisa Jung',
          rating: 5,
          bodyLang: 'en',
          reviewDate: '2026-05-01',
          sourceUrl: 'https://maps.google.com/review/123',
          ownerResponse: null,
        })
      );
      expect(updateTag).toHaveBeenCalledWith('project:test-project');
      expect(revalidatePathAllLocales).toHaveBeenCalledWith('/projects/test-project');
    });

    it('should normalize a full date to the 1st of the month', async () => {
      const result = await createProjectReview(PROJECT_ID, {}, validFormData({ reviewDate: '2026-05-19' }));
      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ reviewDate: '2026-05-01' })
      );
    });

    it('should store empty optional fields as null', async () => {
      const result = await createProjectReview(
        PROJECT_ID,
        {},
        validFormData({ sourceUrl: '', ownerResponse: '  ' })
      );
      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ sourceUrl: null, ownerResponse: null })
      );
    });
  });

  describe('updateProjectReview', () => {
    it('should reject invalid review ID', async () => {
      const result = await updateProjectReview('not-a-uuid', {}, validFormData());
      expect(result.error).toBe('Invalid review ID.');
    });

    it('should return error when review does not exist', async () => {
      h.reviewJoinRows = [];
      const result = await updateProjectReview(REVIEW_ID, {}, validFormData());
      expect(result.error).toBe('Review not found.');
    });

    it('should update and revalidate the project pages', async () => {
      const { updateTag } = await import('next/cache');
      const { revalidatePathAllLocales } = await import('@/lib/seo/revalidate-paths');

      const result = await updateProjectReview(REVIEW_ID, {}, validFormData({ ownerResponse: 'Thank you!' }));

      expect(result.success).toBe(true);
      expect(h.updateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          authorName: 'Lisa Jung',
          rating: 5,
          reviewDate: '2026-05-01',
          ownerResponse: 'Thank you!',
        })
      );
      expect(updateTag).toHaveBeenCalledWith('project:test-project');
      expect(revalidatePathAllLocales).toHaveBeenCalledWith('/projects/test-project');
    });

    it('should surface validation errors before touching the DB', async () => {
      const result = await updateProjectReview(REVIEW_ID, {}, validFormData({ rating: 'abc' }));
      expect(result.error).toBe('Rating must be a whole number between 1 and 5.');
      expect(h.updateSet).not.toHaveBeenCalled();
    });
  });

  describe('deleteProjectReview', () => {
    it('should reject invalid review ID', async () => {
      const result = await deleteProjectReview('not-a-uuid');
      expect(result.error).toBe('Invalid review ID.');
    });

    it('should return error when review does not exist', async () => {
      h.reviewJoinRows = [];
      const result = await deleteProjectReview(REVIEW_ID);
      expect(result.error).toBe('Review not found.');
      expect(h.deleteWhere).not.toHaveBeenCalled();
    });

    it('should delete and revalidate the project pages', async () => {
      const { updateTag } = await import('next/cache');
      const { revalidatePathAllLocales } = await import('@/lib/seo/revalidate-paths');

      const result = await deleteProjectReview(REVIEW_ID);

      expect(result.error).toBeUndefined();
      expect(h.deleteWhere).toHaveBeenCalled();
      expect(updateTag).toHaveBeenCalledWith('project:test-project');
      expect(revalidatePathAllLocales).toHaveBeenCalledWith('/projects/test-project');
    });
  });
});

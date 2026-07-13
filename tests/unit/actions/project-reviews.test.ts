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
    projectRows: [{ id: projectId, slug: 'test-project', locationCity: 'Richmond' }] as unknown[],
    // Rows returned by db.select().from(serviceAreas).where().limit()
    areaRows: [{ slug: 'richmond' }] as unknown[],
    // Rows returned by db.select().from(projectReviews).leftJoin(projects)...
    reviewJoinRows: [
      { reviewId: '550e8400-e29b-41d4-a716-446655440001', projectId, slug: 'test-project', locationCity: 'Richmond' },
    ] as unknown[],
  };
});

const PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';
const REVIEW_ID = '550e8400-e29b-41d4-a716-446655440001';

vi.mock('@/lib/db', () => {
  // A `.where(...)` result that is BOTH awaitable (the batched serviceAreas IN
  // query awaits it directly) AND has `.limit()` (the single-row lookups).
  const makeResult = (rows: unknown[]) =>
    Object.assign(Promise.resolve(rows), { limit: () => Promise.resolve(rows) });
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockImplementation((table: { __table?: string }) => ({
          where: vi.fn().mockImplementation(() =>
            makeResult(table?.__table === 'service_areas' ? h.areaRows : h.projectRows),
          ),
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockImplementation(() => makeResult(h.reviewJoinRows)),
          }),
        })),
      }),
      insert: vi.fn().mockReturnValue({ values: h.insertValues }),
      update: vi.fn().mockReturnValue({ set: h.updateSet }),
      delete: vi.fn().mockReturnValue({ where: h.deleteWhere }),
    },
  };
});

vi.mock('@/lib/db/schema', () => ({
  projectReviews: { __table: 'project_reviews' },
  projects: { __table: 'projects' },
  serviceAreas: { __table: 'service_areas' },
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
  revalidatePathAllLocalesNoPurge: vi.fn(),
  purgeCloudflarePagesAllLocales: vi.fn(),
}));

// Import after mocks
const { createProjectReview, updateProjectReview, deleteProjectReview } =
  await import('@/app/actions/admin/project-reviews');

function validFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set('projectId', PROJECT_ID);
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
    h.projectRows = [{ id: PROJECT_ID, slug: 'test-project', locationCity: 'Richmond' }];
    h.areaRows = [{ slug: 'richmond' }];
    h.reviewJoinRows = [
      { reviewId: REVIEW_ID, projectId: PROJECT_ID, slug: 'test-project', locationCity: 'Richmond' },
    ];
  });

  describe('createProjectReview', () => {
    it('should reject invalid project ID', async () => {
      const result = await createProjectReview({}, validFormData({ projectId: 'not-a-uuid' }));
      expect(result.error).toBe('Invalid project ID.');
    });

    it('should reject empty author name', async () => {
      const result = await createProjectReview({}, validFormData({ authorName: '   ' }));
      expect(result.error).toBe('Author name is required.');
    });

    it('should reject out-of-range rating', async () => {
      const zero = await createProjectReview({}, validFormData({ rating: '0' }));
      expect(zero.error).toBe('Rating must be a whole number between 1 and 5.');
      const six = await createProjectReview({}, validFormData({ rating: '6' }));
      expect(six.error).toBe('Rating must be a whole number between 1 and 5.');
    });

    it('should reject empty review body', async () => {
      const result = await createProjectReview({}, validFormData({ body: '' }));
      expect(result.error).toBe('Review text is required.');
    });

    it('should reject a language that is not a supported site locale', async () => {
      // 'de' is not one of the 14 site locales; 'fr'/'ja'/'ko' now ARE accepted.
      const result = await createProjectReview({}, validFormData({ bodyLang: 'de' }));
      expect(result.error).toBe('Review language must be a supported site locale.');
    });

    it('should accept a widened locale (e.g. fr) and default source to google', async () => {
      const result = await createProjectReview({}, validFormData({ bodyLang: 'fr' }));
      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ bodyLang: 'fr', source: 'google' }),
      );
    });

    it('should accept and store zh-Hant (7 chars — fits the widened varchar(10) column)', async () => {
      // Regression guard for the mislabeling bug: zh-Hant (Traditional Chinese)
      // was previously dropped by REVIEW_BODY_LANGS' length<=5 filter and the
      // varchar(5) column, so a 繁體 review could only be stored as 'zh'. It must
      // now round-trip verbatim so the card `lang` attr / Schema inLanguage are
      // correct.
      const result = await createProjectReview(
        {},
        validFormData({ bodyLang: 'zh-Hant', body: '真心大推Reno Stars！整個裝修過程非常專業。' }),
      );
      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ bodyLang: 'zh-Hant' }),
      );
    });

    it('should reject an unsupported review source', async () => {
      const result = await createProjectReview({}, validFormData({ source: 'craigslist' }));
      expect(result.error).toBe('Review source is not a supported platform.');
    });

    it('should store a valid non-google source', async () => {
      const result = await createProjectReview({}, validFormData({ source: 'yelp' }));
      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(expect.objectContaining({ source: 'yelp' }));
    });

    it('should reject malformed review date', async () => {
      const result = await createProjectReview({}, validFormData({ reviewDate: 'May 2026' }));
      expect(result.error).toBe('Review date must be in YYYY-MM format.');
    });

    it('should reject impossible month', async () => {
      const result = await createProjectReview({}, validFormData({ reviewDate: '2026-13' }));
      expect(result.error).toBe('Review date month must be between 01 and 12.');
    });

    it('should reject invalid source URL', async () => {
      const result = await createProjectReview({}, validFormData({ sourceUrl: 'not a url' }));
      expect(result.error).toBe('Source URL is not a valid URL.');
    });

    it('should return error when the linked project does not exist', async () => {
      h.projectRows = [];
      const result = await createProjectReview({}, validFormData());
      expect(result.error).toBe('Project not found.');
    });

    it('should insert with month-normalized date and revalidate project, area and hub pages', async () => {
      const { updateTag } = await import('next/cache');
      const { revalidatePathAllLocalesNoPurge, purgeCloudflarePagesAllLocales } =
        await import('@/lib/seo/revalidate-paths');

      const result = await createProjectReview({}, validFormData({ reviewDate: '2026-05' }));

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
      expect(updateTag).toHaveBeenCalledWith('reviews:by-area');
      expect(updateTag).toHaveBeenCalledWith('reviews:hub');
      // ISR origin revalidation uses the NON-trailing-slash route path.
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/projects/test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/areas/richmond');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/reviews');
      // But the Cloudflare edge purge MUST use the TRAILING-SLASH form, because
      // next.config `trailingSlash:true` makes `/en/reviews/` the cached key —
      // purging `/en/reviews` (no slash) is a silent no-op. Regression guard.
      const purgedPaths = (purgeCloudflarePagesAllLocales as unknown as {
        mock: { calls: string[][][] };
      }).mock.calls.at(-1)?.[0];
      expect(purgedPaths).toEqual(
        expect.arrayContaining(['/reviews/', '/projects/test-project/', '/areas/richmond/']),
      );
      for (const p of purgedPaths ?? []) expect(p.endsWith('/')).toBe(true);
    });

    it('should create an UNLINKED review (no projectId) and revalidate only the hub surfaces', async () => {
      const { updateTag } = await import('next/cache');
      const { revalidatePathAllLocalesNoPurge } = await import('@/lib/seo/revalidate-paths');

      const result = await createProjectReview({}, validFormData({ projectId: '' }));

      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: null, authorName: 'Lisa Jung' })
      );
      expect(updateTag).toHaveBeenCalledWith('reviews:hub');
      expect(updateTag).toHaveBeenCalledWith('reviews:by-area');
      expect(updateTag).not.toHaveBeenCalledWith('project:test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/reviews');
      expect(revalidatePathAllLocalesNoPurge).not.toHaveBeenCalledWith('/projects/test-project');
    });

    it('should normalize a full date to the 1st of the month', async () => {
      const result = await createProjectReview({}, validFormData({ reviewDate: '2026-05-19' }));
      expect(result.success).toBe(true);
      expect(h.insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ reviewDate: '2026-05-01' })
      );
    });

    it('should store empty optional fields as null', async () => {
      const result = await createProjectReview(
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
      const { revalidatePathAllLocalesNoPurge } = await import('@/lib/seo/revalidate-paths');

      const result = await updateProjectReview(REVIEW_ID, {}, validFormData({ ownerResponse: 'Thank you!' }));

      expect(result.success).toBe(true);
      expect(h.updateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          authorName: 'Lisa Jung',
          rating: 5,
          reviewDate: '2026-05-01',
          ownerResponse: 'Thank you!',
          projectId: PROJECT_ID,
        })
      );
      expect(updateTag).toHaveBeenCalledWith('project:test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/projects/test-project');
    });

    it('should unlink a review (empty projectId) while still revalidating the OLD project pages', async () => {
      const { revalidatePathAllLocalesNoPurge } = await import('@/lib/seo/revalidate-paths');

      const result = await updateProjectReview(REVIEW_ID, {}, validFormData({ projectId: '' }));

      expect(result.success).toBe(true);
      expect(h.updateSet).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: null })
      );
      // The review used to render on the old project's pages — refresh them.
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/projects/test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/reviews');
    });

    it('should update an UNLINKED review without touching project pages', async () => {
      const { revalidatePathAllLocalesNoPurge } = await import('@/lib/seo/revalidate-paths');
      h.reviewJoinRows = [{ reviewId: REVIEW_ID, projectId: null, slug: null, locationCity: null }];

      const result = await updateProjectReview(REVIEW_ID, {}, validFormData({ projectId: '' }));

      expect(result.success).toBe(true);
      expect(revalidatePathAllLocalesNoPurge).not.toHaveBeenCalledWith('/projects/test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/reviews');
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
      const { revalidatePathAllLocalesNoPurge } = await import('@/lib/seo/revalidate-paths');

      const result = await deleteProjectReview(REVIEW_ID);

      expect(result.error).toBeUndefined();
      expect(h.deleteWhere).toHaveBeenCalled();
      expect(updateTag).toHaveBeenCalledWith('project:test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/projects/test-project');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/reviews');
    });

    it('should delete an UNLINKED review and revalidate the hub', async () => {
      const { updateTag } = await import('next/cache');
      const { revalidatePathAllLocalesNoPurge } = await import('@/lib/seo/revalidate-paths');
      h.reviewJoinRows = [{ reviewId: REVIEW_ID, projectId: null, slug: null, locationCity: null }];

      const result = await deleteProjectReview(REVIEW_ID);

      expect(result.error).toBeUndefined();
      expect(h.deleteWhere).toHaveBeenCalled();
      expect(updateTag).toHaveBeenCalledWith('reviews:hub');
      expect(revalidatePathAllLocalesNoPurge).toHaveBeenCalledWith('/reviews');
      expect(revalidatePathAllLocalesNoPurge).not.toHaveBeenCalledWith('/projects/test-project');
    });
  });
});

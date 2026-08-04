import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The route imports the db proxy and the revalidation helper at module scope.
// Both are mocked so these tests exercise validation and auth without a
// database or Next.js cache runtime.
const dbState: { existing: Array<{ id: string }>; inserted: unknown[]; updated: unknown[] } = {
  existing: [],
  inserted: [],
  updated: [],
};

vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => dbState.existing }) }),
    }),
    insert: () => ({ values: async (v: unknown) => { dbState.inserted.push(v); } }),
    update: () => ({ set: (v: unknown) => ({ where: async () => { dbState.updated.push(v); } }) }),
  },
}));
vi.mock('@/lib/db/schema', () => ({ blogPosts: { id: 'id', slug: 'slug' } }));
vi.mock('drizzle-orm', () => ({ eq: () => 'eq' }));

const refresh = vi.fn();
vi.mock('@/lib/seo/blog-revalidate', () => ({ refreshBlogPost: (s: string) => refresh(s) }));

const SECRET = 'test-secret-value';

async function post(body: unknown, token: string | null = SECRET) {
  const { POST } = await import('@/app/api/blog/route');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token !== null) headers.authorization = `Bearer ${token}`;
  const req = new Request('https://www.reno-stars.com/api/blog', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return POST(req as any);
}

const valid = {
  slug: 'kitchen-reno-guide',
  titleEn: 'Kitchen guide',
  titleZh: '厨房指南',
  contentEn: '<p>en</p>',
  contentZh: '<p>zh</p>',
};

beforeEach(() => {
  dbState.existing = [];
  dbState.inserted = [];
  dbState.updated = [];
  refresh.mockClear();
  process.env.BLOG_API_SECRET = SECRET;
});
afterEach(() => { delete process.env.BLOG_API_SECRET; });

describe('POST /api/blog — auth', () => {
  // Fail closed. An unset secret must never mean "open endpoint" — this is a
  // write path to customer-facing content.
  it('returns 503 when BLOG_API_SECRET is not configured', async () => {
    delete process.env.BLOG_API_SECRET;
    expect((await post(valid)).status).toBe(503);
  });

  it('returns 401 with no Authorization header', async () => {
    expect((await post(valid, null)).status).toBe(401);
  });

  it('returns 401 on a wrong token', async () => {
    expect((await post(valid, 'nope')).status).toBe(401);
  });

  // Guards the timing-safe compare: Buffer lengths must be checked before
  // timingSafeEqual, which throws on a length mismatch.
  it('returns 401 (not 500) when the token length differs from the secret', async () => {
    const res = await post(valid, 'x');
    expect(res.status).toBe(401);
  });

  it('does not write to the database on an auth failure', async () => {
    await post(valid, 'nope');
    expect(dbState.inserted).toHaveLength(0);
    expect(dbState.updated).toHaveLength(0);
  });
});

describe('POST /api/blog — validation', () => {
  it('rejects malformed JSON', async () => {
    expect((await post('{not json')).status).toBe(400);
  });

  it.each(['slug', 'titleEn', 'titleZh', 'contentEn', 'contentZh'])(
    'rejects a payload missing %s',
    async (field) => {
      const body: Record<string, unknown> = { ...valid };
      delete body[field];
      const res = await post(body);
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain(field);
    },
  );

  it('rejects an empty-string required field', async () => {
    expect((await post({ ...valid, titleEn: '   ' })).status).toBe(400);
  });

  // A slug reaches revalidatePath(), which takes a URL path — traversal or a
  // separator must never get that far.
  it.each(['../etc', 'a/b', 'Upper', 'trailing-', 'double--hyphen', ''])(
    'rejects invalid slug %j',
    async (slug) => {
      expect((await post({ ...valid, slug })).status).toBe(400);
    },
  );

  it('rejects localizations that is not an object', async () => {
    expect((await post({ ...valid, localizations: ['a'] })).status).toBe(400);
    expect((await post({ ...valid, localizations: 'x' })).status).toBe(400);
  });

  it('rejects a non-string localization value', async () => {
    const res = await post({ ...valid, localizations: { titleJa: 5 } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('titleJa');
  });
});

describe('POST /api/blog — write behaviour', () => {
  it('creates unpublished by default', async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, created: true, isPublished: false });
    expect(dbState.inserted[0]).toMatchObject({ isPublished: false, publishedAt: null });
  });

  // A truthy string must not publish. This is the difference between a draft
  // and live customer-facing content.
  it.each(['true', 1, {}, 'yes'])('does not publish when isPublished is %j', async (v) => {
    await post({ ...valid, isPublished: v });
    expect(dbState.inserted[0]).toMatchObject({ isPublished: false });
  });

  it('publishes only on a real boolean true, and stamps publishedAt', async () => {
    await post({ ...valid, isPublished: true });
    const row = dbState.inserted[0] as { isPublished: boolean; publishedAt: Date | null };
    expect(row.isPublished).toBe(true);
    expect(row.publishedAt).toBeInstanceOf(Date);
  });

  // The caller is an unattended agent that retries on timeout; a repeat must
  // update rather than duplicate.
  it('updates in place when the slug already exists', async () => {
    dbState.existing = [{ id: 'existing-id' }];
    const res = await post(valid);
    expect((await res.json()).created).toBe(false);
    expect(dbState.inserted).toHaveLength(0);
    expect(dbState.updated).toHaveLength(1);
  });

  it('stores localizations and reports the locale count', async () => {
    const res = await post({
      ...valid,
      localizations: { titleJa: 'x', contentJa: 'y', titleEs: 'z' },
    });
    expect((await res.json()).locales).toBe(3);
    expect(dbState.inserted[0]).toMatchObject({
      localizations: { titleJa: 'x', contentJa: 'y', titleEs: 'z' },
    });
  });

  it('revalidates the slug after a successful write', async () => {
    await post(valid);
    expect(refresh).toHaveBeenCalledWith('kitchen-reno-guide');
  });

  it('ignores unknown fields rather than writing them', async () => {
    await post({ ...valid, notAColumn: 'x', id: 'attacker-chosen' });
    expect(dbState.inserted[0]).not.toHaveProperty('notAColumn');
    expect(dbState.inserted[0]).not.toHaveProperty('id');
  });
});

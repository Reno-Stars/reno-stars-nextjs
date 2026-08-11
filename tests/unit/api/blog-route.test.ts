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
  // Long enough to be publishable. A real article clears the 150-word minimum by
  // an order of magnitude; a one-word fixture silently tested a payload the
  // endpoint must now refuse.
  contentEn: '<p>' + 'renovation cost estimate vancouver kitchen '.repeat(40) + '</p>',
  contentZh: '<p>' + '温哥华 厨房 装修 费用 预算 '.repeat(40) + '</p>',
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
  // Owner decision 2026-08-07: published by default. The endpoint's validation
  // is the gate now, not a human review step.
  it('publishes by default when isPublished is omitted', async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, created: true, isPublished: true });
    const row = dbState.inserted[0] as { isPublished: boolean; publishedAt: Date | null };
    expect(row.isPublished).toBe(true);
    expect(row.publishedAt).toBeInstanceOf(Date);
  });

  it('stages a draft only on an explicit isPublished: false', async () => {
    await post({ ...valid, isPublished: false });
    expect(dbState.inserted[0]).toMatchObject({ isPublished: false, publishedAt: null });
  });

  // Guards the `!== false` comparison: only a real boolean false drafts. A
  // truthy-but-not-false value must not silently prevent publication.
  it.each(['false', 0, null, {}])('publishes when isPublished is %j (not boolean false)', async (v) => {
    await post({ ...valid, isPublished: v });
    expect(dbState.inserted[0]).toMatchObject({ isPublished: true });
  });

  it('updates in place when the slug already exists', async () => {
    dbState.existing = [{ id: 'existing-id' }];
    const res = await post(valid);
    expect((await res.json()).created).toBe(false);
    expect(dbState.inserted).toHaveLength(0);
    expect(dbState.updated).toHaveLength(1);
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

// The first automated post exposed both of these: it was accepted with a 200,
// stored fine, and was unusable — Markdown that renders literally, and 12
// translations keyed so the renderer never reads them.
describe('POST /api/blog — content must be HTML', () => {
  it.each(['contentEn', 'contentZh'])('rejects Markdown headings in %s', async (field) => {
    const res = await post({ ...valid, [field]: '# How Much Does It Cost\n\nSome text.' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Markdown/i);
  });

  it('rejects a Markdown list with no <ul>', async () => {
    const res = await post({ ...valid, contentEn: 'Intro\n- one\n- two' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Markdown/i);
  });

  it('rejects prose with no HTML block element', async () => {
    const res = await post({ ...valid, contentEn: 'Just a bare sentence with no markup.' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/no HTML block element/i);
  });

  it('accepts real HTML', async () => {
    // Padded past the 150-word publish minimum: this case is about the HTML
    // check, not the substance check, and must not trip the latter.
    const body = '<h2>Cost</h2><p>' + 'details about the work '.repeat(50) + '</p>';
    const res = await post({ ...valid, contentEn: body });
    expect(res.status).toBe(200);
  });

  it('applies the same rule to localized content', async () => {
    const res = await post({ ...valid, localizations: { titleJa: 'x', contentJa: '# heading' } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/localizations\.contentJa/);
  });
});

describe('POST /api/blog — localization key shape', () => {
  // The exact failure from the first automated post.
  it('rejects bare locale codes', async () => {
    const res = await post({ ...valid, localizations: { ja: 'x', es: 'y' } });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toMatch(/Unrecognised localizations key/);
    expect(j.error).toContain('ja');
    expect(j.expectedExample).toHaveProperty('titleJa');
  });

  it('rejects an unknown locale suffix', async () => {
    const res = await post({ ...valid, localizations: { titleDe: 'x' } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Unrecognised/);
  });

  it('rejects an unknown field prefix', async () => {
    const res = await post({ ...valid, localizations: { subtitleJa: 'x' } });
    expect(res.status).toBe(400);
  });

  it('rejects a locale with a title but no content', async () => {
    const res = await post({ ...valid, localizations: { titleJa: 'Only a title' } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/title but no content/i);
  });

  it.each(['title', 'content', 'excerpt', 'focusKeyword', 'metaTitle', 'metaDescription'])(
    'accepts the %s field for every locale',
    async (field) => {
      const loc: Record<string, string> = {};
      for (const s of ['Ar','Es','Fa','Fr','Hi','Ja','Ko','Pa','Ru','Tl','Vi','ZhHant']) {
        loc[`${field}${s}`] = field === 'content' ? '<p>x</p>' : 'x';
        if (field !== 'content') loc[`content${s}`] = '<p>x</p>';
      }
      const res = await post({ ...valid, localizations: loc });
      expect(res.status).toBe(200);
    },
  );
});

// 2026-08-08: three placeholder posts ("Test Post", `<p>Test</p>`) were published
// straight to the live blog and reached the sitemap in 24 locale variants. The
// format gate passed them because `<p>Test</p>` IS valid HTML — it checks shape,
// not substance. Publish-by-default means an experimental payload is a live page.
describe('POST /api/blog — a published post must have substance', () => {
  const long = '<p>' + 'word '.repeat(200) + '</p>';

  it('rejects a placeholder that is being published', async () => {
    const res = await post({ ...valid, contentEn: '<p>Test</p>' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toMatch(/at least 150/);
    expect(j.error).toMatch(/isPublished/);   // tells the caller how to stage a draft
  });

  it('rejects the exact payload that shipped: "Test EN"', async () => {
    expect((await post({ ...valid, contentEn: '<p>Test EN</p>' })).status).toBe(400);
  });

  it('ALLOWS a short body when explicitly staged as a draft', async () => {
    const res = await post({ ...valid, contentEn: '<p>Test</p>', isPublished: false });
    expect(res.status).toBe(200);
  });

  it('allows a genuine article', async () => {
    expect((await post({ ...valid, contentEn: long })).status).toBe(200);
  });

  it('counts words in text, not markup — tag soup alone does not pass', async () => {
    const soup = '<div>' + '<span></span>'.repeat(400) + '<p>tiny</p></div>';
    expect((await post({ ...valid, contentEn: soup })).status).toBe(400);
  });
});


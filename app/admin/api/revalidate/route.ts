import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { validateSession } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let paths: string[] = [];
  try {
    const body = await request.json().catch(() => ({}));
    if (Array.isArray(body?.paths)) paths = body.paths;
    else if (typeof body?.path === 'string') paths = [body.path];
  } catch {
    // empty body
  }

  // Explicit paths required. The previous behavior was to fall back to
  // a "sweep" of `['/', '/projects', '/areas', '/blog', '/services']`
  // when no paths were given — that turned a single call into 5 fat
  // revalidations cascading through ISR caches, which was a quiet
  // contributor to the Vercel Write Units bill. Callers must now specify
  // what they need busted.
  if (paths.length === 0) {
    return NextResponse.json(
      { error: 'paths required — pass {"paths": ["/en/blog/foo"]} or {"path": "/en/foo"}' },
      { status: 400 },
    );
  }

  for (const p of paths) revalidatePath(p, p.includes('[') ? 'page' : undefined);

  return NextResponse.json({ ok: true, revalidated: paths });
}

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
    // empty body — fall through to default sweep below
  }

  // No explicit paths — sweep the high-traffic landing pages so a single
  // call after a DB content edit invalidates everything that lists projects.
  if (paths.length === 0) {
    paths = ['/', '/projects', '/areas', '/blog', '/services'];
  }

  for (const p of paths) revalidatePath(p, p.includes('[') ? 'page' : undefined);

  return NextResponse.json({ ok: true, revalidated: paths });
}

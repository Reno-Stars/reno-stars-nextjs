import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { validateSession } from '@/lib/admin/auth';

export async function POST() {
  const isAuth = await validateSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ ok: true, revalidated: true });
}

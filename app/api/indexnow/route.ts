import { NextResponse, type NextRequest } from 'next/server';
import { getBaseUrl } from '@/lib/utils';

const INDEXNOW_KEY = 'deb16e016b38665b452c0ee3f58c1d15';
const BASE_URL = getBaseUrl();

/**
 * POST /api/indexnow — Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam).
 * Body: { urls: string[] }
 * Protected by a simple key check via query param.
 */
export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (key !== INDEXNOW_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const urls: string[] = body.urls || [];

  if (urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
  }

  // Submit to IndexNow API
  const payload = {
    host: new URL(BASE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.map((u) => (u.startsWith('http') ? u : `${BASE_URL}${u}`)),
  };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  return NextResponse.json({
    submitted: payload.urlList.length,
    status: response.status,
    ok: response.ok,
  });
}

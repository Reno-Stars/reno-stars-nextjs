'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { verifyPassword, createSession, destroySession } from '@/lib/admin/auth';

export interface AuthResult {
  error?: string;
}

const LOGIN_ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
// NOTE: In-memory rate limiting does not persist across serverless instances.
// For production use, consider using a persistent store (Redis, database).
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = LOGIN_ATTEMPTS.get(ip);
  if (!entry || now > entry.resetAt) {
    LOGIN_ATTEMPTS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count > MAX_ATTEMPTS) return false;
  entry.count++;
  return entry.count <= MAX_ATTEMPTS;
}

export async function loginAction(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const password = formData.get('password');

  if (!password || typeof password !== 'string') {
    return { error: 'Password is required.' };
  }

  const headersList = await headers();
  const ip = headersList.get('x-real-ip') || headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return { error: 'Too many login attempts. Please try again later.' };
  }

  if (!verifyPassword(password)) {
    return { error: 'Invalid password.' };
  }

  await createSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

'use server';

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { isValidEmail } from '@/lib/utils';
import { sendContactNotification } from '@/lib/email';

/** Contact form input data */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/** Result of contact form submission */
export interface ContactFormResult {
  success: boolean;
  message: string;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/** Max submissions per IP within the time window */
const RATE_LIMIT_MAX = 5;
/** Rate limit window in milliseconds (15 minutes) */
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
/** Max entries in rate limit store to prevent memory exhaustion */
const RATE_LIMIT_MAX_ENTRIES = 10000;

/**
 * In-memory rate limit store. Entries auto-expire via timestamp check.
 *
 * ⚠️ LIMITATION: On serverless platforms (e.g. Vercel), each invocation may
 * use a different isolate, so this provides best-effort protection only.
 *
 * TODO: For production-grade rate limiting, implement one of:
 * - Upstash Redis: https://upstash.com/docs/redis/overall/getstarted
 * - Vercel KV: https://vercel.com/docs/storage/vercel-kv
 * - Cloudflare Rate Limiting (if using Cloudflare)
 *
 * Example with Upstash:
 * ```ts
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, '15 m'),
 * });
 * const { success } = await ratelimit.limit(clientIp);
 * ```
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Evicts expired entries from the rate limit store to prevent memory leaks.
 * Called periodically during rate limit checks.
 */
function evictExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/** Counter to trigger periodic eviction (every 100 checks) */
let checkCounter = 0;

/**
 * Checks if a given key has exceeded the rate limit.
 * Uses a sliding window counter with periodic eviction of expired entries.
 */
function isRateLimited(key: string): boolean {
  // Periodically clean up expired entries, or when approaching max capacity
  if (++checkCounter % 100 === 0 || rateLimitStore.size >= RATE_LIMIT_MAX_ENTRIES) {
    evictExpiredEntries();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // If still at max capacity after eviction, reject to prevent memory exhaustion
    if (rateLimitStore.size >= RATE_LIMIT_MAX_ENTRIES) {
      return true;
    }
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/** Max allowed lengths for form fields */
const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 30,
  message: 5000,
} as const;

/**
 * Strips HTML tags and control characters from a string.
 * Newlines are removed to prevent email header injection via the subject line.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/[\r\n\t]/g, ' ');
}

/**
 * Sanitizes and validates a string field.
 * Trims whitespace and strips HTML tags.
 */
function sanitizeField(value: string, maxLength: number): string {
  return stripHtml(value.trim()).slice(0, maxLength);
}

// ============================================================================
// SUBMIT ACTION
// ============================================================================

/**
 * Get client IP address from request headers.
 * Checks common proxy headers first, falls back to a default key.
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // Check common proxy headers (Vercel, Cloudflare, nginx)
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs; take the first (client)
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headersList.get('x-real-ip');
  if (realIp) return realIp;
  // Vercel-specific header
  const vercelIp = headersList.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();
  // Fallback for local development or unknown proxy
  return 'unknown-ip';
}

/**
 * Submit contact form data.
 * Validates, sanitizes, rate-limits, and saves to database.
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResult> {
  // Validate required fields first (before rate limiting to avoid 'anonymous' key bypass)
  if (!data.name?.trim() || !data.phone?.trim() || !data.message?.trim()) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
    };
  }

  // Rate limit by IP address to prevent spam
  const clientIp = await getClientIp();
  if (isRateLimited(clientIp)) {
    return {
      success: false,
      message: 'Too many submissions. Please try again later.',
    };
  }

  // Validate field lengths before processing
  if (data.name.trim().length > MAX_LENGTHS.name) {
    return {
      success: false,
      message: `Name must be ${MAX_LENGTHS.name} characters or less.`,
    };
  }

  if (data.message.trim().length > MAX_LENGTHS.message) {
    return {
      success: false,
      message: `Message must be ${MAX_LENGTHS.message} characters or less.`,
    };
  }

  // Validate email format if provided
  if (data.email?.trim() && !isValidEmail(data.email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  try {
    // Sanitize all inputs
    const sanitizedName = sanitizeField(data.name, MAX_LENGTHS.name);
    const sanitizedEmail = data.email?.trim()
      ? data.email.trim().toLowerCase().slice(0, MAX_LENGTHS.email)
      : null;
    const sanitizedPhone = sanitizeField(data.phone, MAX_LENGTHS.phone);
    const sanitizedMessage = sanitizeField(data.message, MAX_LENGTHS.message);

    // Save to database
    await db.insert(contactSubmissions).values({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      status: 'new',
    });

    // Send email notification (non-blocking - don't fail form submission if email fails)
    sendContactNotification({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
    }).catch((err) => {
      console.error('Background email notification failed:', err);
    });

    return {
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}

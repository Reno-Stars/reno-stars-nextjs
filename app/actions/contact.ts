'use server';

import { headers } from 'next/headers';
import { waitUntil } from '@vercel/functions';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { propertyTypes, serviceAreas } from '@/lib/db/schema';
import { isValidEmail } from '@/lib/utils';
import { sendContactNotification } from '@/lib/email';
import { createLeadInOdoo, type CrmPropertyType } from '@/lib/clients/crm';
import { recordCrmDeadLetter } from '@/lib/crm-deadletter';

/** Contact form input data */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Slug from service_areas (e.g. "vancouver", "richmond"). Optional. */
  city?: string;
  /** Slug from property_types (e.g. "house", "condo"). Optional. */
  propertyType?: string;
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
// CRM SLUG MAPPING
// ============================================================================

/**
 * Maps a `property_types.slug` (free-form admin-controlled string) to a Twenty
 * CRM `Person.propertyType` enum value. The CRM rejects unknown enum values
 * with a 400, so unmapped slugs fall through to `OTHER` (safest default).
 *
 * Keep in sync with `Person.propertyType` enum in
 * https://github.com/Reno-Stars/reno-stars-crm (Phase B T3).
 */
function mapPropertyTypeSlugToCrm(
  slug: string | null
): CrmPropertyType | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  if (normalized.includes('single') || normalized.includes('house')) {
    return 'SINGLE_FAMILY';
  }
  if (normalized.includes('condo') || normalized.includes('apartment')) {
    return 'CONDO';
  }
  if (normalized.includes('town')) return 'TOWNHOUSE';
  if (normalized.includes('commercial') || normalized.includes('office')) {
    return 'COMMERCIAL';
  }
  return 'OTHER';
}

/**
 * Splits a free-form name into a Twenty Person `{firstName, lastName}` pair.
 * The form has a single "name" input — first whitespace-delimited token becomes
 * firstName, the rest joins as lastName. Single-word names get an empty
 * lastName, which Twenty accepts.
 */
function splitFullName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? name,
    lastName: parts.slice(1).join(' '),
  };
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

    // Look up optional city + property type by slug. Unknown slugs are
    // dropped silently rather than 400'd — the form drives the dropdowns from
    // the DB so a mismatch only happens on direct API calls or stale clients.
    const citySlug = data.city?.trim().toLowerCase().slice(0, 50) || null;
    const propertyTypeSlug =
      data.propertyType?.trim().toLowerCase().slice(0, 50) || null;

    const [areaRow, propertyTypeRow] = await Promise.all([
      citySlug
        ? db
            .select({ id: serviceAreas.id, nameEn: serviceAreas.nameEn })
            .from(serviceAreas)
            .where(eq(serviceAreas.slug, citySlug))
            .limit(1)
        : Promise.resolve([] as { id: string; nameEn: string }[]),
      propertyTypeSlug
        ? db
            .select({ id: propertyTypes.id, nameEn: propertyTypes.nameEn })
            .from(propertyTypes)
            .where(eq(propertyTypes.slug, propertyTypeSlug))
            .limit(1)
        : Promise.resolve([] as { id: string; nameEn: string }[]),
    ]);

    const preferredAreaId = areaRow[0]?.id ?? null;
    const cityNameEn = areaRow[0]?.nameEn ?? null;
    const propertyTypeNameEn = propertyTypeRow[0]?.nameEn ?? null;

    // Task 10 (2026-06-23): Odoo is now the sole CRM system of record for
    // leads. The contact form posts a single `crm.lead/ingest_web_lead` call
    // which dedupes email→phone→name, creates/updates a res.partner, and
    // creates a crm.lead in the Sales pipeline. The Twenty multi-call sequence
    // (createPerson / createNoteOnPerson / createTaskForPerson) is retired.
    //
    // We wrap the call in waitUntil so it runs in the background — the form
    // action returns its success response immediately, and the user doesn't
    // pay the Odoo round-trip latency.
    //
    // On failure the deadletter logs to stderr + alerts Telegram so manual
    // recovery is possible (the alert includes the full payload).
    const { firstName, lastName } = splitFullName(sanitizedName);
    const crmPayload = {
      firstName,
      lastName: lastName || undefined,
      email: sanitizedEmail ?? undefined,
      phone: sanitizedPhone || undefined,
      leadSource: 'OTHER',
      preferredAreaId: preferredAreaId ?? undefined,
      preferredService: undefined as string | undefined,
      propertyType: mapPropertyTypeSlugToCrm(propertyTypeSlug),
      notesFromForm: sanitizedMessage,
    };
    waitUntil(
      (async () => {
        try {
          await createLeadInOdoo(crmPayload);
        } catch (err) {
          await recordCrmDeadLetter(crmPayload, err);
        }
      })()
    );

    // Send email notification in the background. Wrapped in waitUntil() so
    // Vercel keeps the serverless isolate alive until the HTTP call to Resend
    // completes — without it, the fire-and-forget promise was being dropped
    // mid-flight (~30% silent failure rate observed in production).
    waitUntil(
      sendContactNotification({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        city: cityNameEn,
        propertyType: propertyTypeNameEn,
      }).catch((err) => {
        console.error('Background email notification failed:', err);
      })
    );

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

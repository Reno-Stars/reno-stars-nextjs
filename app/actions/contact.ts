'use server';

import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { isValidEmail } from '@/lib/utils';

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

/**
 * In-memory rate limit store. Entries auto-expire via timestamp check.
 * Note: On serverless platforms (e.g. Vercel), each invocation may use a
 * different isolate, so this provides best-effort protection only. For
 * production-grade rate limiting, replace with Upstash Redis or Vercel KV.
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
  // Periodically clean up expired entries
  if (++checkCounter % 100 === 0) {
    evictExpiredEntries();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
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
 * Strips HTML tags from a string to prevent stored XSS.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
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
 * Submit contact form data.
 * Validates, sanitizes, rate-limits, and saves to database.
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResult> {
  // Validate required fields first (before rate limiting to avoid 'anonymous' key bypass)
  if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
    };
  }

  // Rate limit by email to prevent spam
  const rateLimitKey = data.email.toLowerCase().trim();
  if (isRateLimited(rateLimitKey)) {
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

  // Validate email format
  if (!isValidEmail(data.email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  try {
    // Sanitize all inputs
    const sanitizedName = sanitizeField(data.name, MAX_LENGTHS.name);
    const sanitizedEmail = data.email.trim().toLowerCase().slice(0, MAX_LENGTHS.email);
    const sanitizedPhone = data.phone?.trim()
      ? sanitizeField(data.phone, MAX_LENGTHS.phone)
      : null;
    const sanitizedMessage = sanitizeField(data.message, MAX_LENGTHS.message);

    // Save to database
    await db.insert(contactSubmissions).values({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      status: 'new',
    });

    // TODO: Add email notification here when email service is configured
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@reno-stars.com',
    //   to: 'info@reno-stars.com',
    //   subject: `New Contact Form Submission from ${sanitizedName}`,
    //   text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nPhone: ${sanitizedPhone}\n\nMessage:\n${sanitizedMessage}`,
    // });

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

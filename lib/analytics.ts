/**
 * Google Analytics 4 event tracking utilities.
 *
 * Usage:
 *   import { trackEvent, trackFormSubmission, trackPhoneClick } from '@/lib/analytics';
 *
 *   // Generic event
 *   trackEvent('button_click', { button_name: 'cta_hero' });
 *
 *   // Form submission
 *   trackFormSubmission('contact', { service: 'kitchen', area: 'vancouver' });
 *
 *   // Phone click
 *   trackPhoneClick('6048889999');
 */

// Type declarations in types/gtag.d.ts

/**
 * Check if analytics should be enabled.
 * Disabled in development/localhost to avoid polluting production data.
 */
function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.gtag) return false;
  // Skip tracking on localhost and development
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
  return true;
}

/**
 * Track a custom event in GA4.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsEnabled()) return;
  try {
    window.gtag?.('event', eventName, params);
  } catch {
    // Silently ignore errors (e.g., ad blockers, CSP violations)
  }
}

/**
 * Track a form submission event.
 */
export function trackFormSubmission(
  formName: string,
  params?: Record<string, string | number | boolean>
): void {
  trackEvent('form_submission', {
    form_name: formName,
    ...params,
  });
}

/**
 * Track a phone number click event.
 * Also fires a Google Ads conversion if AW conversion ID/label are set.
 */
export function trackPhoneClick(phoneNumber: string): void {
  trackEvent('phone_click', {
    phone_number: phoneNumber,
  });

  // Also fire Google Ads call conversion
  const awId = process.env.NEXT_PUBLIC_AW_CONVERSION_ID;
  const awLabel = process.env.NEXT_PUBLIC_AW_CALL_CONVERSION_LABEL;
  if (awId && awLabel && isAnalyticsEnabled()) {
    try {
      window.gtag?.('event', 'conversion', {
        send_to: `${awId}/${awLabel}`,
      });
    } catch {
      // Silently ignore
    }
  }
}

/**
 * Track an external link click (e.g., product links, social media).
 */
export function trackExternalLinkClick(url: string, linkType?: string): void {
  trackEvent('external_link_click', {
    link_url: url,
    link_type: linkType ?? 'external',
  });
}

/**
 * Track a CTA button click.
 */
export function trackCtaClick(ctaName: string, location?: string): void {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: location ?? 'unknown',
  });
}

/**
 * Track project/gallery view.
 */
export function trackProjectView(projectSlug: string, projectTitle?: string): void {
  trackEvent('project_view', {
    project_slug: projectSlug,
    project_title: projectTitle ?? '',
  });
}

/**
 * Track blog article view.
 */
export function trackBlogView(articleSlug: string, articleTitle?: string): void {
  trackEvent('blog_view', {
    article_slug: articleSlug,
    article_title: articleTitle ?? '',
  });
}

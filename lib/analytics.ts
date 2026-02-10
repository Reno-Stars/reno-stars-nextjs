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
 * Track a custom event in GA4.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }
  try {
    window.gtag('event', eventName, params);
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
 */
export function trackPhoneClick(phoneNumber: string): void {
  trackEvent('phone_click', {
    phone_number: phoneNumber,
  });
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

import type { Locale, BlogPost } from '../types';
import { getLocalizedBlogPost, type LocalizedBlogPost } from './index';
import { resolveBlogDates } from '../blog-dates';

/**
 * What the blog CLIENT component (`BlogPostPage`, 'use client') actually
 * renders: ONE locale's copy plus the few locale-free fields it shows.
 *
 * DI-19 (2026-11-24): the route used to pass the whole `BlogPost` — title,
 * excerpt, content and alt text in all 14 locales — and every client prop is
 * serialised into the page's RSC flight data. /en/blog/renovate-vs-move-
 * vancouver-2026/ carried ~470 KB of RSC, mostly the other 13 languages'
 * bodies, on every request. Localising on the server ships one language.
 *
 * Dates are resolved here with the same `resolveBlogDates` the component used
 * to call on the full post (and the route uses for the JSON-LD), so the
 * visible "Published / Updated" labels are unchanged.
 */
export interface BlogPostView extends LocalizedBlogPost {
  featured_image?: string;
  author?: string;
  /** ISO 8601, from resolveBlogDates — see lib/blog-dates.ts. */
  datePublished?: string;
  /** ISO 8601, only for a genuine admin content edit — see lib/blog-dates.ts. */
  dateModified?: string;
}

export function toBlogPostView(post: BlogPost, locale: Locale): BlogPostView {
  const { datePublished, dateModified } = resolveBlogDates(post);
  return {
    ...getLocalizedBlogPost(post, locale),
    featured_image: post.featured_image,
    author: post.author,
    datePublished,
    dateModified,
  };
}

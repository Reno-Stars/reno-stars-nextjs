import sanitizeHtml, { type IOptions } from 'sanitize-html';
import { marked } from 'marked';

/**
 * Sanitize options used for service/blog/area long-form content.
 * Allows standard prose tags + images, strips scripts and inline event handlers.
 */
export const PROSE_SANITIZE_OPTIONS: IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'loading'],
  },
};

/**
 * Convert markdown (or HTML) string to safe HTML for `dangerouslySetInnerHTML`.
 * `marked` passes existing HTML through unchanged, so accepts both formats.
 */
export function renderProseHtml(content: string): string {
  return sanitizeHtml(
    marked.parse(content, { async: false }) as string,
    PROSE_SANITIZE_OPTIONS,
  );
}

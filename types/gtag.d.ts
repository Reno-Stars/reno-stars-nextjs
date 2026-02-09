/**
 * Google Analytics 4 gtag.js type declarations.
 */

interface GtagParams {
  page_path?: string;
  page_title?: string;
  [key: string]: unknown;
}

interface Window {
  gtag?: (
    command: 'event' | 'config' | 'js',
    targetId: string | Date,
    params?: GtagParams
  ) => void;
  dataLayer?: unknown[];
}

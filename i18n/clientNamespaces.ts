/**
 * Message namespaces shipped to the client on EVERY page.
 *
 * This is the layout's own client subtree — Navbar, Footer, the language
 * switcher and the route-level error boundary. They are shared chrome, so
 * their strings cannot be scoped to a page.
 *
 * It is NOT a hand-picked list. `client-namespace-scope.test.ts` recomputes
 * the layout's closure from source and fails if this drifts from it.
 *
 * Keep it small on purpose: every entry lands in the RSC payload of all ~13k
 * pages, in all 14 locales, on every request (the site is `force-dynamic`).
 * These eight total ~10 KB. The pre-2026-08-26 layout shipped the WHOLE
 * catalog — ~296 KB — because it passed `getMessages()` through a blocklist
 * that only removed 11 server-only namespaces.
 *
 * Everything else is page-scoped via `<ClientMessages ns={[...]}>`.
 *
 * A trap worth knowing: Navbar and Footer call `useTranslations()` with NO
 * namespace and then fully-qualified keys (`t('nav.home')`). A scan that only
 * looks for `useTranslations('literal')` misses them entirely, concludes the
 * layout needs nothing, and ships a site whose every page renders "nav.home"
 * and "footer.quickLinks" as visible text. That happened while this change was
 * being written; the render diff against a baseline build is what caught it.
 */
export const SHELL_NAMESPACES = [
  'common',
  'filter',
  'footer',
  'label',
  'nav',
  'section',
  'services',
  'stats',
] as const;

import type { Locale } from '@/i18n/config';
import type { ServiceType } from '@/lib/types';

/**
 * Mapping from service-slug → corresponding /guides/<slug>/ cost-guide URL.
 *
 * The cost-guide pages exist under app/[locale]/guides/<slug>/page.tsx and sit at
 * striking-distance positions (pos 8-14) for high-impression cost queries:
 *   "kitchen renovation cost", "bathroom renovation cost", "renovation costs vancouver",
 *   "average cost of kitchen remodel", "vanity renovation cost", etc.
 *
 * Cross-linking from the matching service page passes internal-link equity to lift
 * the cost-guides into top-7. Only services with a guide here render the cross-link
 * section in ServiceDetailPage; others (`flooring`, `painting`) currently have no
 * dedicated guide and will not render a dead link.
 *
 * Per the 2026-05-27T2045Z corrected diagnostic in the hub repo
 * (data/seo-agent-diagnostics/2026-05-27T2045Z-striking-distance-cluster-...) —
 * internal-link lift from related-traffic pages is the recommended SEO approach
 * (option 4 of that diagnostic).
 *
 * To add a new mapping: add the kebab-case service-slug here pointing at the matching
 * /guides/.../page.tsx URL. Keep the values as literal string literals so the next-intl
 * Link's typed-route assertion in ServiceDetailPage continues to type-check.
 */
// 2026-06-25: Top city blog post slugs per service. Shown in the "Areas We
// Serve" section to pass PageRank from the generic service page to city cluster
// blog posts and provide a crawlable hub for "[service] renovation [city]".
// Ordered by estimated search volume (Vancouver > Burnaby > Richmond > Surrey…).
export const SERVICE_CITY_BLOG_LINKS: Partial<Record<ServiceType, Array<{ city: string; slug: string }>>> = {
  kitchen: [
    { city: 'Vancouver', slug: 'kitchen-renovation-vancouver-bc-2026' },
    { city: 'Burnaby', slug: 'kitchen-renovation-burnaby-2026' },
    { city: 'Richmond', slug: 'kitchen-renovation-richmond-bc-2026' },
    { city: 'Surrey', slug: 'kitchen-renovation-surrey-bc-2026' },
    { city: 'Coquitlam', slug: 'kitchen-renovation-coquitlam-bc-2026' },
    { city: 'North Vancouver', slug: 'kitchen-renovation-north-vancouver-2026' },
    { city: 'West Vancouver', slug: 'kitchen-renovation-west-vancouver-2026' },
    { city: 'Langley', slug: 'kitchen-renovation-langley-bc-2026' },
  ],
  bathroom: [
    { city: 'Vancouver', slug: 'average-bathroom-renovation-cost-vancouver' },
    { city: 'Burnaby', slug: 'burnaby-bathroom-renovation-guide-2026' },
    { city: 'Richmond', slug: 'bathroom-renovation-cost-richmond-bc-2026' },
    { city: 'Surrey', slug: 'bathroom-renovation-surrey-bc-2026' },
    { city: 'Coquitlam', slug: 'bathroom-renovation-coquitlam-bc-2026' },
    { city: 'North Vancouver', slug: 'bathroom-renovations-north-vancouver-2026' },
    { city: 'West Vancouver', slug: 'bathroom-renovations-west-vancouver-2026' },
    { city: 'Langley', slug: 'bathroom-renovation-langley-2026' },
  ],
  'accessible-bathroom': [
    { city: 'Vancouver', slug: 'average-bathroom-renovation-cost-vancouver' },
    { city: 'Burnaby', slug: 'burnaby-bathroom-renovation-guide-2026' },
    { city: 'Richmond', slug: 'bathroom-renovation-cost-richmond-bc-2026' },
    { city: 'Surrey', slug: 'bathroom-renovation-surrey-bc-2026' },
    { city: 'North Vancouver', slug: 'bathroom-renovations-north-vancouver-2026' },
    { city: 'West Vancouver', slug: 'bathroom-renovations-west-vancouver-2026' },
  ],
  basement: [
    { city: 'Vancouver', slug: 'basement-renovation-vancouver-complete-guide' },
    { city: 'Burnaby', slug: 'basement-renovations-burnaby-2026' },
    { city: 'Richmond', slug: 'basement-renovation-richmond-bc-2026' },
    { city: 'Surrey', slug: 'basement-renovations-surrey' },
    { city: 'Coquitlam', slug: 'basement-renovations-coquitlam-2026' },
    { city: 'North Vancouver', slug: 'basement-renovations-north-vancouver' },
    { city: 'West Vancouver', slug: 'basement-renovation-west-vancouver-2026' },
    { city: 'Langley', slug: 'basement-renovations-langley' },
  ],
  'whole-house': [
    { city: 'Vancouver', slug: 'vancouver-home-renovation-guide-2026' },
    { city: 'Burnaby', slug: 'burnaby-home-renovation-guide-2026' },
    { city: 'Richmond', slug: 'richmond-home-renovation-guide-2026' },
    { city: 'Surrey', slug: 'surrey-home-renovation-guide-2026' },
    { city: 'Coquitlam', slug: 'coquitlam-home-renovation-guide-2026' },
    { city: 'North Vancouver', slug: 'north-vancouver-home-renovation-guide-2026' },
    { city: 'West Vancouver', slug: 'west-vancouver-home-renovation-guide-2026' },
    { city: 'Langley', slug: 'langley-home-renovation-guide-2026' },
    { city: 'Delta', slug: 'delta-home-renovation-guide-2026' },
    { city: 'Maple Ridge', slug: 'maple-ridge-home-renovation-guide-2026' },
    { city: 'New Westminster', slug: 'new-westminster-home-renovation-guide-2026' },
    { city: 'Port Coquitlam', slug: 'port-coquitlam-home-renovation-guide-2026' },
    { city: 'Port Moody', slug: 'port-moody-home-renovation-guide-2026' },
    { city: 'White Rock', slug: 'white-rock-home-renovation-guide-2026' },
  ],
};

export const COST_GUIDE_BY_SERVICE_SLUG: Partial<Record<ServiceType, string>> = {
  kitchen: '/guides/kitchen-renovation-cost-vancouver',
  bathroom: '/guides/bathroom-renovation-cost-vancouver',
  basement: '/guides/basement-renovation-cost-vancouver',
  'whole-house': '/guides/whole-house-renovation-cost-vancouver',
  cabinet: '/guides/cabinet-refinishing-cost-vancouver',
  commercial: '/guides/commercial-renovation-cost-vancouver',
  // Note: a `flooring` mapping was added in PR #77 (commit 8f2477c) pointing
  // at /blog/hardwood-flooring-vancouver-installation-cost-2026 — but
  // /services/flooring/ does NOT exist in the services DB (404), so the
  // mapping was unreachable dead code. Removed in this PR's fix-forward.
  // If a flooring service page is added to the DB later, restore the entry.
};

/**
 * Service-slug → /X-renovation-near-me/ programmatic landing page. Added on
 * the seo/daily-2026-06-02 daily branch after a 2026-05-31 route-inbound
 * audit found the four `*-renovation-near-me/` pages (kitchen, bathroom,
 * basement, whole-house) had ZERO body-content inbound links site-wide.
 * These pages are EXPLICITLY designed for high-intent "X renovation near
 * me" search queries — leaving them un-linked from the service-page cluster
 * was a major SEO gap.
 *
 * ServiceDetailPage is the highest-equity surface to link from (9 services
 * × 14 locales). The /<X>-renovation-near-me/ page is the topical twin of
 * the /services/<X>/ page (same service, different search-intent framing),
 * so cross-linking them passes maximum PageRank equity.
 *
 * Only the 4 mapped slugs render a link. cabinet + commercial don't have
 * matching near-me pages (lower local-search demand).
 *
 * To add a mapping: pair the kebab-case service-slug with the matching
 * /<X>-renovation-near-me/ URL literal. Keep values as literal string
 * literals so the next-intl Link's typed-route assertion type-checks.
 */
export const NEAR_ME_BY_SERVICE_SLUG: Partial<Record<ServiceType, string>> = {
  kitchen: '/kitchen-renovation-near-me',
  bathroom: '/bathroom-renovation-near-me',
  basement: '/basement-renovation-near-me',
  'whole-house': '/whole-house-renovation-near-me',
};

// Per-locale copy for the Cost Guide cross-link section. Only render when an entry
// exists for the current locale — avoids the PR #69 raw-key-leak class of bug
// (where next-intl returns the namespaced key on miss). Locales covered: the same
// 8 that the AnswerBlock i18n backfill landed (en/zh/zh-Hant/ja/ko/es/fr/ru); other
// locales gracefully skip the section until proper translations land.
export const COST_GUIDE_LINK_COPY: Partial<Record<Locale, { heading: string; subtitle: string; cta: string }>> = {
  en: {
    heading: 'See the {service} cost guide',
    subtitle: 'Real Vancouver pricing tiers, project examples, and what drives cost — all in one place.',
    cta: 'View cost guide',
  },
  zh: {
    heading: '查看{service}费用指南',
    subtitle: '真实的温哥华价位分层、项目案例与费用驱动因素一站汇总。',
    cta: '查看费用指南',
  },
  'zh-Hant': {
    heading: '查看{service}費用指南',
    subtitle: '真實的溫哥華價位分層、項目案例與費用驅動因素一站匯總。',
    cta: '查看費用指南',
  },
  ja: {
    heading: '{service}の費用ガイドを見る',
    subtitle: 'バンクーバーの実勢価格帯、施工事例、費用の主な決定要因を一つにまとめて掲載。',
    cta: '費用ガイドを見る',
  },
  ko: {
    heading: '{service} 비용 가이드 보기',
    subtitle: '밴쿠버 실제 가격대, 프로젝트 사례, 비용 결정 요인을 한 곳에 정리.',
    cta: '비용 가이드 보기',
  },
  es: {
    heading: 'Ver la guía de costos de {service}',
    subtitle: 'Niveles de precios reales de Vancouver, ejemplos de proyectos y los factores que más influyen en el costo, todo en un solo lugar.',
    cta: 'Ver guía de costos',
  },
  fr: {
    heading: 'Consulter le guide des coûts {service}',
    subtitle: 'Tranches de prix réelles à Vancouver, exemples de projets et facteurs qui influencent le coût, regroupés au même endroit.',
    cta: 'Voir le guide des coûts',
  },
  ru: {
    heading: 'Смотреть гид по стоимости: {service}',
    subtitle: 'Реальные ценовые уровни Ванкувера, примеры проектов и факторы, влияющие на стоимость — всё в одном месте.',
    cta: 'Открыть гид по стоимости',
  },
};

import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService } from '@/lib/data/services';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import { BreadcrumbSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { buildOptimizedUrl, buildSrcSet, isR2Url, buildProcessedUrl, buildProcessedSrcSet } from '@/lib/image';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string }>;
}

/**
 * Price ranges in CAD per service slug — fed into ServiceSchema's
 * `hasOfferCatalog.priceSpecification` so Google can render a price snippet
 * on SERP listings.
 *
 * 2026-05-04 update: bumped minimums to defensible Vancouver Metro 2026
 * floors. Old numbers (kitchen $14K, whole-house $50K) were below real
 * project minimums — risked customer expectation mismatch and underbid
 * leads. Sourced from current BC contractor labour rates ($85–150/hr
 * trades + WSBC/insurance overhead), 2026 material costs, and competitor
 * floor pricing on HomeStars / RenovationFind / Houzz Vancouver.
 *
 * Per-tier breakdowns live in long_description (cost-guide tables).
 */
const SERVICE_PRICE_RANGES: Record<string, { min: number; max: number } | undefined> = {
  kitchen: { min: 25000, max: 150000 },        // refresh→luxury; high-end can hit $300K+
  bathroom: { min: 20000, max: 80000 },        // powder→luxury ensuite; spa builds $120K+
  basement: { min: 50000, max: 200000 },       // basic finish→legal suite + premium ensuite
  'whole-house': { min: 150000, max: 800000 }, // smallest meaningful reno→full-home; luxury $1.5M+
  commercial: { min: 50000, max: 500000 },     // small refresh→full restaurant/clinic build-out
  cabinet: { min: 4000, max: 30000 },          // spray refinish→full custom replacement
  flooring: { min: 8000, max: 35000 },         // bumped from $5K
  painting: { min: 5000, max: 20000 },         // bumped from $3K
};


// FULLY DYNAMIC — every request runs the Lambda fresh, bypassing the
// Next 16 prerender-shell regression that was returning URL-encoded
// segment templates as params for non-prerendered locale URLs.
//
// Trade-off: every request is a Lambda invocation (no edge cache for
// the response HTML). Vercel function quota cost ~1 invocation per page
// view; on a renovation marketing site this is well within budget. EN
// pages STILL get the prerender boost via the parent [locale] layout's
// generateStaticParams (en/zh/zh-Hant), but the page-level HTML always
// runs through the Lambda.
//
// Why not `dynamicParams = true` + multi-locale generateStaticParams:
// confirmed via debug3 logs on 2026-05-04 deploy b6oujjk9v —
// non-prerendered locales hit a "shell" prerender at the route template
// path with URL-encoded segment templates as params, which fails in
// `services.find(s => s.slug === '[service-slug]')` and triggers
// notFound(). Single-locale generateStaticParams (matching working
// /projects/[slug] /blog/[slug] /areas/[city]) was insufficient to
// suppress the shell. force-dynamic is the only reliable workaround.
//
// `safeFaq()` below is a separate defensive fix for `faqT(`${slug}.q1`)`
// throwing MISSING_MESSAGE on new services before their FAQ keys land.

export const dynamic = 'force-dynamic';

/**
 * EN-only H1 overrides for service pages where GSC shows striking-distance
 * ranking on "{service} renovation vancouver" queries but the DB-driven H1
 * lacks any geo modifier. Source data: 2026-06-01 GSC scan
 * (data/seo-scans/2026-06-01/gsc-striking-distance.json on hub) shows:
 *   - basement: 373 imp/28d combined at pos 13.1-19.4 (3 queries)
 *
 * Mirrors the AreaPage `enAreaH1Overrides` pattern. EN-only so we don't
 * override the localized titles for zh/ja/etc. where the DB title is
 * already region-appropriate.
 */
const enServiceH1Overrides: Partial<Record<string, string>> = {
  basement: 'Basement Renovation in Vancouver — Legal Suites, Waterproofing & Permits',
  // 2026-06-23: add Vancouver geo-modifier to align H1 with title tags.
  // Without override the H1 is the DB title_en ("Kitchen Renovation") — no
  // geo signal. Meta titles correctly read "Kitchen/Bathroom Renovation
  // Vancouver". H1/title consistency improves relevance signals.
  kitchen: 'Kitchen Renovation Vancouver — Custom Cabinetry, Countertops & Full Remodels',
  bathroom: 'Bathroom Renovation Vancouver — Custom Tile, Waterproofing & Full Bath Remodels',
  // 2026-06-24: Whole-house + commercial H1s flagged by on-page scanner
  // (on-page-7646195cb828, on-page-739a04eac24c) — same weak-H1 geo-gap pattern
  // as kitchen/bathroom above. Meta titles read "Whole House Renovation Vancouver
  // — 3-Yr Warranty" and "Commercial Renovation Vancouver — 3-Yr Warranty", so
  // H1s must carry "Vancouver" to align local relevance signals.
  'whole-house': 'Whole-House Renovation Vancouver — Kitchens, Bathrooms & Full Home Remodels',
  commercial: 'Commercial Renovation Vancouver — Offices, Retail & Restaurant Build-Outs',
  // Cabinet refacing H1 "Cabinet Refacing" is bare — add geo + differentiator.
  cabinet: 'Cabinet Refacing Vancouver — Refinishing, Resurfacing & Hardware Upgrades',
  // 2026-06-24: H1 "Heat Pump Installation" is bare — scanner flagged missing
  // descriptive context and geo signal (op-34b0f8ce1f). Override adds service
  // detail + Vancouver geo to match meta title "Heat Pump Installation Vancouver".
  'heat-pump-hvac': 'Heat Pump Installation Vancouver — Ductless Mini-Splits, HVAC & Energy Rebates',
  // 2026-06-24: "poly b replacement vancouver" (146 imp, pos 18.8) — H1 is bare
  // "Poly-B Pipe Replacement" with no Vancouver geo signal. Meta title correctly
  // reads "Poly-B Pipe Replacement Vancouver" but H1/title mismatch weakens
  // local relevance. Adding Vancouver geo + descriptors to close the gap.
  'poly-b-replacement': 'Poly-B Pipe Replacement Vancouver — PEX Re-pipe, Permit & Inspection',
};

function getServiceH1Override(serviceSlug: string, locale: Locale): string | undefined {
  if (locale !== 'en') return undefined;
  return enServiceH1Overrides[serviceSlug];
}

/**
 * EN meta description overrides for service main pages. The DB long_description
 * values are too long and get truncated mid-sentence by truncateMetaDescription(),
 * producing descriptions ending in "..." — poor for CTR and SERP snippet quality.
 * These overrides are complete sentences ≤160 chars.
 * Source: 2026-06-23 on-page scanner (Tick 441).
 */
const enServiceMetaDescriptions: Partial<Record<string, string>> = {
  kitchen:    'Vancouver kitchen renovations — cabinetry, countertops, tile, plumbing & electrical. $5M insured, 3-yr workmanship warranty. Free quote.',
  bathroom:   'Vancouver bathroom renovations — waterproofing, custom tile, showers, soaker tubs & vanities. $5M insured, 3-yr warranty. Free quote.',
  // 2026-06-24: "basement renovation vancouver" (121 imp, pos 18.8) + "vancouver
  // basement renovations" (58 imp, pos 15.4) — description started with "Metro
  // Vancouver basement renovations" but query form is "Vancouver basement
  // renovations" / "basement renovation Vancouver". Moved Vancouver to front.
  basement:   'Vancouver basement renovations — rec rooms, legal suites, home gyms & home theatres. Metro-wide service. Permits handled. $5M insured, 3-yr warranty.',
  'whole-house': 'Vancouver whole-house renovations — kitchens, bathrooms, flooring & all trades under one contract. $5M CGL, 3-yr warranty. Free quote.',
  commercial: 'Commercial renovation Metro Vancouver — offices, retail, restaurants & clinics. BC Building Code compliant. $5M insured. Free estimate.',
  // 2026-06-24: GSC striking-distance gsc-3c0d3aad7adf — "poly b replacement
  // vancouver" striking-distance. Description now surfaces "poly-b replacement"
  // + "vancouver" + insurance motivation up front, matching query intent.
  'poly-b-replacement': 'Poly-B replacement in Metro Vancouver — full PEX re-pipe, BC permit + inspection included. Required by most BC insurers for homes built 1985–1997. Free quote.',
};

/**
 * ZH meta description overrides — resolves cross-locale-f21f1b4470f3 &
 * cross-locale-6e4bf56fdd76 (scanner found /zh/services/kitchen/ and
 * /zh/services/whole-house/ with no optimised meta description).
 * DB long_description_zh starts with markdown links that strip to
 * "Vancouver 厨房装修 — 根据一份合同…" — valid but not keyword-optimised.
 * These overrides use the same complete-sentence / CTA pattern as EN.
 * Tick 485 — 2026-06-24.
 */
const zhServiceMetaDescriptions: Partial<Record<string, string>> = {
  kitchen:       '温哥华厨房翻新 — 定制橱柜、石英台面、瓷砖、管道及电气一站式服务。500万保险，3年工艺保修。Metro Vancouver全区服务。免费报价。',
  bathroom:      '温哥华浴室翻新 — 防水工程、定制瓷砖、淋浴间及浴缸安装。500万保险，3年工艺保修。Metro Vancouver全区服务。免费报价。',
  basement:      'Metro Vancouver地下室翻新 — 娱乐室、合法套间、家庭影院一条龙。代办许可证申请。500万保险，3年保修。免费报价。',
  'whole-house': '温哥华全屋翻新 — 厨房、浴室、地板及各工种统一合同，单一项目经理统筹全程。500万保险，3年保修。Metro Vancouver全区。免费报价。',
  // 2026-06-26 Tick 663: GSC zh service page CTR audit — three services missing zh overrides,
  // falling back to truncated long_description_zh (starts with English "Vancouver" or mid-sentence cut).
  // heat-pump-hvac: 200 zh imp / 1.5% CTR (worst). cabinet: 79 imp truncated to "...翻新 8K-18K 加元，完全定制更换 20K...".
  // poly-b-replacement: 49 imp / 4.1% CTR, short zh description. Prices from services.description_zh DB column.
  'heat-pump-hvac':    '温哥华热泵安装与空调升级 — 告别燃气炉，冬暖夏凉，符合BC Hydro退税资格，代办申请全程跟进。500万保险，3年保修，Metro Vancouver全区上门。免费报价。',
  cabinet:             '温哥华橱柜翻新 — 喷漆整修$4K–$8K，换门板$8K–$18K，全定制更换$20K–$50K。一站式设计安装，500万保险，3年工艺保修。免费报价。',
  'poly-b-replacement':'Metro Vancouver Poly-B水管更换 — 1985–1997年BC省住宅常见，管道老化漏水风险高。全屋换PEX管道，含许可证验收，多数BC保险公司要求更换。免费报价。',
};

/**
 * ZH-HANT meta description overrides — Traditional Chinese (Taiwan/HK audience).
 * Cross-locale scanner (2026-06-26 tick 670) detected zh-Hant service pages
 * serving simplified-Chinese descriptions because zh-Hant fell through to
 * truncateMetaDescription(long_description_zh_hant) which is simplified.
 * CTR for zh-Hant is 8.93% — highest-converting locale. Fixing the language
 * mismatch with clean Traditional Chinese overrides matching the en/zh pattern.
 * Prices and facts mirror the zh overrides (same source); only character set
 * and vocabulary converted to Traditional Chinese.
 */
const zhHantServiceMetaDescriptions: Partial<Record<string, string>> = {
  kitchen:       '溫哥華廚房翻新 — 訂製櫥櫃、石英檯面、磁磚、管道及電氣一站式服務。500萬保險，3年工藝保固。Metro Vancouver全區。免費報價。',
  bathroom:      '溫哥華浴室翻新 — 防水工程、訂製磁磚、淋浴間及浴缸安裝。500萬保險，3年工藝保固。Metro Vancouver全區。免費報價。',
  basement:      'Metro Vancouver地下室翻新 — 娛樂室、合法套間、家庭影院一條龍。代辦許可證申請。500萬保險，3年保固。免費報價。',
  'whole-house': '溫哥華全屋翻新 — 廚房、浴室、地板及各工種統一合約，單一專案經理統籌全程。500萬保險，3年保固。Metro Vancouver全區。免費報價。',
  cabinet:       '溫哥華橱櫃翻新 — 噴漆整修$4K–$8K，換門板$8K–$18K，全定製更換$20K–$50K。500萬保險，3年工藝保固。免費報價。',
  'heat-pump-hvac':    '溫哥華熱泵安裝與空調升級 — 符合BC Hydro退稅資格，全程代辦申請。500萬保險，3年保固，Metro Vancouver全區。免費報價。',
  'poly-b-replacement':'Metro Vancouver Poly-B水管更換 — 1985–1997年BC省住宅常見，全屋換PEX管道，含許可證驗收，多數BC保險公司要求更換。免費報價。',
};

/**
 * KO meta description overrides — Korean audience (ko CTR 8.57%).
 * Cross-locale scanner (2026-06-26 tick 671) found ko service pages serving
 * English "Vancouver — 3-Yr Warranty" in titles and machine-translated
 * truncated long_description_ko as descriptions. No koServiceMetaDescriptions
 * constant existed. Fix follows same pattern as zh/zh-Hant overrides.
 * Korean titles from DB (localizations->>'titleKo') are already in Korean;
 * only the geo+warranty suffix and description were non-Korean.
 */
const koServiceMetaDescriptions: Partial<Record<string, string>> = {
  kitchen:             '밴쿠버 주방 리노베이션 — 맞춤형 캐비닛, 쿼츠 상판, 타일, 배관·전기 일괄 시공. 500만 보험, 3년 공법 보증. Metro Vancouver 전 지역. 무료 견적.',
  bathroom:            '밴쿠버 욕실 리노베이션 — 방수 공사, 맞춤형 타일, 샤워부스·욕조 설치. 500만 보험, 3년 공법 보증. Metro Vancouver 전 지역. 무료 견적.',
  basement:            'Metro Vancouver 지하실 리노베이션 — 엔터테인먼트 룸, 합법 스위트, 홈시어터 일괄 시공. 허가 대행. 500만 보험, 3년 보증. 무료 견적.',
  'whole-house':       '밴쿠버 전체 주택 리노베이션 — 주방·욕실·바닥재 공사를 단일 계약으로 진행, 전담 PM 배치. 500만 보험, 3년 보증. Metro Vancouver 전 지역. 무료 견적.',
  cabinet:             '밴쿠버 캐비닛 리노베이션 — 도장 $4K–$8K, 도어 교체 $8K–$18K, 맞춤 제작 $20K–$50K. 500만 보험, 3년 공법 보증. 무료 견적.',
  'heat-pump-hvac':    '밴쿠버 열펌프 설치 — BC Hydro 보조금 신청 대행. 500만 보험, 3년 보증. Metro Vancouver 전 지역. 무료 견적.',
  'poly-b-replacement':'Metro Vancouver Poly-B 배관 교체 — 1985–1997년 BC 주택 다수 해당, PEX 전체 재배관·허가·검사 포함. BC 보험사 요건. 무료 견적.',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug } = await params;
  const services = await getServicesFromDb();
  const service = services.find((s) => s.slug === serviceSlug);

  if (!service || service.showOnServicesPage === false) {
    return { title: 'Service Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const baseUrl = getBaseUrl();
  const description = (locale === 'en' && enServiceMetaDescriptions[serviceSlug])
    || (locale === 'zh' && zhServiceMetaDescriptions[serviceSlug])
    || (locale === 'zh-Hant' && zhHantServiceMetaDescriptions[serviceSlug])
    || (locale === 'ko' && koServiceMetaDescriptions[serviceSlug])
    || truncateMetaDescription(localizedService.long_description || localizedService.description);

  const ogImage = service.image || siteImages.hero;

  // Title length: keep under Google's ~60-char SERP truncation cap.
  // zh-Hant gets Traditional Chinese geo + trust term; zh gets simplified.
  // ko gets Korean geo + warranty suffix; all other locales get EN template.
  const title = locale === 'zh'
    ? `${localizedService.title} 温哥华 — 3年保修 | Reno Stars`
    : locale === 'zh-Hant'
    ? `${localizedService.title} 溫哥華 — 3年保固 | Reno Stars`
    : locale === 'ko'
    ? `${localizedService.title} 밴쿠버 — 3년 보증 | Reno Stars`
    : `${localizedService.title} Vancouver — 3-Yr Warranty | Reno Stars`;

  return {
    title,
    description,
    alternates: buildAlternates(`/services/${serviceSlug}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: localizedService.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: localizedService.title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, 'service-slug': serviceSlug } = await params;
  setRequestLocale(locale);

  const [company, services, areas, googleReviews] = await Promise.all([getCompanyFromDb(), getServicesFromDb(), getServiceAreasFromDb(), getGoogleReviews()]);
  const service = services.find((s) => s.slug === serviceSlug);

  if (!service || service.showOnServicesPage === false) {
    notFound();
  }
  const localizedService = getLocalizedService(service, locale as Locale);

  const [t, faqT] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'faq' }),
  ]);

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
    { name: localizedService.title, url: `/${locale}/services/${serviceSlug}/` },
  ];

  // Build FAQs for this service type (general page defaults to Vancouver).
  // Wrap in safeFaq so a missing key (new service added to DB before its
  // i18n FAQ entries land) degrades to an empty string instead of throwing
  // MISSING_MESSAGE — Next converts uncaught throws into 404, which broke
  // every non-prerendered /services/{svc}/ render before this fix.
  const faqParams = { area: locale === 'zh' ? '温哥华' : 'Vancouver' };
  const safeFaq = (key: string): string => {
    try { return faqT(key, faqParams); }
    catch { return ''; }
  };
  const faqs = [
    { question: safeFaq(`${serviceSlug}.q1`), answer: safeFaq(`${serviceSlug}.a1`) },
    { question: safeFaq(`${serviceSlug}.q2`), answer: safeFaq(`${serviceSlug}.a2`) },
    { question: safeFaq(`${serviceSlug}.q3`), answer: safeFaq(`${serviceSlug}.a3`) },
  ].filter((f) => f.question && f.answer);

  const serviceHeroImage = service.image || siteImages.hero;

  return (
    <>
      {/* Hero preload — React 19's auto-preload for srcset <img> tags omits
          fetchPriority="high", so the full-res hero ends up downloading at
          normal priority AFTER the 20px LQIP thumb. On mobile/slow links
          this delays LCP. Explicit <link rel="preload"> with fetchPriority
          mirrors the global-hero preload in layout.tsx and starts the
          download during HTML head parsing. */}
      {serviceHeroImage && (
        isR2Url(serviceHeroImage) ? (
          <link
            rel="preload"
            as="image"
            href={buildProcessedUrl(serviceHeroImage, 828)}
            imageSrcSet={buildProcessedSrcSet(serviceHeroImage)}
            imageSizes="100vw"
            type="image/webp"
            fetchPriority="high"
          />
        ) : (
          <link
            rel="preload"
            as="image"
            href={buildOptimizedUrl(serviceHeroImage, 828)}
            imageSrcSet={buildSrcSet(serviceHeroImage)}
            imageSizes="100vw"
            type="image/webp"
            fetchPriority="high"
          />
        )
      )}
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      {/* Use long_description in schema only when the current locale has a
          genuine translation (not a pickLocale en-fallback). Otherwise use
          the short description, which IS localized via the localizations jsonb.
          This prevents English long-form copy bleeding into /es/, /ja/, /ko/
          schema even when the service title and short description are native. */}
      <ServiceSchema
        company={company}
        serviceName={localizedService.title}
        serviceDescription={
          (service.long_description as { [k: string]: string | undefined } | undefined)?.[locale]
            ?? localizedService.description
        }
        url={`/${locale}/services/${serviceSlug}/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={SERVICE_PRICE_RANGES[serviceSlug]}
        image={service.image || siteImages.hero}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
        serviceRadiusKm={50}
      />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceDetailPage
        locale={locale as Locale}
        serviceSlug={serviceSlug as ServiceType}
        company={company}
        service={service}
        areas={areas}
        faqs={faqs}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
        allServices={services}
        h1Override={getServiceH1Override(serviceSlug, locale as Locale)}
      />
    </>
  );
}

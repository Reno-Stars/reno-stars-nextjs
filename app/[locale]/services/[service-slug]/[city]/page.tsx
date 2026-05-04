import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, PRERENDERED_LOCALES, type Locale } from '@/i18n/config';
import { getLocalizedService } from '@/lib/data/services';
import { getLocalizedArea } from '@/lib/data/areas';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb, getProjectsByAreaFromDb, getFaqsByAreaFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import ServiceLocationPage from '@/components/pages/ServiceLocationPage';
import { BreadcrumbSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string; city: string }>;
}

// Hybrid SSG + on-demand ISR (2026-05-04 redesign — see /services/{svc}/page.tsx
// for the full root-cause notes). Prerender just the 3 high-traffic locales;
// the other 11 render on-demand on first visit and cache forever.
//
// Cost shift:
//   Before: 8 services × 14 cities × 14 locales = 1,568 entries (ENOSPC'd Vercel build)
//   Now:    6 project_type services × 14 cities × 3 locales = 252 entries
//   Saved:  ~1,316 prerenders, plus the 11 missing locales now actually render
//           via on-demand instead of 404'ing.
//
// IMPORTANT: do NOT export `revalidate` or `dynamicParams` here. Next 16
// regression on nested dynamic segments — see the parent /services/{svc}/
// page.tsx for the full debug trace. Default behavior (no exports) gives
// us the on-demand Lambda fallback we want, with params correctly bound.

export async function generateStaticParams() {
  const [services, areas] = await Promise.all([getServicesFromDb(), getServiceAreasFromDb()]);
  const params: { locale: string; 'service-slug': string; city: string }[] = [];
  for (const service of services) {
    if (service.showOnServicesPage === false) continue;
    if (service.isProjectType === false) continue;
    for (const area of areas) {
      for (const locale of PRERENDERED_LOCALES) {
        params.push({ locale, 'service-slug': service.slug, city: area.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug, city } = await params;
  const [services, areas] = await Promise.all([getServicesFromDb(), getServiceAreasFromDb()]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area || service.showOnServicesPage === false) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const baseUrl = getBaseUrl();

  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.serviceLocation' }),
    getCompanyFromDb(),
  ]);
  const tagline = localizedService.tags?.slice(0, 2).join(' & ') ?? '';
  const tParams = { service: localizedService.title, area: localizedArea.name, years: company.yearsExperience, tagline };
  // Use tagline variant only if it fits within ~60 chars (Google truncation limit)
  const titleWithTagline = tagline ? t('titleWithTagline', tParams) : '';
  let title = titleWithTagline && titleWithTagline.length <= 60
    ? titleWithTagline
    : t('title', tParams);
  let description = t('description', tParams);

  // High-priority keyword overrides driven by the local rank tracker (2026-04-08).
  // For specific city+service combos that are underperforming OR that hold the
  // most search volume, hand-tune the title/meta to put the exact keyword in
  // the title and boost CTR. EN only — Chinese keywords are different.
  const overrideKey = `${serviceSlug}/${city}`;
  const enOverrides: Record<string, { title: string; description: string }> = {
    // Highest-volume term, currently rank ~15 (page 2) with +5 weekly trend.
    'whole-house/vancouver': {
      title: 'Home Renovations Vancouver: Real Projects & Costs (2026)',
      description: 'Home renovations in Vancouver BC with real project pricing from $50K to $200K+. 18+ years experience, $5M CGL insurance, 3-year workmanship warranty. See completed Vancouver projects + get a free quote.',
    },
    // Currently NOT RANKING in Local Finder for "Coquitlam Home renovation company".
    'whole-house/coquitlam': {
      title: 'Coquitlam Home Renovation Company | Reno Stars',
      description: 'Reno Stars is a Coquitlam home renovation company serving Burke Mountain, Maillardville, Westwood Plateau, Eagle Ridge, Austin Heights and Ranch Park. Whole-house renovations, permit-ready work, $5M CGL, 3-year warranty. Free quote.',
    },
    // Currently NOT RANKING in Local Finder for "Coquitlam kitchen renovation company".
    'kitchen/coquitlam': {
      title: 'Coquitlam Kitchen Renovation Company | Reno Stars',
      description: 'Coquitlam kitchen renovation company — custom cabinets, quartz countertops, layout reconfiguration, full project management. Serving Burke Mountain to Maillardville with 18+ years experience and a 3-year workmanship warranty.',
    },
    // 315 imp pos 24.4 — top queries: "reno white rock" (114 imp) + "bathroom renovations white rock" (68 imp).
    'bathroom/white-rock': {
      title: 'White Rock Bathroom Renovations | Free Quotes | Reno Stars',
      description: 'Bathroom renovations in White Rock BC. Walk-in showers, soaker tubs, custom tile and full remodels. Serving White Rock and South Surrey. $5M CGL, 3-year warranty. Free quote today.',
    },
    // 118 imp pos 31.3 — top queries: "reno port coquitlam" (53 imp pos 22.8), "reno coquitlam" (42 imp pos 48.2).
    'whole-house/port-coquitlam': {
      title: 'Home Renovations Port Coquitlam | Free Quotes | Reno Stars',
      description: 'Port Coquitlam renovations — kitchens, bathrooms and basements. Serving PoCo, Birchland, Lincoln and Riverwood. 18+ years experience, $5M CGL, 3-year warranty. Free quote today.',
    },
    // 68 imp pos 35.6 — top queries: "luxury home painters caulfeild" (17 imp pos 7.4), "home renovation west vancouver" (7 imp pos 34.9).
    'whole-house/west-vancouver': {
      title: 'Home Renovations West Vancouver | Luxury Renos | Reno Stars',
      description: 'West Vancouver renovations — kitchens, bathrooms and whole-house remodels. Serving Caulfeild, Dundarave, Ambleside and British Properties. $5M CGL, 3-year warranty. Free quote.',
    },
    // Cabinet — high-volume geo cluster. GSC 2026-05-04 shows the actual
    // search terms are "cabinet resurfacing {city}" (most common) and
    // "cabinet refinishing {city}" — NOT "refacing" (the title used to say
    // refacing). 360+ imp at pos 5-12 with 0 clicks across 3 cities — the
    // fix is exact-match query in the title for SERP relevance.
    'cabinet/port-coquitlam': {
      title: 'Cabinet Resurfacing & Refinishing Port Coquitlam | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing, refinishing & refacing in Port Coquitlam. Painting from $1.5K, door replacement from $4K, full refacing $8–$15K. 1–2 week timeline. Free quote.',
    },
    'cabinet/maple-ridge': {
      title: 'Cabinet Resurfacing & Refinishing Maple Ridge | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Maple Ridge — painting from $1.5K, full refacing $4–$15K. 1–2 week timeline. Albion, Thornhill, Haney. Free quote.',
    },
    'cabinet/port-moody': {
      title: 'Cabinet Resurfacing & Refinishing Port Moody | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing, refinishing & refacing in Port Moody — Heritage Mountain, Newport Village, Inlet Centre. Painting from $1.5K, refacing $4–$15K. Free quote.',
    },
    'cabinet/delta': {
      title: 'Cabinet Resurfacing & Refinishing Delta BC | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Delta — Ladner, Tsawwassen, North Delta. Painting from $1.5K, full refacing from $4K. Free in-home quote.',
    },
    // Specialty services launched 2026-05-04. Title overrides for the
    // highest-volume cities in Metro Vancouver — Burnaby/Richmond/Surrey/
    // Vancouver are the major aging-in-place markets for accessible
    // bathroom work, and Burnaby/Coquitlam/Richmond have the densest
    // 1985-97 SFH stock for Poly-B replacement demand.
    'accessible-bathroom/vancouver': {
      title: 'Accessible Bathroom Vancouver | Aging in Place | $3K–$60K | Reno Stars',
      description: 'Vancouver accessible & aging-in-place bathroom renovations — curbless showers, grab bars, comfort-height toilets, wheelchair vanities. CSA B651 compliant. $3K–$60K. Free quote.',
    },
    'accessible-bathroom/burnaby': {
      title: 'Accessible Bathroom Burnaby | Wheelchair Walk-in | $3K–$60K | Reno Stars',
      description: 'Burnaby accessible bathroom renovations — Metrotown, Heights, Capitol Hill. Walk-in showers, grab bars, roll-in seating, wheelchair-accessible vanities. $3K–$60K.',
    },
    'accessible-bathroom/richmond': {
      title: 'Accessible Bathroom Richmond BC | Aging in Place | $3K–$60K | Reno Stars',
      description: 'Richmond accessible bathroom renovations — Steveston, Brighouse, Terra Nova. Curbless showers, grab bars, comfort-height fixtures, walker/wheelchair access. $3K–$60K.',
    },
    'accessible-bathroom/surrey': {
      title: 'Accessible Bathroom Surrey | Wheelchair Walk-in | $3K–$60K | Reno Stars',
      description: 'Surrey accessible bathroom renovations — Fleetwood, Newton, South Surrey, Cloverdale. Aging-in-place + wheelchair-accessible builds. $3K–$60K. Free in-home quote.',
    },
    'accessible-bathroom/west-vancouver': {
      title: 'Accessible Bathroom West Vancouver | Premium Aging in Place | Reno Stars',
      description: 'West Vancouver accessible bathroom renovations — premium aging-in-place builds in Caulfeild, Dundarave, British Properties. CSA B651 compliant, occupational-therapist coordinated.',
    },
    'poly-b-replacement/burnaby': {
      title: 'Poly-B Replacement Burnaby | $4K–$22K | Insurance-Ready | Reno Stars',
      description: 'Burnaby Poly-B pipe replacement — Metrotown condos, Heights SFH, Burnaby Mountain townhouses. PEX re-pipe, 50-year warranty, insurer-ready documentation. $4K–$22K.',
    },
    'poly-b-replacement/coquitlam': {
      title: 'Poly-B Replacement Coquitlam | $8K–$22K | Insurance-Ready | Reno Stars',
      description: 'Coquitlam Poly-B pipe replacement — Burke Mountain, Westwood Plateau, Maillardville SFH. PEX re-pipe, 50-year warranty, insurance renewal documentation. $8K–$22K.',
    },
    'poly-b-replacement/richmond': {
      title: 'Poly-B Replacement Richmond BC | $4K–$25K | Insurance-Ready | Reno Stars',
      description: 'Richmond Poly-B pipe replacement — Steveston, Brighouse, Terra Nova SFH. PEX re-pipe, 50-year warranty, BC permit + inspection. $4K–$25K. Free quote.',
    },
    'poly-b-replacement/maple-ridge': {
      title: 'Poly-B Replacement Maple Ridge | $10K–$25K | Insurance-Ready | Reno Stars',
      description: 'Maple Ridge Poly-B pipe replacement — Albion, Cottonwood, Haney SFH. 1985-97 building stock dense in this area. PEX re-pipe + 50-year warranty. $10K–$25K.',
    },
    'poly-b-replacement/surrey': {
      title: 'Poly-B Replacement Surrey | $10K–$25K | Insurance-Ready | Reno Stars',
      description: 'Surrey Poly-B pipe replacement — Fleetwood, Newton, Cloverdale SFH. PEX re-pipe with 50-year warranty + insurance-renewal documentation. $10K–$25K.',
    },
    // Kitchen — high-volume cities
    'kitchen/west-vancouver': {
      title: 'Kitchen Renovation West Vancouver | Luxury Kitchens | Reno Stars',
      description: 'West Vancouver kitchen renovation — custom cabinets, quartz islands, premium appliances. Caulfeild, Dundarave, Ambleside. $30K–$90K+. Free quote.',
    },
    'kitchen/north-vancouver': {
      title: 'Kitchen Renovation North Vancouver | $25K–$80K | Reno Stars',
      description: 'North Vancouver kitchen renovation — Lynn Valley, Lonsdale, Deep Cove. Custom cabinets, quartz countertops, full layout redesign. Free quote.',
    },
    // Basement — near-page-1 opportunities
    'basement/surrey': {
      title: 'Basement Renovation Surrey | Legal Suites | Reno Stars',
      description: 'Surrey basement renovation & legal suite conversion. $35K–$130K+. Permits handled, fire separation, separate entrance. Fleetwood, Newton, Cloverdale.',
    },
    'basement/north-vancouver': {
      title: 'Basement Renovation North Vancouver | Waterproofing | Reno Stars',
      description: 'North Vancouver basement renovation with waterproofing guarantee. $35K–$80K. Lynn Valley, Lonsdale, Deep Cove. Permits handled. Free quote.',
    },
    // Commercial — near-page-1
    'commercial/west-vancouver': {
      title: 'Commercial Renovation West Vancouver | Reno Stars',
      description: 'West Vancouver commercial renovation — restaurants, clinics, retail. Permit-aware, off-hours scheduling. $150–$500/sqft. Free consultation.',
    },
    'commercial/delta': {
      title: 'Commercial Renovation Delta BC | Reno Stars',
      description: 'Delta commercial renovation — restaurants, offices, retail in Ladner, Tsawwassen & North Delta. Permits handled, minimal disruption. Free quote.',
    },
    'commercial/maple-ridge': {
      title: 'Commercial Renovation Maple Ridge | Reno Stars',
      description: 'Maple Ridge commercial renovation — restaurants, clinics, stores. Off-hours scheduling, permit management. Free consultation.',
    },
    // Bathroom — high impressions
    'bathroom/burnaby': {
      title: 'Bathroom Renovation Burnaby | $15K–$45K | Reno Stars',
      description: 'Burnaby bathroom renovation — tiled showers, tub conversions, custom vanities. Metrotown to Heights. $15K–$45K, 3–6 weeks. Free quote.',
    },
    'bathroom/maple-ridge': {
      title: 'Bathroom Renovation Maple Ridge | $15K–$35K | Reno Stars',
      description: 'Maple Ridge bathroom renovation with custom Glass Door, tiled walls & quartz vanity. Real project: $18K–$21K. Free in-home quote.',
    },
    // Q7 (64 imp pos 5.2) "bathroom reno vancouver" + Q10 (57 imp pos 1.5) "bathroom remodel vancouver".
    // Page is already ranking — entire fix is snippet attractiveness, not rank.
    'bathroom/vancouver': {
      title: 'Bathroom Remodel Vancouver | $15K–$45K | Reno Stars',
      description: 'Vancouver bathroom remodel from $15K–$45K — walk-in showers, tub conversions, custom vanities. 3–6 wks. 20+ yrs, $5M insured, 3-yr warranty. Free quote.',
    },
    // 2026-04-30 GSC pass: missing high-impression combos. Each one targets
    // a specific city+service query Google was matching to a less-relevant
    // URL (cannibalization). Distinct H1 + city-scoped price range moves
    // these toward page-1 positioning.
    'kitchen/burnaby': {
      title: 'Kitchen Renovation Burnaby | $20K–$60K | Reno Stars',
      description: 'Burnaby kitchen renovation — Metrotown condos, Heights SFH, townhouse galleys. Custom & prefab cabinets, quartz countertops, full layout. $20K–$60K. Free quote.',
    },
    'kitchen/richmond': {
      title: 'Kitchen Renovation Richmond BC | $20K–$60K | Reno Stars',
      description: 'Richmond kitchen renovation — Steveston, Brighouse, Terra Nova. Cabinet replacement, quartz countertops, layout reconfiguration. $20K–$60K, 3–5 weeks. Free quote.',
    },
    'kitchen/vancouver': {
      title: 'Kitchen Renovation Vancouver | $25K–$72K | Reno Stars',
      description: 'Vancouver kitchen renovation — Kitsilano, Mount Pleasant, Dunbar SFH plus condos throughout downtown. Custom cabinets, quartz, layout redesign. Real costs $25K–$72K. Free quote.',
    },
    'kitchen/surrey': {
      title: 'Kitchen Renovation Surrey | $20K–$55K | Reno Stars',
      description: 'Surrey kitchen renovation — Fleetwood, Newton, Cloverdale, South Surrey. Custom & prefab cabinets, quartz, layout redesign. $20K–$55K, 3–5 weeks. Free quote.',
    },
    'bathroom/richmond': {
      title: 'Bathroom Renovation Richmond BC | $15K–$45K | Reno Stars',
      description: 'Richmond bathroom renovation — Steveston, Brighouse, Terra Nova, Hamilton. Walk-in showers, tub conversions, custom vanities. $15K–$45K, 3–6 weeks. Free quote.',
    },
    'bathroom/north-vancouver': {
      title: 'Bathroom Renovation North Vancouver | $15K–$45K | Reno Stars',
      description: 'North Vancouver bathroom renovation — Lynn Valley, Lonsdale, Deep Cove. Walk-in showers, soaker tubs, custom vanities. $15K–$45K, 3–6 weeks. Free quote.',
    },
    'whole-house/burnaby': {
      title: 'Whole-House Renovation Burnaby | $50K–$200K+ | Reno Stars',
      description: 'Burnaby whole-house renovation — Heights SFH, Metrotown townhouses, Capitol Hill homes. Strata-compliant. $50K–$200K+ from real projects. 18+ yrs, $5M insured.',
    },
    'whole-house/richmond': {
      title: 'Whole-House Renovation Richmond BC | $50K–$200K+ | Reno Stars',
      description: 'Richmond whole-house renovation — Steveston heritage, Brighouse condos, Terra Nova SFH. $50K–$200K+ from real projects. 18+ yrs, $5M insured, 3-yr warranty.',
    },
    'whole-house/surrey': {
      title: 'Whole-House Renovation Surrey | $50K–$200K+ | Reno Stars',
      description: 'Surrey whole-house renovation — Fleetwood, Newton, Cloverdale, South Surrey. SFH + secondary suite work. $50K–$200K+, 18+ yrs, $5M insured. Free quote.',
    },
  };
  if (locale === 'en' && enOverrides[overrideKey]) {
    title = enOverrides[overrideKey].title;
    description = enOverrides[overrideKey].description;
  }
  // ZH overrides — parallel of the EN cabinet city CTR fix (commit 55f6962).
  // Mandarin Vancouver homeowners search 厨柜翻新 / 厨柜喷漆 / 厨柜重新喷漆
  // for cabinet refinishing work — terms not surfaced by the generic combo
  // template. Mirrors the EN "Cabinet Resurfacing & Refinishing {City}" pattern.
  const zhOverrides: Record<string, { title: string; description: string }> = {
    'cabinet/port-coquitlam': {
      title: '高贵林港厨柜翻新喷漆 | $1.5K–$15K | Reno Stars',
      description: '高贵林港厨柜翻新、重新喷漆与门板更换。喷漆从$1.5K，门板更换$4K起，整体翻新$8K–$15K。1–2周完工。免费报价。',
    },
    'cabinet/maple-ridge': {
      title: '枫树岭厨柜翻新喷漆 | $1.5K–$15K | Reno Stars',
      description: '枫树岭厨柜翻新与重新喷漆——喷漆$1.5K起，整体翻新$4K–$15K。1–2周完工。覆盖Albion、Thornhill、Haney。免费报价。',
    },
    'cabinet/port-moody': {
      title: '满地宝厨柜翻新喷漆 | $1.5K–$15K | Reno Stars',
      description: '满地宝厨柜翻新、重新喷漆与门板更换——Heritage Mountain、Newport Village、Inlet Centre。喷漆$1.5K起，翻新$4K–$15K。免费报价。',
    },
    'cabinet/delta': {
      title: 'Delta厨柜翻新喷漆 | $1.5K–$15K | Reno Stars',
      description: 'Delta厨柜翻新与重新喷漆——Ladner、Tsawwassen、北Delta。喷漆$1.5K起，整体翻新$4K起。免费上门估价。',
    },
    // 老人/无障碍浴室 + Poly-B 更换 ZH 城市组合标题——与 EN 端 CTR 优化覆盖一致。
    'accessible-bathroom/vancouver': {
      title: '温哥华无障碍浴室改造 | 老人浴室 | $3K–$60K | Reno Stars',
      description: '温哥华无障碍 / 老人浴室改造——无门槛淋浴、扶手、舒适高度马桶、轮椅可入梳妆台。CSA B651 合规。$3K–$60K。免费报价。',
    },
    'accessible-bathroom/burnaby': {
      title: '本拿比无障碍浴室改造 | 轮椅步入式 | $3K–$60K | Reno Stars',
      description: '本拿比无障碍浴室改造——Metrotown、Heights、Capitol Hill。步入式淋浴、扶手、可滚入式座椅、轮椅可入梳妆台。$3K–$60K。',
    },
    'accessible-bathroom/richmond': {
      title: '列治文无障碍浴室改造 | 老人浴室 | $3K–$60K | Reno Stars',
      description: '列治文无障碍浴室改造——Steveston、Brighouse、Terra Nova。无门槛淋浴、扶手、舒适高度洁具、助行器/轮椅通行。$3K–$60K。',
    },
    'accessible-bathroom/surrey': {
      title: 'Surrey无障碍浴室改造 | 轮椅步入式 | $3K–$60K | Reno Stars',
      description: 'Surrey无障碍浴室改造——Fleetwood、Newton、South Surrey、Cloverdale。老人就地养老 + 轮椅可入施工。$3K–$60K。免费上门报价。',
    },
    'accessible-bathroom/west-vancouver': {
      title: '西温无障碍浴室改造 | 高端老人浴室 | Reno Stars',
      description: '西温无障碍浴室改造——Caulfeild、Dundarave、British Properties 高端老人就地养老施工。CSA B651 合规，与职业治疗师协调对接。',
    },
    'poly-b-replacement/burnaby': {
      title: '本拿比 Poly-B 水管更换 | $4K–$22K | 保险续保 | Reno Stars',
      description: '本拿比 Poly-B 水管更换——Metrotown 公寓、Heights 独立屋、本拿比山联排。PEX 重新走管、50 年保修、保险公司认可文件。$4K–$22K。',
    },
    'poly-b-replacement/coquitlam': {
      title: '高贵林 Poly-B 水管更换 | $8K–$22K | 保险续保 | Reno Stars',
      description: '高贵林 Poly-B 水管更换——Burke Mountain、Westwood Plateau、Maillardville 独立屋。PEX 重新走管、50 年保修、保险续保文件。$8K–$22K。',
    },
    'poly-b-replacement/richmond': {
      title: '列治文 Poly-B 水管更换 | $4K–$25K | 保险续保 | Reno Stars',
      description: '列治文 Poly-B 水管更换——Steveston、Brighouse、Terra Nova 独立屋。PEX 重新走管、50 年保修、BC 许可证 + 检验。$4K–$25K。免费报价。',
    },
    'poly-b-replacement/maple-ridge': {
      title: '枫树岭 Poly-B 水管更换 | $10K–$25K | 保险续保 | Reno Stars',
      description: '枫树岭 Poly-B 水管更换——Albion、Cottonwood、Haney 独立屋。该区域 1985-97 年间建房密集。PEX 重新走管 + 50 年保修。$10K–$25K。',
    },
    'poly-b-replacement/surrey': {
      title: 'Surrey Poly-B 水管更换 | $10K–$25K | 保险续保 | Reno Stars',
      description: 'Surrey Poly-B 水管更换——Fleetwood、Newton、Cloverdale 独立屋。PEX 重新走管，50 年保修 + 保险续保文件。$10K–$25K。',
    },
  };
  if (locale === 'zh' && zhOverrides[overrideKey]) {
    title = zhOverrides[overrideKey].title;
    description = zhOverrides[overrideKey].description;
  }
  const ogImage = service.image || siteImages.hero;

  return {
    title,
    description,
    alternates: buildAlternates(`/services/${serviceSlug}/${city}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/${city}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, 'service-slug': serviceSlug, city } = await params;
  setRequestLocale(locale);

  const [company, services, areas, googleReviews] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
    getGoogleReviews(),
  ]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area || service.showOnServicesPage === false) {
    notFound();
  }

  const [areaProjects, areaFaqs, t, faqT] = await Promise.all([
    getProjectsByAreaFromDb(area.name.en),
    getFaqsByAreaFromDb(area.id),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'faq' }),
  ]);

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const loc = locale as Locale;

  // Area-specific FAQs from database (localized)
  const dbFaqs = areaFaqs.map((faq) => ({
    id: faq.id,
    question: pickLocale(faq.question, loc),
    answer: pickLocale(faq.answer, loc),
  }));

  // Service-type FAQs from i18n (with {area} placeholder replaced by actual city name).
  // Wrap in safeFaq so a missing key degrades to empty rather than throwing
  // MISSING_MESSAGE — see /services/{svc}/page.tsx for why.
  const faqParams = { area: localizedArea.name };
  const safeFaq = (key: string): string => {
    try { return faqT(key, faqParams); }
    catch { return ''; }
  };
  const serviceFaqs = [
    { id: `${serviceSlug}-1`, question: safeFaq(`${serviceSlug}.q1`), answer: safeFaq(`${serviceSlug}.a1`) },
    { id: `${serviceSlug}-2`, question: safeFaq(`${serviceSlug}.q2`), answer: safeFaq(`${serviceSlug}.a2`) },
    { id: `${serviceSlug}-3`, question: safeFaq(`${serviceSlug}.q3`), answer: safeFaq(`${serviceSlug}.a3`) },
  ].filter((f) => f.question && f.answer);

  // Combine: area-specific first, then service-level
  const faqs = [...dbFaqs, ...serviceFaqs];

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
    { name: localizedService.title, url: `/${locale}/services/${serviceSlug}/` },
    { name: localizedArea.name, url: `/${locale}/services/${serviceSlug}/${city}/` },
  ];

  const tAreas = await getTranslations({ locale, namespace: 'areas' });
  const serviceTitle = tAreas('serviceInArea', { service: localizedService.title, area: localizedArea.name });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ServiceSchema
        company={company}
        serviceName={serviceTitle}
        serviceDescription={localizedService.long_description || localizedService.description}
        location={localizedArea.name}
        url={`/${locale}/services/${serviceSlug}/${city}/`}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
        locale={locale}
      />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceLocationPage
        locale={locale as Locale}
        serviceSlug={serviceSlug as ServiceType}
        citySlug={city}
        company={company}
        service={service}
        area={area}
        services={services}
        areas={areas}
        faqs={faqs}
        areaProjects={areaProjects}
      />
    </>
  );
}

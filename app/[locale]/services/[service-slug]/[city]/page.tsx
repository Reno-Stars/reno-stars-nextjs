import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService } from '@/lib/data/services';
import { getLocalizedArea } from '@/lib/data/areas';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb, getProjectsByAreaFromDb, getFaqsByAreaFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import ServiceLocationPage from '@/components/pages/ServiceLocationPage';
import { BreadcrumbSchema, LocalBusinessAreaSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string; city: string }>;
}

// FULLY DYNAMIC — see /services/{svc}/page.tsx for full root-cause
// notes. Same Next 16 prerender-shell regression; same workaround.
export const dynamic = 'force-dynamic';

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
      description: 'Bathroom renovations in White Rock & South Surrey BC — showers, soaker tubs, custom tile, full remodels. $5M insured, 3-yr warranty. Free quote.',
    },
    // Maple Ridge area page gets 1,962 imp/28d mostly for "bathroom renovation maple ridge"
    // cluster (26 imp pos 15.7, 14 imp pos 16.1, 5 imp pos 15.0, etc.) — all page 2.
    // Dedicated service-location page with targeted title/desc to create a more
    // specific landing page for bathroom renovation queries. Real project pricing
    // from DB: bathroom $15K–$35K. Source: GSC 2026-06-26.
    'bathroom/maple-ridge': {
      title: 'Bathroom Renovation Maple Ridge | $15K–$35K | Reno Stars',
      description: 'Bathroom renovation Maple Ridge: $15K–$35K. Tile, showers & vanities. Albion, Cottonwood, Silver Valley & Haney. $5M insured, 3-yr warranty. Free quote.',
    },
    // Richmond: 392 imp/28d for "bathroom renovation richmond" at pos 14.2 (area page
    // is primary, but adding svc-location override for the dedicated bathroom+city page).
    // Richmond showroom at 21300 Gordon Way — English & Mandarin team.
    // Real project pricing from DB: bathroom $12K–$45K. Source: GSC 2026-06-26.
    'bathroom/richmond': {
      title: 'Bathroom Renovation Richmond BC | $12K–$45K | Reno Stars',
      description: 'Bathroom renovation Richmond BC: $12K–$45K. Showroom 21300 Gordon Way — English & Mandarin. Steveston, Brighouse. $5M insured, 3-yr warranty. Free quote.',
    },
    // 118 imp pos 31.3 — top queries: "reno port coquitlam" (53 imp pos 22.8), "reno coquitlam" (42 imp pos 48.2).
    'whole-house/port-coquitlam': {
      title: 'Home Renovations Port Coquitlam | Free Quotes | Reno Stars',
      description: 'Port Coquitlam home renovations — kitchens, bathrooms & basements. Serving PoCo, Birchland, Lincoln & Riverwood. $5M CGL. Free quote.',
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
    // 2026-06-25: Remaining 10 cabinet city overrides (same pattern as the 4 above).
    'cabinet/burnaby': {
      title: 'Cabinet Resurfacing & Refinishing Burnaby | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Burnaby — Metrotown, Heights, Capitol Hill. Painting from $1.5K, door replacement $4K+, full refacing $8–$15K. Free quote.',
    },
    'cabinet/coquitlam': {
      title: 'Cabinet Resurfacing & Refinishing Coquitlam | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Coquitlam — Burke Mountain, Westwood Plateau, Maillardville. Painting from $1.5K, full refacing $4–$15K. Free quote.',
    },
    'cabinet/langley': {
      title: 'Cabinet Resurfacing & Refinishing Langley | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Langley — Willoughby, Walnut Grove, Fort Langley. Painting from $1.5K, full refacing $4–$15K. 1–2 week timeline. Free quote.',
    },
    'cabinet/new-westminster': {
      title: 'Cabinet Resurfacing & Refinishing New Westminster | $1.5K–$15K | Reno Stars',
      description: "Cabinet resurfacing & refinishing in New Westminster — Queen's Park, Sapperton & Uptown. Painting from $1.5K, full refacing $8–$15K. 1–2 week timeline. Free quote.",
    },
    'cabinet/north-vancouver': {
      title: 'Cabinet Resurfacing & Refinishing North Vancouver | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in North Vancouver — Lynn Valley, Lonsdale, Deep Cove. Painting from $1.5K, door replacement $4K+, full refacing $8–$15K. Free quote.',
    },
    'cabinet/richmond': {
      title: 'Cabinet Resurfacing & Refinishing Richmond BC | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Richmond — Steveston, Brighouse, Terra Nova. Painting from $1.5K, door replacement $4K+, full refacing $8–$15K. Free quote.',
    },
    'cabinet/surrey': {
      title: 'Cabinet Resurfacing & Refinishing Surrey BC | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Surrey — Fleetwood, Newton, Cloverdale. Painting from $1.5K, door replacement $4K+, full refacing $8–$15K. Free quote.',
    },
    'cabinet/vancouver': {
      title: 'Cabinet Resurfacing & Refinishing Vancouver | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in Vancouver — East Van, Kitsilano, Mount Pleasant. Painting from $1.5K, door replacement $4K+, full refacing $8–$15K. Free quote.',
    },
    'cabinet/west-vancouver': {
      title: 'Cabinet Resurfacing & Refinishing West Vancouver | $1.5K–$25K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in West Vancouver — Caulfeild, Dundarave, British Properties. Painting from $1.5K, full refacing $4–$15K, luxury finishes to $25K. Free quote.',
    },
    'cabinet/white-rock': {
      title: 'Cabinet Resurfacing & Refinishing White Rock | $1.5K–$15K | Reno Stars',
      description: 'Cabinet resurfacing & refinishing in White Rock & South Surrey — painting from $1.5K, door replacement $4K+, full refacing $9–$16K. Free in-home quote.',
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
    // 2026-06-25: Remaining accessible-bathroom + poly-b cities
    'accessible-bathroom/north-vancouver': {
      title: 'Accessible Bathroom North Vancouver | Aging in Place | $3K–$60K | Reno Stars',
      description: 'North Vancouver accessible bathroom renovations — Lynn Valley, Lonsdale, Deep Cove. Curbless showers, grab bars, comfort-height fixtures. CSA B651 compliant. $3K–$60K.',
    },
    'accessible-bathroom/coquitlam': {
      title: 'Accessible Bathroom Coquitlam | Wheelchair Walk-in | $3K–$60K | Reno Stars',
      description: 'Coquitlam accessible bathroom renovations — Westwood Plateau, Burke Mountain, Town Centre. Curbless showers, grab bars, roll-in seating, widened doorways. $3K–$60K.',
    },
    'accessible-bathroom/langley': {
      title: 'Accessible Bathroom Langley BC | Aging in Place | $3K–$60K | Reno Stars',
      description: 'Langley accessible bathroom renovations — Langley City, Walnut Grove, Willoughby. Walk-in showers, grab bars, comfort-height toilets, wheelchair vanities. $3K–$60K.',
    },
    'accessible-bathroom/delta': {
      title: 'Accessible Bathroom Delta BC | Aging in Place | $3K–$60K | Reno Stars',
      description: 'Delta accessible bathroom renovations — Ladner, Tsawwassen, North Delta. Curbless showers, grab bars, OT-coordinated layouts, wheelchair-accessible vanities. $3K–$60K.',
    },
    'poly-b-replacement/vancouver': {
      title: 'Poly-B Replacement Vancouver | $8K–$25K | Insurance-Ready | Reno Stars',
      description: 'Vancouver Poly-B pipe replacement — East Van, Kitsilano, Dunbar SFH + strata. Full PEX re-pipe, 50-year warranty, insurer-ready documentation. $8K–$25K. Free quote.',
    },
    'poly-b-replacement/north-vancouver': {
      title: 'Poly-B Replacement North Vancouver | $8K–$22K | Insurance-Ready | Reno Stars',
      description: 'North Vancouver Poly-B replacement — Lynn Valley, Capilano Highlands, Edgemont SFH. 1985-97 building stock. PEX re-pipe + 50-year warranty + insurance docs. $8K–$22K.',
    },
    'poly-b-replacement/langley': {
      title: 'Poly-B Replacement Langley BC | $10K–$22K | Insurance-Ready | Reno Stars',
      description: 'Langley Poly-B pipe replacement — Langley City, Walnut Grove, Willoughby SFH. PEX re-pipe, 50-year warranty, insurer-ready documentation. $10K–$22K.',
    },
    'poly-b-replacement/west-vancouver': {
      title: 'Poly-B Replacement West Vancouver | $10K–$28K | Insurance-Ready | Reno Stars',
      description: 'West Vancouver Poly-B replacement — Caulfeild, Dundarave, British Properties SFH. Full PEX re-pipe, 50-year warranty, insurance-renewal documentation. $10K–$28K.',
    },
    // 2026-06-25: Critical load panel + heat pump HVAC — specialty services
    'critical-load-panel/vancouver': {
      title: 'Electrical Panel Upgrade Vancouver | 200A Service | $3K–$8K | Reno Stars',
      description: 'Vancouver critical load panel upgrades — 100A→200A service, EV charger circuits, arc-fault breakers. East Van, Kitsilano, Dunbar. BC permit + ESA inspection. $3K–$8K.',
    },
    'critical-load-panel/burnaby': {
      title: 'Electrical Panel Upgrade Burnaby | 200A Service | $3K–$8K | Reno Stars',
      description: 'Burnaby electrical panel upgrades — Metrotown, Heights, Edmonds. 100A→200A service, EV charger prep, dedicated kitchen circuits. BC permit + ESA. $3K–$8K.',
    },
    'critical-load-panel/richmond': {
      title: 'Electrical Panel Upgrade Richmond BC | 200A Service | $3K–$8K | Reno Stars',
      description: 'Richmond electrical panel upgrades — Steveston, Brighouse, Terra Nova. 100A→200A service upgrade, EV-ready circuits, arc-fault protection. BC permit + ESA. $3K–$8K.',
    },
    'critical-load-panel/surrey': {
      title: 'Electrical Panel Upgrade Surrey | 200A Service | $3K–$8K | Reno Stars',
      description: 'Surrey electrical panel upgrades — Fleetwood, Newton, Cloverdale. 100A→200A service, EV charger circuits, dedicated appliance breakers. BC permit + ESA. $3K–$8K.',
    },
    'critical-load-panel/north-vancouver': {
      title: 'Electrical Panel Upgrade North Vancouver | 200A Service | Reno Stars',
      description: 'North Vancouver electrical panel upgrades — Lynn Valley, Lonsdale. 100A→200A service, EV charger prep, arc-fault breakers. BC permit + ESA inspection. Free quote.',
    },
    'critical-load-panel/coquitlam': {
      title: 'Electrical Panel Upgrade Coquitlam | 200A Service | Reno Stars',
      description: 'Coquitlam electrical panel upgrades — Burke Mountain, Westwood Plateau. 100A→200A service, EV-ready circuits, dedicated kitchen breakers. BC permit + ESA. Free quote.',
    },
    'critical-load-panel/langley': {
      title: 'Electrical Panel Upgrade Langley BC | 200A Service | Reno Stars',
      description: 'Langley electrical panel upgrades — Langley City, Walnut Grove, Willoughby. 100A→200A service, EV charger circuits, arc-fault protection. BC permit + ESA. Free quote.',
    },
    'critical-load-panel/west-vancouver': {
      title: 'Electrical Panel Upgrade West Vancouver | 200A Service | Reno Stars',
      description: 'West Vancouver electrical panel upgrades — Caulfeild, Dundarave, British Properties. 100A→200A service, EV charger circuits, premium ESA inspection. Free quote.',
    },
    'critical-load-panel/delta': {
      title: 'Electrical Panel Upgrade Delta BC | 200A Service | Reno Stars',
      description: 'Delta electrical panel upgrades — Ladner, Tsawwassen, North Delta. 100A→200A service, EV charger prep, dedicated appliance circuits. BC permit + ESA. Free quote.',
    },
    'heat-pump-hvac/vancouver': {
      title: 'Heat Pump Installation Vancouver | $8K–$18K | Reno Stars',
      description: 'Vancouver heat pump & HVAC installation — ductless mini-splits, ducted heat pumps. BC Energy Step Code ready. CleanBC rebates available. East Van, Kitsilano. $8K–$18K.',
    },
    'heat-pump-hvac/burnaby': {
      title: 'Heat Pump Installation Burnaby | $8K–$18K | Reno Stars',
      description: 'Burnaby heat pump & HVAC installation — ductless mini-splits, multi-zone systems. CleanBC rebates, BC Energy Step Code. Metrotown, Heights, Burnaby Mountain. $8K–$18K.',
    },
    'heat-pump-hvac/richmond': {
      title: 'Heat Pump Installation Richmond BC | $8K–$18K | Reno Stars',
      description: 'Richmond heat pump & HVAC installation — ductless mini-splits, ducted heat pumps. CleanBC rebates, BC Energy Step Code. Steveston, Brighouse. $8K–$18K.',
    },
    'heat-pump-hvac/surrey': {
      title: 'Heat Pump Installation Surrey | $8K–$18K | Reno Stars',
      description: 'Surrey heat pump & HVAC installation — ductless mini-splits, multi-zone systems. CleanBC rebates available. Fleetwood, Newton, South Surrey. $8K–$18K.',
    },
    'heat-pump-hvac/north-vancouver': {
      title: 'Heat Pump Installation North Vancouver | $8K–$18K | Reno Stars',
      description: 'North Vancouver heat pump & HVAC installation — ductless mini-splits, ducted systems. CleanBC rebates, BC Energy Step Code. Lynn Valley, Lonsdale. $8K–$18K.',
    },
    'heat-pump-hvac/coquitlam': {
      title: 'Heat Pump Installation Coquitlam | $8K–$18K | Reno Stars',
      description: 'Coquitlam heat pump & HVAC installation — ductless mini-splits, multi-zone systems. CleanBC rebates available. Burke Mountain, Westwood Plateau. $8K–$18K.',
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
    // 2026-06-21 on-page scan: generic template meta on these two commercial pages.
    // Other commercial cities (west-van, delta, maple-ridge) already have localized
    // descriptions with business types + neighbourhoods. Adding parity entries.
    'commercial/coquitlam': {
      title: 'Commercial Renovation Coquitlam | Reno Stars',
      description: 'Coquitlam commercial renovation — office, retail & restaurant fit-outs in Town Centre, Austin Heights & Burke Mountain. Permits handled, minimal disruption. Free quote.',
    },
    'commercial/langley': {
      title: 'Commercial Renovation Langley BC | Reno Stars',
      description: 'Langley commercial renovation — office, retail & restaurant fit-outs in Langley City, Willoughby & Walnut Grove. Permits handled, minimal disruption. Free quote.',
    },
    // 2026-06-25: Remaining 9 commercial city overrides.
    'commercial/burnaby': {
      title: 'Commercial Renovation Burnaby | Reno Stars',
      description: 'Burnaby commercial renovation — office, retail, restaurant & strata lobby fit-outs in Metrotown, Brentwood & Edmonds. Off-hours scheduling, permits handled. Free consultation.',
    },
    'commercial/new-westminster': {
      title: 'Commercial Renovation New Westminster | Reno Stars',
      description: "New Westminster commercial renovation — office, retail & restaurant fit-outs in Downtown, Sapperton & Queensborough. Permits handled, minimal disruption. Free consultation.",
    },
    'commercial/north-vancouver': {
      title: 'Commercial Renovation North Vancouver | Reno Stars',
      description: 'North Vancouver commercial renovation — office, retail & restaurant fit-outs on Lonsdale & in Lynn Valley. Permits handled, off-hours scheduling. Free consultation.',
    },
    'commercial/port-coquitlam': {
      title: 'Commercial Renovation Port Coquitlam | Reno Stars',
      description: 'Port Coquitlam commercial renovation — office, retail & restaurant fit-outs in Town Centre & Oxford Heights. Permits handled, minimal disruption. Free consultation.',
    },
    'commercial/port-moody': {
      title: 'Commercial Renovation Port Moody | Reno Stars',
      description: 'Port Moody commercial renovation — office, retail & restaurant fit-outs in Inlet Centre & Moody Centre. Permits handled, off-hours scheduling. Free consultation.',
    },
    'commercial/richmond': {
      title: 'Commercial Renovation Richmond BC | Reno Stars',
      description: 'Richmond commercial renovation — office, retail, restaurant & medical fit-outs in Brighouse, Steveston & Alexandra. Permits handled, minimal disruption. Free consultation.',
    },
    'commercial/surrey': {
      title: 'Commercial Renovation Surrey BC | Reno Stars',
      description: 'Surrey commercial renovation — office, retail, restaurant & clinic fit-outs in Guildford, Newton & City Centre. Permits handled, off-hours scheduling. Free consultation.',
    },
    'commercial/vancouver': {
      title: 'Commercial Renovation Vancouver BC | Reno Stars',
      description: 'Vancouver commercial renovation — office, retail, restaurant & medical fit-outs Downtown, Gastown, Mount Pleasant & East Van. Permits handled. $150–$500/sqft. Free consultation.',
    },
    'commercial/white-rock': {
      title: 'Commercial Renovation White Rock | Reno Stars',
      description: 'White Rock & South Surrey commercial renovation — retail, restaurant & clinic fit-outs. Permits handled, minimal disruption to neighbouring businesses. Free consultation.',
    },
    // 2026-06-25: Realtor (pre-sale) service city overrides for all 14 cities.
    'realtor/burnaby': {
      title: 'Pre-Sale Renovation Burnaby | For Realtors | Reno Stars',
      description: 'Burnaby pre-sale renovation for realtors & sellers — kitchen, bathroom & cosmetic updates in Metrotown, Heights & Capitol Hill. 2–4 week timeline. Free quote.',
    },
    'realtor/coquitlam': {
      title: 'Pre-Sale Renovation Coquitlam | For Realtors | Reno Stars',
      description: 'Coquitlam pre-sale renovation — kitchen, bathroom & cosmetic updates in Burke Mountain, Westwood Plateau & Maillardville. 2–4 week timeline. Free quote.',
    },
    'realtor/delta': {
      title: 'Pre-Sale Renovation Delta BC | For Realtors | Reno Stars',
      description: 'Delta pre-sale renovation for realtors & sellers — kitchen, bathroom & cosmetic updates in Tsawwassen, Ladner & North Delta. 2–4 week timeline. Free quote.',
    },
    'realtor/langley': {
      title: 'Pre-Sale Renovation Langley | For Realtors | Reno Stars',
      description: 'Langley pre-sale renovation — kitchen, bathroom & cosmetic updates in Willoughby, Walnut Grove & Fort Langley. Best ROI updates for sellers. Free quote.',
    },
    'realtor/maple-ridge': {
      title: 'Pre-Sale Renovation Maple Ridge | For Realtors | Reno Stars',
      description: 'Maple Ridge pre-sale renovation for realtors & sellers — kitchen, bathroom & cosmetic updates in Silver Valley & Albion. 2–4 week timeline. Free quote.',
    },
    'realtor/new-westminster': {
      title: 'Pre-Sale Renovation New Westminster | For Realtors | Reno Stars',
      description: "New Westminster pre-sale renovation — kitchen, bathroom & cosmetic updates in Queen's Park, Sapperton & Uptown. Best ROI updates for sellers. Free quote.",
    },
    'realtor/north-vancouver': {
      title: 'Pre-Sale Renovation North Vancouver | For Realtors | Reno Stars',
      description: 'North Vancouver pre-sale renovation for realtors & sellers — kitchen, bathroom & cosmetic updates in Lynn Valley, Lonsdale & Deep Cove. Free quote.',
    },
    'realtor/port-coquitlam': {
      title: 'Pre-Sale Renovation Port Coquitlam | For Realtors | Reno Stars',
      description: 'Port Coquitlam pre-sale renovation — kitchen, bathroom & cosmetic updates in Citadel Heights, Riverwood & West PoCo. Best ROI updates for sellers. Free quote.',
    },
    'realtor/port-moody': {
      title: 'Pre-Sale Renovation Port Moody | For Realtors | Reno Stars',
      description: 'Port Moody pre-sale renovation for realtors & sellers — kitchen, bathroom & cosmetic updates in Heritage Woods & Moody Centre. Free quote.',
    },
    'realtor/richmond': {
      title: 'Pre-Sale Renovation Richmond BC | For Realtors | Reno Stars',
      description: 'Richmond pre-sale renovation — kitchen, bathroom & cosmetic updates in Steveston, Brighouse & Terra Nova. Best ROI for sellers & realtors. Free quote.',
    },
    'realtor/surrey': {
      title: 'Pre-Sale Renovation Surrey | For Realtors | Reno Stars',
      description: 'Surrey pre-sale renovation for realtors & sellers — kitchen, bathroom & cosmetic updates in Fleetwood, Newton & South Surrey. 2–4 week timeline. Free quote.',
    },
    'realtor/vancouver': {
      title: 'Pre-Sale Renovation Vancouver | For Realtors | Reno Stars',
      description: 'Vancouver pre-sale renovation — kitchen, bathroom & cosmetic updates in Kitsilano, East Van & Mount Pleasant. Best ROI updates for sellers & realtors. Free quote.',
    },
    'realtor/west-vancouver': {
      title: 'Pre-Sale Renovation West Vancouver | For Realtors | Reno Stars',
      description: 'West Vancouver pre-sale renovation for realtors & sellers — kitchen, bathroom & luxury cosmetic updates in Caulfeild, Dundarave & British Properties. Free quote.',
    },
    'realtor/white-rock': {
      title: 'Pre-Sale Renovation White Rock | For Realtors | Reno Stars',
      description: 'White Rock & South Surrey pre-sale renovation — kitchen, bathroom & cosmetic updates. Best ROI updates for sellers & realtors near East Beach & West Beach. Free quote.',
    },
    // Bathroom — high impressions
    'bathroom/burnaby': {
      title: 'Bathroom Renovation Burnaby | $15K–$45K | Reno Stars',
      description: 'Burnaby bathroom renovation — tiled showers, tub conversions, custom vanities. Metrotown to Heights. $15K–$45K, 3–6 weeks. Free quote.',
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
    // 2026-06-23: Remove price range from title — CTR A/B test per owner directive.
    // Price ranges in SERP titles depress CTR for high-cost whole-house queries
    // because users see "$50K–$200K+" before clicking and self-select out.
    'whole-house/surrey': {
      title: 'Whole-House Renovation Surrey | Real Projects | Reno Stars',
      description: 'Surrey whole-house renovation — Fleetwood, Newton, Cloverdale, South Surrey. SFH + secondary suite work. $50K–$200K+, 18+ yrs, $5M insured. Free quote.',
    },
    // 2026-06-21 GSC scan: white-rock whole-house at pos 6.35 / 83 impressions / 0 clicks.
    // Generic template showing — adding localized override to match surrey/burnaby/richmond pattern.
    'whole-house/white-rock': {
      title: 'Whole-House Renovation White Rock | $50K–$200K+ | Reno Stars',
      description: 'White Rock whole-house renovation — East Beach, West Beach & South Surrey. SFH & character home projects. $50K–$200K+ from real projects. $5M insured. Free quote.',
    },
    // 2026-05-19 GSC pass: missing high-impression combos. Each entry below
    // targets a specific city+service query where the generic template was
    // shown but no clicks earned. Order = descending monthly impressions.
    // (Skipped combos that already exist above — those were tuned earlier.)
    'bathroom/west-vancouver': {
      title: 'Bathroom Renovation West Vancouver | $20K–$60K | Reno Stars',
      description: 'West Vancouver bathroom renovation — Ambleside, British Properties, Caulfeild. Curbless showers, premium tile, custom vanities. $20K–$60K, 3–6 weeks. Free quote.',
    },
    'basement/vancouver': {
      title: 'Basement Renovation Vancouver | $30K–$120K+ | Reno Stars',
      description: 'Vancouver basement renovation — finishing, suite conversions, family rooms. Kitsilano to Killarney. Permit-aware, egress-compliant. $30K–$120K+ from real projects.',
    },
    'basement/burnaby': {
      title: 'Basement Renovation Burnaby | $30K–$120K+ | Reno Stars',
      description: 'Burnaby basement renovation — Metrotown, Heights, Capitol Hill. Finishing, secondary suites, family rooms. Strata-compliant, permit-aware. $30K–$120K+. Free quote.',
    },
    'basement/port-coquitlam': {
      title: 'Basement Renovation Port Coquitlam | $30K–$120K+ | Reno Stars',
      description: 'Port Coquitlam basement renovation — finishing, suite conversions, family rooms. Permit-aware, egress-compliant. $30K–$120K+ from real projects. Free quote.',
    },
    'basement/port-moody': {
      title: 'Basement Renovation Port Moody | $30K–$120K+ | Reno Stars',
      description: 'Port Moody basement renovation — finishing, suite conversions, family rooms. Inlet to Heritage Mountain. Permit-aware, $5M insured. $30K–$120K+. Free quote.',
    },
    // 2026-06-25: Kitchen city-specific overrides for remaining 7 cities without custom meta.
    // Price ranges from real completed projects per city (§8-compliant DB data).
    'kitchen/delta': {
      title: 'Kitchen Renovation Delta BC | $20K–$50K | Reno Stars',
      description: 'Delta kitchen renovation — Tsawwassen, Ladner & North Delta. Custom cabinets, quartz countertops, full layout redesign. $20K–$50K from real projects. 3–5 weeks. Free quote.',
    },
    'kitchen/langley': {
      title: 'Kitchen Renovation Langley BC | $20K–$35K | Reno Stars',
      description: 'Langley kitchen renovation — Willoughby, Walnut Grove, Fort Langley. Custom & prefab cabinets, quartz, layout redesign. $20K–$35K from real projects. Free quote.',
    },
    'kitchen/maple-ridge': {
      title: 'Kitchen Renovation Maple Ridge | $22K–$50K | Reno Stars',
      description: 'Maple Ridge kitchen renovation — Silver Valley, Albion, Cottonwood. Custom cabinets, quartz countertops, full layout. $22K–$50K from real projects. Free quote.',
    },
    'kitchen/new-westminster': {
      title: 'Kitchen Renovation New Westminster | $20K–$40K | Reno Stars',
      description: "New Westminster kitchen renovation — Queen's Park heritage, Sapperton & Queensborough. Custom cabinets, quartz countertops, layout redesign. $20K–$40K. Free quote.",
    },
    'kitchen/port-coquitlam': {
      title: 'Kitchen Renovation Port Coquitlam | $22K–$45K | Reno Stars',
      description: 'Port Coquitlam kitchen renovation — Citadel Heights, Riverwood & West PoCo. Custom & prefab cabinets, quartz, layout redesign. $22K–$45K from real projects. Free quote.',
    },
    'kitchen/port-moody': {
      title: 'Kitchen Renovation Port Moody | $25K–$55K | Reno Stars',
      description: 'Port Moody kitchen renovation — Heritage Woods, Moody Centre & Inlet Centre. Custom cabinets, quartz countertops, full layout redesign. $25K–$55K. Free quote.',
    },
    'kitchen/white-rock': {
      title: 'Kitchen Renovation White Rock | $16K–$46K | Reno Stars',
      description: 'White Rock kitchen renovation — East Beach, West Beach & South Surrey. Custom cabinets, quartz countertops, layout redesign. $16K–$46K from real projects. Free quote.',
    },
    // 2026-06-25: Bathroom overrides for 7 cities.
    'bathroom/coquitlam': {
      title: 'Bathroom Renovation Coquitlam | $14K–$35K | Reno Stars',
      description: 'Coquitlam bathroom renovation — Burke Mountain condos, Westwood Plateau SFH. Walk-in showers, tub conversions, custom vanities. $14K–$35K, 3–6 weeks. Free quote.',
    },
    'bathroom/delta': {
      title: 'Bathroom Renovation Delta BC | $15K–$35K | Reno Stars',
      description: 'Delta bathroom renovation — Tsawwassen coastal, Ladner heritage, North Delta. Walk-in showers, soaker tubs, custom vanities. $15K–$35K, 3–6 weeks. Free quote.',
    },
    'bathroom/langley': {
      title: 'Bathroom Renovation Langley BC | $12K–$35K | Reno Stars',
      description: 'Langley bathroom renovation — Willoughby, Walnut Grove & Fort Langley. Walk-in showers, tub conversions, custom tile & vanities. $12K–$35K. 3–6 weeks. Free quote.',
    },
    'bathroom/new-westminster': {
      title: 'Bathroom Renovation New Westminster | $14K–$35K | Reno Stars',
      description: "New Westminster bathroom renovation — Queen's Park, Sapperton & Queensborough. Walk-in showers, soaker tubs, custom vanities. $14K–$35K, 3–6 weeks. Free quote.",
    },
    'bathroom/port-coquitlam': {
      title: 'Bathroom Renovation Port Coquitlam | $14K–$35K | Reno Stars',
      description: 'Port Coquitlam bathroom renovation — Citadel Heights, Riverwood, Oxford Heights. Walk-in showers, tub conversions, custom vanities. $14K–$35K. Free quote.',
    },
    'bathroom/port-moody': {
      title: 'Bathroom Renovation Port Moody | $16K–$40K | Reno Stars',
      description: 'Port Moody bathroom renovation — Heritage Woods, Moody Centre & Inlet Centre. Walk-in showers, soaker tubs, custom vanities. $16K–$40K, 3–6 weeks. Free quote.',
    },
    'bathroom/surrey': {
      title: 'Bathroom Renovation Surrey BC | $14K–$40K | Reno Stars',
      description: 'Surrey bathroom renovation — Fleetwood, Newton, Cloverdale & South Surrey. Walk-in showers, tub conversions, custom tile & vanities. $14K–$40K. Free quote.',
    },
    // 2026-06-25: Basement overrides for 8 cities.
    'basement/coquitlam': {
      title: 'Basement Renovation Coquitlam | $35K–$120K+ | Reno Stars',
      description: 'Coquitlam basement renovation — Burke Mountain, Westwood Plateau, Maillardville. Finishing, suite conversions, family rooms. Permit-aware. $35K–$120K+. Free quote.',
    },
    'basement/delta': {
      title: 'Basement Renovation Delta BC | $30K–$110K+ | Reno Stars',
      description: 'Delta basement renovation — Tsawwassen, Ladner & North Delta. Finishing, secondary suites, family rooms. Permit-aware, egress-compliant. $30K–$110K+. Free quote.',
    },
    'basement/langley': {
      title: 'Basement Renovation Langley BC | $30K–$110K+ | Reno Stars',
      description: 'Langley basement renovation — Willoughby, Walnut Grove, Fort Langley. Finishing, secondary suites, family rooms. Permit-aware. $30K–$110K+. Free quote.',
    },
    'basement/maple-ridge': {
      title: 'Basement Renovation Maple Ridge | $30K–$110K+ | Reno Stars',
      description: 'Maple Ridge basement renovation — Silver Valley, Albion, Cottonwood. Finishing, secondary suites, family rooms. Permit-aware, $5M insured. $30K–$110K+. Free quote.',
    },
    'basement/new-westminster': {
      title: 'Basement Renovation New Westminster | $30K–$110K+ | Reno Stars',
      description: "New Westminster basement renovation — Queen's Park heritage, Queensborough. Finishing, suite conversions, family rooms. Permit-aware. $30K–$110K+. Free quote.",
    },
    'basement/richmond': {
      title: 'Basement Renovation Richmond BC | $35K–$120K+ | Reno Stars',
      description: 'Richmond basement renovation — Steveston, Brighouse, Terra Nova. Finishing, secondary suites, family rooms. Permit-aware, egress-compliant. $35K–$120K+. Free quote.',
    },
    'basement/west-vancouver': {
      title: 'Basement Renovation West Vancouver | $40K–$130K+ | Reno Stars',
      description: 'West Vancouver basement renovation — British Properties, Caulfeild, Dundarave. Wine cellars, home theatres, suite conversions. Luxury finishes. $40K–$130K+. Free quote.',
    },
    'basement/white-rock': {
      title: 'Basement Renovation White Rock | $30K–$110K+ | Reno Stars',
      description: 'White Rock basement renovation — East Beach, West Beach & South Surrey. Finishing, secondary suites, family rooms. Permit-aware, $5M insured. $30K–$110K+. Free quote.',
    },
    // 2026-06-25: Whole-house overrides for 6 cities.
    'whole-house/delta': {
      title: 'Home Renovation Delta BC | $50K–$200K+ | Reno Stars',
      description: 'Delta home renovation — Tsawwassen, Ladner & North Delta. Kitchen, bathroom & whole-house remodels. $50K–$200K+, 18+ yrs, $5M insured. Free quote.',
    },
    'whole-house/langley': {
      title: 'Home Renovation Langley BC | $50K–$200K+ | Reno Stars',
      description: 'Langley home renovation — Willoughby, Walnut Grove & Fort Langley. Kitchen, bathroom & whole-house remodels. $50K–$200K+, 18+ yrs, $5M insured. Free quote.',
    },
    'whole-house/maple-ridge': {
      title: 'Home Renovation Maple Ridge | $50K–$200K+ | Reno Stars',
      description: 'Maple Ridge home renovation — Silver Valley, Albion & Cottonwood. Kitchen, bathroom & whole-house remodels. $50K–$200K+, 18+ yrs, $5M insured. Free quote.',
    },
    'whole-house/new-westminster': {
      title: 'Home Renovation New Westminster | $50K–$200K+ | Reno Stars',
      description: "New Westminster home renovation — Queen's Park heritage, Sapperton & Uptown. Kitchen, bathroom & whole-house remodels. $50K–$200K+, $5M insured. Free quote.",
    },
    'whole-house/north-vancouver': {
      title: 'Home Renovation North Vancouver | $50K–$200K+ | Reno Stars',
      description: 'North Vancouver home renovation — Lynn Valley, Lonsdale & Deep Cove. Kitchen, bathroom & whole-house remodels. $50K–$200K+, 18+ yrs, $5M insured. Free quote.',
    },
    'whole-house/port-moody': {
      title: 'Home Renovation Port Moody | $50K–$200K+ | Reno Stars',
      description: 'Port Moody home renovation — Heritage Woods, Moody Centre & Inlet Centre. Kitchen, bathroom & whole-house remodels. $50K–$200K+, $5M insured. Free quote.',
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
    // 2026-06-25: ZH overrides for the 28 new EN combos (kitchen/bathroom/basement/whole-house).
    'kitchen/delta': {
      title: '德尔塔厨房装修费用2026 | Reno Stars',
      description: '德尔塔厨房装修——察瓦森、拉德纳及北德尔塔。定制橱柜、石英台面、布局重设计。费用$20K–$50K，3–5周完工。免费报价。',
    },
    'kitchen/langley': {
      title: '兰里厨房装修费用2026 | Reno Stars',
      description: '兰里厨房装修——威洛比、胡桃树林及弗雷德里克。定制及预制橱柜、石英台面。费用$20K–$35K，3–5周。免费报价。',
    },
    'kitchen/maple-ridge': {
      title: '枫树岭厨房装修费用2026 | Reno Stars',
      description: '枫树岭厨房装修——银谷、阿尔比恩及科顿伍德。定制橱柜、石英台面、全面布局改造。费用$22K–$50K。免费报价。',
    },
    'kitchen/new-westminster': {
      title: '新西敏厨房装修费用2026 | Reno Stars',
      description: '新西敏厨房装修——皇后公园历史建筑、萨帕顿及昆斯伯勒。定制橱柜、石英台面、布局重设计。费用$20K–$40K。免费报价。',
    },
    'kitchen/port-coquitlam': {
      title: '高贵林港厨房装修费用2026 | Reno Stars',
      description: '高贵林港厨房装修——山城高地、河木及西区。定制及预制橱柜、石英台面。费用$22K–$45K，3–5周完工。免费报价。',
    },
    'kitchen/port-moody': {
      title: '满地宝厨房装修费用2026 | Reno Stars',
      description: '满地宝厨房装修——遗产林、穆迪中心及英湾口岸。定制橱柜、石英台面、全面布局改造。费用$25K–$55K。免费报价。',
    },
    'kitchen/white-rock': {
      title: '白石厨房装修费用2026 | Reno Stars',
      description: '白石厨房装修——东滩、西滩及南素里。定制橱柜、石英台面、布局重设计。费用$16K–$46K，来自真实项目数据。免费报价。',
    },
    'bathroom/coquitlam': {
      title: '高贵林浴室装修费用2026 | Reno Stars',
      description: '高贵林浴室装修——博客山公寓、西木高原独立屋。步入式淋浴、浴缸改造、定制梳妆台。费用$14K–$35K，3–6周。免费报价。',
    },
    'bathroom/delta': {
      title: '德尔塔浴室装修费用2026 | Reno Stars',
      description: '德尔塔浴室装修——察瓦森海岸、拉德纳历史建筑。步入式淋浴、泡澡浴缸、定制梳妆台。费用$15K–$35K，3–6周。免费报价。',
    },
    'bathroom/langley': {
      title: '兰里浴室装修费用2026 | Reno Stars',
      description: '兰里浴室装修——威洛比、胡桃树林及弗雷德里克。步入式淋浴、浴缸改造、定制瓷砖及梳妆台。费用$12K–$35K。免费报价。',
    },
    'bathroom/new-westminster': {
      title: '新西敏浴室装修费用2026 | Reno Stars',
      description: '新西敏浴室装修——皇后公园、萨帕顿及昆斯伯勒。步入式淋浴、泡澡浴缸、定制梳妆台。费用$14K–$35K，3–6周。免费报价。',
    },
    'bathroom/port-coquitlam': {
      title: '高贵林港浴室装修费用2026 | Reno Stars',
      description: '高贵林港浴室装修——山城高地、河木及牛津高地。步入式淋浴、浴缸改造、定制梳妆台。费用$14K–$35K。免费报价。',
    },
    'bathroom/port-moody': {
      title: '满地宝浴室装修费用2026 | Reno Stars',
      description: '满地宝浴室装修——遗产林、穆迪中心及英湾口岸。步入式淋浴、泡澡浴缸、定制梳妆台。费用$16K–$40K，3–6周。免费报价。',
    },
    'bathroom/surrey': {
      title: '素里浴室装修费用2026 | Reno Stars',
      description: '素里浴室装修——弗利特伍德、纽顿、克洛弗代尔及南素里。步入式淋浴、浴缸改造、定制瓷砖及梳妆台。费用$14K–$40K。免费报价。',
    },
    'basement/coquitlam': {
      title: '高贵林地下室装修费用2026 | Reno Stars',
      description: '高贵林地下室装修——博客山、西木高原、马拉德维尔。收尾装修、套间改造、家庭活动室。已获许可，费用$35K–$120K+。免费报价。',
    },
    'basement/delta': {
      title: '德尔塔地下室装修费用2026 | Reno Stars',
      description: '德尔塔地下室装修——察瓦森、拉德纳及北德尔塔。收尾装修、辅助套间改造、家庭活动室。已获许可，费用$30K–$110K+。免费报价。',
    },
    'basement/langley': {
      title: '兰里地下室装修费用2026 | Reno Stars',
      description: '兰里地下室装修——威洛比、胡桃树林及弗雷德里克。收尾装修、辅助套间改造、家庭活动室。已获许可，费用$30K–$110K+。免费报价。',
    },
    'basement/maple-ridge': {
      title: '枫树岭地下室装修费用2026 | Reno Stars',
      description: '枫树岭地下室装修——银谷、阿尔比恩及科顿伍德。收尾装修、辅助套间改造、家庭活动室。$5M保险，费用$30K–$110K+。免费报价。',
    },
    'basement/new-westminster': {
      title: '新西敏地下室装修费用2026 | Reno Stars',
      description: '新西敏地下室装修——皇后公园历史建筑、昆斯伯勒。收尾装修、套间改造、家庭活动室。已获许可，费用$30K–$110K+。免费报价。',
    },
    'basement/richmond': {
      title: '列治文地下室装修费用2026 | Reno Stars',
      description: '列治文地下室装修——史蒂文斯顿、布里格豪斯、特拉诺瓦。收尾装修、辅助套间改造、家庭活动室。已获许可，费用$35K–$120K+。免费报价。',
    },
    'basement/west-vancouver': {
      title: '西温哥华地下室装修费用2026 | Reno Stars',
      description: '西温哥华地下室装修——英属山庄、科尔菲尔德及敦达雷夫。酒窖、家庭影院、套间改造。豪华饰面，费用$40K–$130K+。免费报价。',
    },
    'basement/white-rock': {
      title: '白石地下室装修费用2026 | Reno Stars',
      description: '白石地下室装修——东滩、西滩及南素里。收尾装修、辅助套间改造、家庭活动室。$5M保险，费用$30K–$110K+。免费报价。',
    },
    'whole-house/delta': {
      title: '德尔塔家居装修2026 | Reno Stars',
      description: '德尔塔家居装修——察瓦森、拉德纳及北德尔塔。厨房、浴室及全房翻新。费用$50K–$200K+，18年以上经验，$5M保险。免费报价。',
    },
    'whole-house/langley': {
      title: '兰里家居装修2026 | Reno Stars',
      description: '兰里家居装修——威洛比、胡桃树林及弗雷德里克。厨房、浴室及全房翻新。费用$50K–$200K+，18年以上经验，$5M保险。免费报价。',
    },
    'whole-house/maple-ridge': {
      title: '枫树岭家居装修2026 | Reno Stars',
      description: '枫树岭家居装修——银谷、阿尔比恩及科顿伍德。厨房、浴室及全房翻新。费用$50K–$200K+，18年以上经验，$5M保险。免费报价。',
    },
    'whole-house/new-westminster': {
      title: '新西敏家居装修2026 | Reno Stars',
      description: '新西敏家居装修——皇后公园历史建筑、萨帕顿及上城区。厨房、浴室及全房翻新。费用$50K–$200K+，$5M保险。免费报价。',
    },
    'whole-house/north-vancouver': {
      title: '北温哥华家居装修2026 | Reno Stars',
      description: '北温哥华家居装修——林恩谷、朗斯代尔及深湾。厨房、浴室及全房翻新。费用$50K–$200K+，18年以上经验，$5M保险。免费报价。',
    },
    'whole-house/port-moody': {
      title: '满地宝家居装修2026 | Reno Stars',
      description: '满地宝家居装修——遗产林、穆迪中心及英湾口岸。厨房、浴室及全房翻新。费用$50K–$200K+，$5M保险。免费报价。',
    },
    // 2026-06-26: ZH overrides for remaining kitchen/bathroom/basement/whole-house city combos.
    // These 28 entries complete the full 14-city × 4-service ZH coverage.
    'kitchen/burnaby': { title: '本拿比厨房装修费用2026 | Reno Stars', description: '本拿比厨房装修——Metrotown公寓、Heights独立屋、Capitol Hill联排。定制及预制橱柜、石英台面。费用$20K–$60K，3–5周。免费报价。' },
    'kitchen/coquitlam': { title: '高贵林厨房装修费用2026 | Reno Stars', description: '高贵林厨房装修——博客山公寓、西木高原独立屋。定制橱柜、石英台面、全面布局改造。费用$22K–$55K，3–5周完工。免费报价。' },
    'kitchen/north-vancouver': { title: '北温哥华厨房装修费用2026 | Reno Stars', description: '北温哥华厨房装修——林恩谷、朗斯代尔及深湾。定制橱柜、石英台面、开放式布局改造。费用$22K–$60K，3–5周完工。免费报价。' },
    'kitchen/richmond': { title: '列治文厨房装修费用2026 | Reno Stars', description: '列治文厨房装修——史蒂文斯顿、布里格豪斯及特拉诺瓦。定制及预制橱柜、石英台面、布局重设计。费用$20K–$60K，3–5周。免费报价。' },
    'kitchen/surrey': { title: '素里厨房装修费用2026 | Reno Stars', description: '素里厨房装修——弗利特伍德、纽顿、克洛弗代尔及南素里。定制橱柜、石英台面、全面布局改造。费用$20K–$55K，3–5周。免费报价。' },
    'kitchen/vancouver': { title: '温哥华厨房装修费用2026 | Reno Stars', description: '温哥华厨房装修——基斯兰奴、芒特普莱森特、邓巴及市中心公寓。定制橱柜、石英台面、布局重设计。费用$25K–$72K。免费报价。' },
    'kitchen/west-vancouver': { title: '西温哥华厨房装修费用2026 | Reno Stars', description: '西温哥华厨房装修——敦达雷夫、安布尔赛德及英属山庄。高端定制橱柜、石英及大理石台面。费用$30K–$80K。免费报价。' },
    'bathroom/burnaby': { title: '本拿比浴室装修费用2026 | Reno Stars', description: '本拿比浴室装修——Metrotown、Heights、Capitol Hill。步入式淋浴、浴缸改造、定制梳妆台。费用$15K–$45K，3–6周完工。免费报价。' },
    'bathroom/maple-ridge': { title: '枫树岭浴室装修费用2026 | Reno Stars', description: '枫树岭浴室装修——银谷、阿尔比恩及科顿伍德。步入式淋浴、自定义玻璃淋浴屏、定制梳妆台。费用$15K–$35K。免费报价。' },
    'bathroom/north-vancouver': { title: '北温哥华浴室装修费用2026 | Reno Stars', description: '北温哥华浴室装修——林恩谷、朗斯代尔及深湾。步入式淋浴、泡澡浴缸、定制梳妆台。费用$15K–$45K，3–6周。免费报价。' },
    'bathroom/richmond': { title: '列治文浴室装修费用2026 | Reno Stars', description: '列治文浴室装修——史蒂文斯顿、布里格豪斯及特拉诺瓦。步入式淋浴、浴缸改造、定制瓷砖及梳妆台。费用$15K–$45K。免费报价。' },
    'bathroom/vancouver': { title: '温哥华浴室翻新费用2026 | Reno Stars', description: '温哥华浴室翻新——从$15K–$45K。步入式淋浴、浴缸改造、定制梳妆台。3–6周，20年以上经验，$5M保险，3年质保。免费报价。' },
    'bathroom/west-vancouver': { title: '西温哥华浴室装修费用2026 | Reno Stars', description: '西温哥华浴室装修——安布尔赛德、英属山庄及科尔菲尔德。无门槛淋浴、高端瓷砖、定制梳妆台。费用$20K–$60K，3–6周。免费报价。' },
    'bathroom/white-rock': { title: '白石浴室装修费用2026 | Reno Stars', description: '白石及南素里浴室装修——步入式淋浴、泡澡浴缸、定制梳妆台。费用$14K–$40K，3–6周。$5M保险。免费报价。' },
    'basement/burnaby': { title: '本拿比地下室装修费用2026 | Reno Stars', description: '本拿比地下室装修——Metrotown、Heights、Capitol Hill。收尾装修、辅助套间改造、家庭活动室。已获许可，费用$35K–$120K+。免费报价。' },
    'basement/north-vancouver': { title: '北温哥华地下室装修费用2026 | Reno Stars', description: '北温哥华地下室装修——林恩谷、朗斯代尔及深湾。收尾装修、辅助套间改造、坡地特有防水。$5M保险，费用$35K–$130K+。免费报价。' },
    'basement/port-coquitlam': { title: '高贵林港地下室装修费用2026 | Reno Stars', description: '高贵林港地下室装修——山城高地、河木及牛津高地。收尾装修、辅助套间改造、家庭活动室。已获许可，费用$30K–$120K+。免费报价。' },
    'basement/port-moody': { title: '满地宝地下室装修费用2026 | Reno Stars', description: '满地宝地下室装修——遗产林、穆迪中心及英湾口岸。收尾装修、辅助套间改造、家庭影院。$5M保险，费用$30K–$120K+。免费报价。' },
    'basement/surrey': { title: '素里地下室装修费用2026 | Reno Stars', description: '素里地下室装修——弗利特伍德、纽顿、克洛弗代尔及南素里。收尾装修、辅助套间改造、家庭活动室。已获许可，费用$30K–$115K+。免费报价。' },
    'basement/vancouver': { title: '温哥华地下室装修费用2026 | Reno Stars', description: '温哥华地下室装修——收尾装修、套间改造、家庭活动室。基斯兰奴至基拉尼。符合出行规范，费用$30K–$120K+，来自真实项目数据。免费报价。' },
    'whole-house/burnaby': { title: '本拿比全屋装修2026 | Reno Stars', description: '本拿比全屋装修——Heights独立屋、Metrotown联排、Capitol Hill住宅。符合分层规定。费用$50K–$200K+，18年以上经验，$5M保险。免费报价。' },
    'whole-house/coquitlam': { title: '高贵林全屋装修2026 | Reno Stars', description: '高贵林全屋装修——博客山公寓、西木高原独立屋。厨房、浴室及全房翻新。费用$50K–$200K+，$5M保险。免费报价。' },
    'whole-house/port-coquitlam': { title: '高贵林港全屋装修2026 | Reno Stars', description: '高贵林港全屋装修——山城高地、河木及牛津高地。厨房、浴室及全房翻新。费用$50K–$200K+，$5M保险。免费报价。' },
    'whole-house/richmond': { title: '列治文全屋装修2026 | Reno Stars', description: '列治文全屋装修——史蒂文斯顿历史建筑、布里格豪斯公寓、特拉诺瓦独立屋。费用$50K–$200K+，18年以上经验，$5M保险，3年质保。免费报价。' },
    'whole-house/surrey': { title: '素里全屋装修2026 | Reno Stars', description: '素里全屋装修——弗利特伍德、纽顿、克洛弗代尔及南素里。独立屋及辅助套间。费用$50K–$200K+，$5M保险。免费报价。' },
    'whole-house/vancouver': { title: '温哥华全屋装修2026 | Reno Stars', description: '温哥华全屋装修——基斯兰奴、芒特普莱森特、邓巴独立屋及市中心公寓。厨房、浴室及全房翻新。费用$60K–$300K+。免费报价。' },
    'whole-house/west-vancouver': { title: '西温哥华全屋装修2026 | Reno Stars', description: '西温哥华全屋装修——英属山庄、科尔菲尔德及敦达雷夫。高端定制翻新，豪华饰面。费用$80K–$350K+，$5M保险。免费报价。' },
    'whole-house/white-rock': { title: '白石全屋装修2026 | Reno Stars', description: '白石及南素里全屋装修——东滩、西滩独立屋。厨房、浴室及全房翻新。费用$50K–$200K+，$5M保险。免费报价。' },
    // 2026-06-25: ZH for cabinet remaining 10 cities.
    'cabinet/burnaby': { title: '本拿比厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '本拿比厨柜翻新——Metrotown、Heights、Capitol Hill。喷漆$1.5K起，门板更换$4K+，整体翻新$8–$15K。免费报价。' },
    'cabinet/coquitlam': { title: '高贵林厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '高贵林厨柜翻新——博客山、西木高原、马拉德维尔。喷漆$1.5K起，门板更换$4K+，整体翻新$8–$15K。免费报价。' },
    'cabinet/langley': { title: '兰里厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '兰里厨柜翻新——威洛比、胡桃树林及弗雷德里克。喷漆$1.5K起，整体翻新$4–$15K。1–2周完工。免费报价。' },
    'cabinet/new-westminster': { title: '新西敏厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '新西敏厨柜翻新——皇后公园、萨帕顿及上城区。喷漆$1.5K起，整体翻新$8–$15K。1–2周完工。免费报价。' },
    'cabinet/north-vancouver': { title: '北温哥华厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '北温哥华厨柜翻新——林恩谷、朗斯代尔及深湾。喷漆$1.5K起，门板更换$4K+，整体翻新$8–$15K。免费报价。' },
    'cabinet/richmond': { title: '列治文厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '列治文厨柜翻新——史蒂文斯顿、布里格豪斯及特拉诺瓦。喷漆$1.5K起，门板更换$4K+，整体翻新$8–$15K。免费报价。' },
    'cabinet/surrey': { title: '素里厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '素里厨柜翻新——弗利特伍德、纽顿及克洛弗代尔。喷漆$1.5K起，门板更换$4K+，整体翻新$8–$15K。免费报价。' },
    'cabinet/vancouver': { title: '温哥华厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '温哥华厨柜翻新——东区、基斯兰奴及芒特普莱森特。喷漆$1.5K起，门板更换$4K+，整体翻新$8–$15K。免费报价。' },
    'cabinet/west-vancouver': { title: '西温哥华厨柜翻新喷漆 | $1.5K–$25K | Reno Stars', description: '西温哥华厨柜翻新——科尔菲尔德、敦达雷夫及英属山庄。喷漆$1.5K起，整体翻新$4–$15K，豪华饰面至$25K。免费报价。' },
    'cabinet/white-rock': { title: '白石厨柜翻新喷漆 | $1.5K–$15K | Reno Stars', description: '白石及南素里厨柜翻新——喷漆$1.5K起，门板更换$4K+，整体翻新$9–$16K。免费上门报价。' },
    // 2026-06-25: ZH for commercial 9 cities.
    'commercial/burnaby': { title: '本拿比商业装修 | Reno Stars', description: '本拿比商业装修——Metrotown、Brentwood及Edmonds的办公室、零售及餐厅翻新。错峰施工，许可证代办。免费咨询。' },
    'commercial/coquitlam': { title: '高贵林商业装修 | Reno Stars', description: '高贵林商业装修——市中心、奥斯汀高地及博客山的办公室、零售及餐厅翻新。许可证代办，最大限度减少干扰。免费咨询。' },
    'commercial/langley': { title: '兰里商业装修 | Reno Stars', description: '兰里商业装修——兰里市区、威洛比及胡桃树林的办公室、零售及餐厅翻新。许可证代办，最大限度减少干扰。免费咨询。' },
    'commercial/new-westminster': { title: '新西敏商业装修 | Reno Stars', description: '新西敏商业装修——市中心、萨帕顿及昆斯伯勒的办公室、零售及餐厅翻新。许可证代办，错峰施工。免费咨询。' },
    'commercial/north-vancouver': { title: '北温哥华商业装修 | Reno Stars', description: '北温哥华商业装修——朗斯代尔及林恩谷的办公室、零售及餐厅翻新。许可证代办，错峰施工。免费咨询。' },
    'commercial/port-coquitlam': { title: '高贵林港商业装修 | Reno Stars', description: '高贵林港商业装修——市中心及牛津高地的办公室、零售及餐厅翻新。许可证代办，最大限度减少干扰。免费咨询。' },
    'commercial/port-moody': { title: '满地宝商业装修 | Reno Stars', description: '满地宝商业装修——英湾口岸及穆迪中心的办公室、零售及餐厅翻新。许可证代办，错峰施工。免费咨询。' },
    'commercial/richmond': { title: '列治文商业装修 | Reno Stars', description: '列治文商业装修——布里格豪斯、史蒂文斯顿及亚历山德拉的办公室、零售、餐厅及医疗诊所翻新。许可证代办。免费咨询。' },
    'commercial/surrey': { title: '素里商业装修 | Reno Stars', description: '素里商业装修——盖尔福德、纽顿及市中心的办公室、零售、餐厅及诊所翻新。许可证代办，错峰施工。免费咨询。' },
    'commercial/vancouver': { title: '温哥华商业装修 | Reno Stars', description: '温哥华商业装修——市中心、煤气镇、芒特普莱森特及东区的办公室、零售及餐厅翻新。许可证代办。$150–$500/平方英尺。免费咨询。' },
    'commercial/white-rock': { title: '白石商业装修 | Reno Stars', description: '白石及南素里商业装修——零售、餐厅及诊所翻新。许可证代办，最大限度减少对周边商家的干扰。免费咨询。' },
    // 2026-06-25: ZH for realtor pre-sale 14 cities.
    'realtor/burnaby': { title: '本拿比出售前装修 | 经纪人服务 | Reno Stars', description: '本拿比出售前装修——Metrotown、Heights及Capitol Hill的厨房、浴室及外观改善。2–4周完工。免费报价。' },
    'realtor/coquitlam': { title: '高贵林出售前装修 | 经纪人服务 | Reno Stars', description: '高贵林出售前装修——博客山、西木高原及马拉德维尔的厨房、浴室及外观改善。最高回报率翻新方案。免费报价。' },
    'realtor/delta': { title: '德尔塔出售前装修 | 经纪人服务 | Reno Stars', description: '德尔塔出售前装修——察瓦森、拉德纳及北德尔塔的厨房、浴室及外观改善。2–4周完工。免费报价。' },
    'realtor/langley': { title: '兰里出售前装修 | 经纪人服务 | Reno Stars', description: '兰里出售前装修——威洛比、胡桃树林及弗雷德里克的厨房、浴室及外观改善。最高回报率翻新方案。免费报价。' },
    'realtor/maple-ridge': { title: '枫树岭出售前装修 | 经纪人服务 | Reno Stars', description: '枫树岭出售前装修——银谷及阿尔比恩的厨房、浴室及外观改善。2–4周完工。最高回报率翻新方案。免费报价。' },
    'realtor/new-westminster': { title: '新西敏出售前装修 | 经纪人服务 | Reno Stars', description: '新西敏出售前装修——皇后公园、萨帕顿及上城区的厨房、浴室及外观改善。最高回报率翻新方案。免费报价。' },
    'realtor/north-vancouver': { title: '北温哥华出售前装修 | 经纪人服务 | Reno Stars', description: '北温哥华出售前装修——林恩谷、朗斯代尔及深湾的厨房、浴室及外观改善。最高回报率翻新方案。免费报价。' },
    'realtor/port-coquitlam': { title: '高贵林港出售前装修 | 经纪人服务 | Reno Stars', description: '高贵林港出售前装修——山城高地、河木及西区的厨房、浴室及外观改善。2–4周完工。免费报价。' },
    'realtor/port-moody': { title: '满地宝出售前装修 | 经纪人服务 | Reno Stars', description: '满地宝出售前装修——遗产林及穆迪中心的厨房、浴室及外观改善。最高回报率翻新方案。免费报价。' },
    'realtor/richmond': { title: '列治文出售前装修 | 经纪人服务 | Reno Stars', description: '列治文出售前装修——史蒂文斯顿、布里格豪斯及特拉诺瓦的厨房、浴室及外观改善。最高回报率方案。免费报价。' },
    'realtor/surrey': { title: '素里出售前装修 | 经纪人服务 | Reno Stars', description: '素里出售前装修——弗利特伍德、纽顿及南素里的厨房、浴室及外观改善。2–4周完工。免费报价。' },
    'realtor/vancouver': { title: '温哥华出售前装修 | 经纪人服务 | Reno Stars', description: '温哥华出售前装修——基斯兰奴、东区及芒特普莱森特的厨房、浴室及外观改善。最高回报率翻新方案。免费报价。' },
    'realtor/west-vancouver': { title: '西温哥华出售前装修 | 经纪人服务 | Reno Stars', description: '西温哥华出售前装修——科尔菲尔德、敦达雷夫及英属山庄的厨房、浴室及豪华外观改善。最高回报率方案。免费报价。' },
    'realtor/white-rock': { title: '白石出售前装修 | 经纪人服务 | Reno Stars', description: '白石及南素里出售前装修——厨房、浴室及外观改善。最高回报率翻新方案，靠近东滩及西滩。免费报价。' },
    // 2026-06-25: ZH for accessible-bathroom/poly-b remaining cities + critical-load-panel + heat-pump-hvac
    'accessible-bathroom/north-vancouver': { title: '北温哥华无障碍浴室改造 | 老人浴室 | $3K–$60K | Reno Stars', description: '北温哥华无障碍浴室改造——林恩谷、朗斯代尔及深湾。无门槛淋浴、扶手、舒适高度洁具。CSA B651合规。$3K–$60K。免费报价。' },
    'accessible-bathroom/coquitlam': { title: '高贵林无障碍浴室改造 | 轮椅步入式 | $3K–$60K | Reno Stars', description: '高贵林无障碍浴室改造——西木高原、博客山、市中心。无门槛淋浴、扶手、可滚入式座椅、加宽门框。$3K–$60K。' },
    'accessible-bathroom/langley': { title: '兰里无障碍浴室改造 | 老人浴室 | $3K–$60K | Reno Stars', description: '兰里无障碍浴室改造——兰里市区、胡桃树林、威洛比。步入式淋浴、扶手、舒适高度马桶、轮椅可入梳妆台。$3K–$60K。' },
    'accessible-bathroom/delta': { title: 'Delta无障碍浴室改造 | 老人浴室 | $3K–$60K | Reno Stars', description: 'Delta无障碍浴室改造——拉德纳、察瓦森、北Delta。无门槛淋浴、扶手、职业治疗师协调布局、轮椅可入梳妆台。$3K–$60K。' },
    'poly-b-replacement/vancouver': { title: '温哥华 Poly-B 水管更换 | $8K–$25K | 保险续保 | Reno Stars', description: '温哥华 Poly-B 水管更换——东区、基斯兰奴、邓巴独立屋及公寓。全屋 PEX 重新走管、50年保修、保险公司认可文件。$8K–$25K。免费报价。' },
    'poly-b-replacement/north-vancouver': { title: '北温哥华 Poly-B 水管更换 | $8K–$22K | 保险续保 | Reno Stars', description: '北温哥华 Poly-B 水管更换——林恩谷、卡皮拉诺高地、爱德蒙特独立屋。PEX 重新走管、50年保修、保险续保文件。$8K–$22K。' },
    'poly-b-replacement/langley': { title: '兰里 Poly-B 水管更换 | $10K–$22K | 保险续保 | Reno Stars', description: '兰里 Poly-B 水管更换——兰里市区、胡桃树林、威洛比独立屋。PEX 重新走管、50年保修、保险公司认可文件。$10K–$22K。' },
    'poly-b-replacement/west-vancouver': { title: '西温 Poly-B 水管更换 | $10K–$28K | 保险续保 | Reno Stars', description: '西温 Poly-B 水管更换——科尔菲尔德、敦达雷夫、英属山庄独立屋。全屋 PEX 重新走管、50年保修、保险续保文件。$10K–$28K。' },
    'critical-load-panel/vancouver': { title: '温哥华电箱升级 | 200A电力服务 | $3K–$8K | Reno Stars', description: '温哥华配电箱升级——东区、基斯兰奴、邓巴。100A→200A服务升级、电动车充电线路、弧故障断路器。BC许可证+ESA检验。$3K–$8K。' },
    'critical-load-panel/burnaby': { title: '本拿比电箱升级 | 200A电力服务 | $3K–$8K | Reno Stars', description: '本拿比配电箱升级——Metrotown、Heights、Edmonds。100A→200A服务、电动车充电准备、专用厨房线路。BC许可证+ESA。$3K–$8K。' },
    'critical-load-panel/richmond': { title: '列治文电箱升级 | 200A电力服务 | $3K–$8K | Reno Stars', description: '列治文配电箱升级——史蒂文斯顿、布里格豪斯、特拉诺瓦。100A→200A服务升级、电动车就绪线路、弧故障保护。BC许可证+ESA。$3K–$8K。' },
    'critical-load-panel/surrey': { title: '素里电箱升级 | 200A电力服务 | $3K–$8K | Reno Stars', description: '素里配电箱升级——弗利特伍德、纽顿、克洛弗代尔。100A→200A服务、电动车充电线路、专用电器断路器。BC许可证+ESA。$3K–$8K。' },
    'critical-load-panel/north-vancouver': { title: '北温哥华电箱升级 | 200A电力服务 | Reno Stars', description: '北温哥华配电箱升级——林恩谷、朗斯代尔。100A→200A服务、电动车充电准备、弧故障断路器。BC许可证+ESA检验。免费报价。' },
    'critical-load-panel/coquitlam': { title: '高贵林电箱升级 | 200A电力服务 | Reno Stars', description: '高贵林配电箱升级——博客山、西木高原。100A→200A服务、电动车就绪线路、专用厨房断路器。BC许可证+ESA。免费报价。' },
    'critical-load-panel/langley': { title: '兰里电箱升级 | 200A电力服务 | Reno Stars', description: '兰里配电箱升级——兰里市区、胡桃树林、威洛比。100A→200A服务、电动车充电线路、弧故障保护。BC许可证+ESA。免费报价。' },
    'critical-load-panel/west-vancouver': { title: '西温哥华电箱升级 | 200A电力服务 | Reno Stars', description: '西温哥华配电箱升级——科尔菲尔德、敦达雷夫、英属山庄。100A→200A服务、电动车充电线路、优质ESA检验。免费报价。' },
    'critical-load-panel/delta': { title: 'Delta电箱升级 | 200A电力服务 | Reno Stars', description: 'Delta配电箱升级——拉德纳、察瓦森、北Delta。100A→200A服务、电动车充电准备、专用电器线路。BC许可证+ESA。免费报价。' },
    'heat-pump-hvac/vancouver': { title: '温哥华热泵安装 | $8K–$18K | Reno Stars', description: '温哥华热泵及暖通安装——无管道迷你分体机、导管式热泵。符合BC能源阶梯法规。CleanBC退税可申请。东区、基斯兰奴。$8K–$18K。' },
    'heat-pump-hvac/burnaby': { title: '本拿比热泵安装 | $8K–$18K | Reno Stars', description: '本拿比热泵及暖通安装——无管道迷你分体机、多区域系统。CleanBC退税，BC能源阶梯法规。Metrotown、Heights、本拿比山。$8K–$18K。' },
    'heat-pump-hvac/richmond': { title: '列治文热泵安装 | $8K–$18K | Reno Stars', description: '列治文热泵及暖通安装——无管道迷你分体机、导管式热泵。CleanBC退税，BC能源阶梯法规。史蒂文斯顿、布里格豪斯。$8K–$18K。' },
    'heat-pump-hvac/surrey': { title: '素里热泵安装 | $8K–$18K | Reno Stars', description: '素里热泵及暖通安装——无管道迷你分体机、多区域系统。CleanBC退税可申请。弗利特伍德、纽顿、南素里。$8K–$18K。' },
    'heat-pump-hvac/north-vancouver': { title: '北温哥华热泵安装 | $8K–$18K | Reno Stars', description: '北温哥华热泵及暖通安装——无管道迷你分体机、导管系统。CleanBC退税，BC能源阶梯法规。林恩谷、朗斯代尔。$8K–$18K。' },
    'heat-pump-hvac/coquitlam': { title: '高贵林热泵安装 | $8K–$18K | Reno Stars', description: '高贵林热泵及暖通安装——无管道迷你分体机、多区域系统。CleanBC退税可申请。博客山、西木高原。$8K–$18K。' },
  };
  if (locale === 'zh' && zhOverrides[overrideKey]) {
    title = zhOverrides[overrideKey].title;
    description = zhOverrides[overrideKey].description;
  }
  const ogImage = service.image || siteImages.hero;

  // Minor locales render the SAME templated body as EN (only EN/ZH have
  // native copy — the sitemap already restricts this route to en+zh, see
  // SERVICE_CITY_LOCALES in app/sitemap.ts). Noindex the other 12 locales
  // and restrict hreflang to en/zh so Google stops re-crawling ~1,800
  // duplicate service×city URLs ("Crawled - currently not indexed",
  // GSC 2026-07-07). Lift per-locale once native translations exist.
  const isIndexableLocale = locale === 'en' || locale === 'zh';

  return {
    title,
    description,
    ...(isIndexableLocale ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates(`/services/${serviceSlug}/${city}/`, locale, ['en', 'zh']),
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
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      {/* 2026-06-26: LocalBusiness schema — on-page scan P7 finding: all service+city
          sub-pages were missing LocalBusiness schema (only Service + BreadcrumbList
          were present). Adding LocalBusinessAreaSchema gives Google the geo/contact
          signals needed for local pack eligibility on "kitchen renovation richmond"
          style queries that land on service+city sub-pages. */}
      <LocalBusinessAreaSchema
        company={company}
        areaName={localizedArea.name}
        areaSlug={city}
        locale={locale}
        services={[localizedService.title]}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <ServiceSchema
        company={company}
        serviceName={serviceTitle}
        serviceDescription={localizedService.long_description || localizedService.description}
        location={localizedArea.name}
        url={`/${locale}/services/${serviceSlug}/${city}/`}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
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

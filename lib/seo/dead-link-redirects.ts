/**
 * 301s for internal links that 404 because the WRONG URL is written into
 * database content (blog bodies, area/service content and their machine
 * translations) — DI-17, 2026-11-24.
 *
 * Evidence: a full crawl of the 6,161 sitemap pages (401,035 internal links,
 * 475 unique 404 targets / 1,351 occurrences). Every entry below was seen in
 * that crawl and its target is a live page (checked against the sitemap and,
 * for renamed projects, the project's title). Code-generated links were fixed
 * in code instead; this table is only for copy we may not rewrite (no DB
 * writes). Data: dev_queue 118E_links_before.csv.
 *
 * Keys and targets are locale-agnostic paths (no locale, no trailing slash);
 * the visitor's locale is kept: /<loc>/<key>/ → /<loc>/<target>/. Keys are the
 * DECODED path, so machine-translated (Hindi, Persian, Spanish, Chinese) paths
 * match whether the request arrives percent-encoded or not.
 *
 * Resolved in proxy.ts so the status is a true 301 (next.config `permanent`
 * redirects answer 308).
 *
 * ⚠️ A proxy redirect wins over the route. If a post or project is ever
 * PUBLISHED at one of these source slugs, delete its entry here.
 */
import { locales } from '@/i18n/config';

export const DEAD_LINK_REDIRECTS: Readonly<Record<string, string>> = {
  "blog/port-moody-home-renovation-guide-2026": "blog/whole-house-renovation-port-moody-2026",  // nonexistent post; Port Moody equivalent of the city home guides
  "blog/condo-renovation-vancouver-bc-2026": "blog/condo-renovation-cost-vancouver-2026",  // never-published city condo guide → Vancouver condo guide
  "blog/condo-renovation-burnaby-bc-2026": "blog/condo-renovation-cost-metro-vancouver-2026",  // never-published city condo guide → Metro Vancouver condo guide
  "blog/condo-renovation-coquitlam-bc-2026": "blog/condo-renovation-cost-metro-vancouver-2026",  // never-published city condo guide → Metro Vancouver condo guide
  "blog/condo-renovation-richmond-bc-2026": "blog/condo-renovation-cost-metro-vancouver-2026",  // never-published city condo guide → Metro Vancouver condo guide
  "projects/minimalist-bathroom-renovation-in-richmond": "projects/minimalist-bathroom-renovation-richmond",  // title: Minimalist Bathroom Renovation in Richmond
  "projects/two-bathroom-renovation-with-modern-finishes": "projects/two-bathroom-renovation-richmond",  // title: Two Bathroom Renovation with Modern Finishes
  "projects/two-bathroom-renovation-with-custom-features-in-richmond": "projects/two-bathroom-renovation-richmond-2",  // title: Two Bathroom Renovation with Custom Features in Richmond
  "projects/dual-bathroom-renovation-with-unique-powder-room": "projects/richmond-dual-bathroom-renovation-powder-room",  // title: Dual Bathroom Renovation with Unique Powder Room
  "projects/dual-bathroom-renovation-with-unique-droom-room": "projects/richmond-dual-bathroom-renovation-powder-room",  // typo of the above
  "projects/daughters-bath-renovation-with-gray-tiles": "projects/daughter-bath-renovation-richmond-gray-tile",  // renamed slug
  "projects/daughters-bath-renovation-with-grey-tiles": "projects/daughter-bath-renovation-richmond-gray-tile",  // renamed slug (grey)
  "projects/three-and-a-half-bathroom-renovation-delta": "projects/three-bathroom-renovation-delta",  // title: Three and a Half Bathroom Renovation in Delta
  "projects/three-and-a-haf-bathroom-renovation-delta": "projects/three-bathroom-renovation-delta",  // typo
  "projects/three-and-alf-bathroom-renovation-delta": "projects/three-bathroom-renovation-delta",  // typo
  "projects/3-and-a-half-bathroom-renovation-delta": "projects/three-bathroom-renovation-delta",  // variant
  "projects/tres-y-bathroom-renovation-delta": "projects/three-bathroom-renovation-delta",  // machine-translated slug
  "projects/三个半浴室-翻新-delta": "projects/three-bathroom-renovation-delta",  // machine-translated slug
  "projects/三個半浴室-翻新-delta": "projects/three-bathroom-renovation-delta",  // machine-translated slug
  "projects/comprehensive-renovation-of-3-bathrooms": "projects/three-bathroom-renovation-delta",  // anchor: 3.5 bathrooms in a Delta townhouse
  "projects/budget-friendly-condo-renovation-in-richmond": "projects/budget-friendly-condo-renovation-richmond",  // renamed slug
  "projects/budget-friend-condo-renovation-richmond": "projects/budget-friendly-condo-renovation-richmond",  // typo
  "projects/budget-friendly-bathroom-renovation-in-burnaby": "projects/budget-friendly-bathroom-renovation-burnaby",  // renamed slug
  "projects/budget-Friendly-bathroom-renovation-burnaby": "projects/budget-friendly-bathroom-renovation-burnaby",  // case typo
  "projects/budget-friend-bathroom-renovation-in-burnaby": "projects/budget-friendly-bathroom-renovation-burnaby",  // typo
  "projects/budget-friend-bathroom-renovation-burnaby": "projects/budget-friendly-bathroom-renovation-burnaby",  // typo
  "projects/delta-kitchen-renovation-apron-sink-quartz": "projects/delta-kitchen-bathroom-renovation-white-shaker-cabinets",  // anchor "Kitchen Renovation — Delta"; the only Delta kitchen project
  "projects/luxury-bathroom-renovation-north-vancouver/)。": "projects/luxury-bathroom-renovation-north-vancouver",  // href swallowed ")。"
  "projects/renovación-de-baño-minimalista-en-richmond": "projects/minimalist-bathroom-renovation-richmond",  // machine-translated slug
  "projects/मिनिमलिस्ट-बाथरूम-रेनोवेशन-इन-Richmond": "projects/minimalist-bathroom-renovation-richmond",  // machine-translated slug
  "proyectos/renovación-del-baño-de-hijas-con-azulejos-grises": "projects/daughter-bath-renovation-richmond-gray-tile",  // machine-translated path
  "projects/बेटियाँ-स्नान-नवीनीकरण-साथ-ग्रे-टाइल्स": "projects/daughter-bath-renovation-richmond-gray-tile",  // machine-translated slug
  "proyectos/renovación-de-dos-baños-con-acabados-modernos": "projects/two-bathroom-renovation-richmond",  // machine-translated path
  "projects/renovación-de-dos-baños-con-características-personalizadas-en-richmond": "projects/two-bathroom-renovation-richmond-2",  // machine-translated slug
  "projects/renovación-de-baño-doble-con-tocador-único": "projects/richmond-dual-bathroom-renovation-powder-room",  // machine-translated slug
  "projects/burnaby-home-renovation-case-study": "blog/burnaby-home-renovation-case-study",  // exists as a blog post
  "projects/coquitlam-condo-whole-house-renovation-case-study": "blog/coquitlam-condo-renovation-case-study",  // anchor: Coquitlam condo whole-house renovation case study
  "projects/master-bathroom-renovation-burnaby-2026": "projects/bathroom",  // no such project; anchor "Master Bathroom Renovation — Burnaby"
  "projects/hallway-bathroom-renovation-richmond": "projects/bathroom",  // no such project
  "projects/whole-house-renovation-delta-2026": "projects/whole-house",  // no such project; anchor "Whole-House Renovation — Delta"
  "projects/kitchen-renovation-north-vancouver": "projects/kitchen",  // no such project
  "projects/vancouver-condo-renovation-kitchen-two-bathrooms": "projects/whole-house",  // no such project; anchor "Kitchen + 2 Bathrooms — Vancouver"
  "projects/basement-renovation-vancouver-2026": "services/basement/vancouver",  // no such project; basement category is empty → service×city page
  "services/bathroom-renovation": "services/bathroom",
  "services/kitchen-renovation": "services/kitchen",
  "services/whole-house-renovation": "services/whole-house",
  "services/临界负载面板": "services/critical-load-panel",  // translated slug
  "services/cruit-load-panel": "services/critical-load-panel",  // typo
  "services/ritic-load-panel": "services/critical-load-panel",  // typo
  "services/地下室": "services/basement",  // translated slug
  "sc/services/accessible-bathroom": "services/accessible-bathroom",  // stray prefix
  "sc/services/accessibility-bathroom": "services/accessible-bathroom",  // stray prefix
  "servicios/cocina": "services/kitchen",  // translated path
  "contacto": "contact",
  "संपर्क": "contact",
  "proyectos": "projects",
  "projets": "projects",
  "diseño": "design",
  "समीक्षा": "reviews",
  "क्षेत्र": "areas",
  "reas": "areas",  // truncated
  "शोरूम": "showroom",
  "क्षेत्रों/Vancouver": "areas/vancouver",
  "area/vancouver": "areas/vancouver",
  "areas/高贵林": "areas/coquitlam",  // translated slug
  "guides/costos-de-la-suite-del-basement-vancouver": "guides/basement-suite-cost-vancouver",
  "guides/costos-de-la-suite-del-sótano-vancouver": "guides/basement-suite-cost-vancouver",
  "guides/तहखाने-सुइट-लागत-Vancouver": "guides/basement-suite-cost-vancouver",
  "guias/coste-de-renovacion-de-cocinas-vancouver": "guides/kitchen-renovation-cost-vancouver",
  "guias/coste-de-renovación-de-cocinas-vancouver": "guides/kitchen-renovation-cost-vancouver",
  "guides/रसोई-नवीनीकरण-लागत-Vancouver": "guides/kitchen-renovation-cost-vancouver",
  "guides/kitchen-renovation-cost": "guides/kitchen-renovation-cost-vancouver",
  "guias/coste-de-renovacion-de-banos-vancouver": "guides/bathroom-renovation-cost-vancouver",
  "guias/coste-renovacion-del-bano-vancouver": "guides/bathroom-renovation-cost-vancouver",
  "guias/coste-renovacion-de-bano-vancouver": "guides/bathroom-renovation-cost-vancouver",
  "guides/बाथरूम-नवीनीकरण-लागत-Vancouver": "guides/bathroom-renovation-cost-vancouver",
  "guides/bathroom-renovation-cost": "guides/bathroom-renovation-cost-vancouver",
  "guias/coste-de-renovación-del-sótano-vancouver": "guides/basement-renovation-cost-vancouver",
  "guides/costos-de-renovación-del-sótano-vancouver": "guides/basement-renovation-cost-vancouver",
  "guides/तहखाने-नवीनीकरण-लागत-Vancouver": "guides/basement-renovation-cost-vancouver",
  "guides/nesement-renovation-cost-vancouver": "guides/basement-renovation-cost-vancouver",  // typo
  "guides/basement-renovation-cost": "guides/basement-renovation-cost-vancouver",
  "guias/coste-de-renovación-de-toda-la-casa-vancouver": "guides/whole-house-renovation-cost-vancouver",
  "guias/coste-de-renovación-de-la-casa-vancouver": "guides/whole-house-renovation-cost-vancouver",
  "guides/संपूर्ण-घर-नवीनीकरण-लागत-Vancouver": "guides/whole-house-renovation-cost-vancouver",
  "guides/весь-ремонт-стоимость-ванкувер": "guides/whole-house-renovation-cost-vancouver",
  "guides/hole-house-renovation-cost-vancouver": "guides/whole-house-renovation-cost-vancouver",  // typo
  "guides/whole-house-renovation-cost": "guides/whole-house-renovation-cost-vancouver",
  "guides/whole-house-renovation-cost-vancouver/ver": "guides/whole-house-renovation-cost-vancouver",  // stray segment
  "guias/costos-de-reacabado-de-gabinetes-vancouver": "guides/cabinet-refinishing-cost-vancouver",
  "guides/कैबिनेट-रीफिनिशिंग-लागत-Vancouver": "guides/cabinet-refinishing-cost-vancouver",
  "blog/bathroom-renovation-white-rock-2026": "blog/bathroom-renovations-white-rock-bc-2026",  // anchor: White Rock Bathroom Renovation
  "blog/renovaciones-de-baños-white-rock-bc-2026": "blog/bathroom-renovations-white-rock-bc-2026",
  "blog/bathroom-renovation-langley-bc-2026": "blog/bathroom-renovation-langley-2026",  // anchor: Langley Bathroom Renovation
  "blog/how-to-choose-renovation-company-vancouver": "blog/how-to-choose-renovation-contractor-vancouver",  // anchor: How to Choose a Renovation Contractor
  "blog/costo-promedio-de-renovación-de-baños-vancouver": "guides/bathroom-renovation-cost-vancouver",  // translated average-bathroom-cost post (itself 308 → this guide)
  "blog/متوسط-هزینه-بازسازی-حمام-ونکوور": "guides/bathroom-renovation-cost-vancouver",  // same
  "blog/औसत-बाथरूम-नवीनीकरण-लागत-Vancouver": "guides/bathroom-renovation-cost-vancouver",  // same
  "blog/coût-moyen-de-rénovation-de-salle-de-bain-vancouver": "guides/bathroom-renovation-cost-vancouver",  // same
  "blog/तहखाने-नवीनीकरण-लागत-Vancouver-2026": "guides/basement-renovation-cost-vancouver",  // translated basement-renovation-cost-vancouver-2026 (itself 308 → this guide)
  "blog/nesement-renovation-cost-vancouver-2026": "guides/basement-renovation-cost-vancouver",  // typo of the same
  "blog/budget-friend-kitchen-renovation-in-coquitlam": "blog/budget-friendly-kitchen-renovation-in-coquitlam",  // typo
  "blog/budget-friends-kitchen-renovation-in-coquitlam": "blog/budget-friendly-kitchen-renovation-in-coquitlam",  // typo
  "blog/budget-Friendly-kitchen-renovation-in-coquitlam": "blog/budget-friendly-kitchen-renovation-in-coquitlam",  // case typo
  "blog/renovación-de-cocinas-presupuestarias-en-coquitlam": "blog/budget-friendly-kitchen-renovation-in-coquitlam",  // translated slug
  "blog/surrey-hole-house-renovation-case-study": "blog/surrey-whole-house-renovation-case-study",  // typo
  "blog/surray-whole-house-renovation-case-study": "blog/surrey-whole-house-renovation-case-study",  // typo
  "blog/surrey-whole-house-renovation-casestudy": "blog/surrey-whole-house-renovation-case-study",  // typo
  "blog/cabinet-resurfaceing-port-moody-cost-guide": "blog/cabinet-resurfacing-port-moody-cost-guide",  // typo
  "blog/vancouver- Multiplex-laneway-renovation-guide-2026": "blog/vancouver-multiplex-laneway-renovation-guide-2026",  // space/case typo
  "blog/vancouver-renovation-Before-after-10-projects": "blog/vancouver-renovation-before-after-10-projects",  // case typo
  "blog/modern-kitchen-renovation-langley-casestudy": "blog/modern-kitchen-renovation-langley-case-study",  // typo
  "blog/renovación-de-dos-baños-con-puertas-arqueadas-richmond": "blog/two-bathroom-renovation-with-arched-doors-richmond",  // translated slug
  "blog/renovación-de-condominios-de-bajo-presupuesto-en-west-vancouver-case-study": "blog/low-budget-condo-renovation-in-west-vancouver-case-study",  // translated slug
  "blog/نوسازی-کاندو-کم-بودجه-در-غرب-مطالعه-موردی-ونکوور": "blog/low-budget-condo-renovation-in-west-vancouver-case-study",  // translated slug
  "blog/مطالعه-مورد-نوسازی-حمام-غرب-ونکوور": "blog/west-vancouver-bathroom-renovation-case-study",  // translated slug
  "blog/coste-de-renovación-de-baños-richmond-bc-2026": "blog/bathroom-renovation-cost-richmond-bc-2026",  // translated slug
  "blog/guía-de-permisos-de-renovación-bc": "blog/renovation-permits-bc-guide",  // translated slug
  "blog/estudio-de-caso-de-renovación-de-cocina-surrey": "blog/surrey-kitchen-renovation-case-study",  // translated slug
  "blog/مطالعه-مورد-نوسازی-آشپزخانه-سورری": "blog/surrey-kitchen-renovation-case-study",  // translated slug
  "ब्लॉग/सरे-रसोई-नवीनीकरण-केस-स्टडी": "blog/surrey-kitchen-renovation-case-study",  // translated path
  "blog/نوسازی-آپارتمان-سازمان-ونکوور-2026": "blog/apartment-building-renovation-vancouver-2026",  // translated slug
  "ब्लॉग/अपार्टमेंट-बिल्डिंग-रेनोवेशन-Vancouver-2026": "blog/apartment-building-renovation-vancouver-2026",  // translated path
  "ब्लॉग/तहखाने-नवीनीकरण-Vancouver-पूर्ण-गाइड": "blog/basement-renovation-vancouver-complete-guide",  // translated path
  // DI-17 follow-up (task 127/134, Captain approved 2026-11-25): legacy project
  // slugs once linked from the old service-hub cards (code-fixed in #410), so
  // these are now inbound/legacy URLs only.
  "projects/commercial-renovation-skin-lab-granville": "projects/vancouver-skin-lab-commercial-renovation",  // same business and city
  "projects/coquitlam-white-shaker-cabinets": "projects/kitchen",  // legacy kitchen project, no 1:1 live project → kitchen category hub
  "projects/richmond-kitchen-bathroom-remodel": "projects/kitchen",  // legacy kitchen project → kitchen category hub
  "projects/surrey-home-renovation": "projects/kitchen",  // legacy kitchen project → kitchen category hub
  "projects/bathroom-renovation-delta": "projects/bathroom",  // legacy bathroom project → bathroom category hub
  "projects/richmond-bathroom-remodel": "projects/bathroom",  // legacy bathroom project → bathroom category hub
  "projects/bathroom-vanity-west-vancouver": "projects/bathroom",  // legacy bathroom project → bathroom category hub
  "projects/basement-renovation-vancouver": "services/basement/vancouver",  // basement project category is empty/noindex; same target as …-2026
  "projects/cabinet-refacing-richmond": "services/cabinet/richmond",  // cabinet project category is empty/noindex
};

const LOCALE_SET = new Set<string>(locales);

/** `/<loc>/<target>/` for a known dead internal-link path, else null. */
export function deadLinkRedirectPath(pathname: string): string | null {
  let path = pathname;
  try { path = decodeURIComponent(pathname); } catch { /* keep the raw path */ }
  const m = /^\/([^/]+)\/(.+?)\/?$/.exec(path);
  if (!m || !LOCALE_SET.has(m[1])) return null;
  // Own keys only: a plain-object lookup would also match Object.prototype
  // members (/en/constructor/, /en/toString/, /en/__proto__/) and redirect them.
  const target = Object.hasOwn(DEAD_LINK_REDIRECTS, m[2]) ? DEAD_LINK_REDIRECTS[m[2]] : undefined;
  return target ? `/${m[1]}/${target}/` : null;
}

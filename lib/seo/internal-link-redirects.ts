/**
 * Internal links in CONTENT (DB prose, markdown) that point at a URL which
 * answers 301/308 — renamed project/blog slugs, blog posts folded into cost
 * guides, typos and machine-translated paths. normalizeInternalLinks() rewrites
 * them to the final URL so a reader (and a crawler) never takes the redirect
 * hop (task 158 #3, 2026-11-26).
 *
 * GENERATED from a no-follow status check of every internal link target on a
 * full crawl of origin/main 3690449a (158_out/linkcheck_base.tsv); task 164:
 * double-slash keys resolve in one hop, and two 301s production has (checked
 * no-follow against https://www.reno-stars.com) were added. Keys and
 * values are locale-free paths with a trailing slash; the page's locale prefix
 * is kept. The redirects themselves stay in proxy.ts / next.config.ts for old
 * external links. Test A pages are frozen and skip this rewrite.
 */
import { locales } from '@/i18n/config';

export const INTERNAL_LINK_REDIRECTS: Readonly<Record<string, string>> = {
  "/%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A5%87%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A5%8B%E0%A4%82/Vancouver/": "/areas/vancouver/",
  "/%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A5%87%E0%A4%A4%E0%A5%8D%E0%A4%B0/": "/areas/",
  "/%E0%A4%AC%E0%A5%8D%E0%A4%B2%E0%A5%89%E0%A4%97/%E0%A4%85%E0%A4%AA%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%9F%E0%A4%AE%E0%A5%87%E0%A4%82%E0%A4%9F-%E0%A4%AC%E0%A4%BF%E0%A4%B2%E0%A5%8D%E0%A4%A1%E0%A4%BF%E0%A4%82%E0%A4%97-%E0%A4%B0%E0%A5%87%E0%A4%A8%E0%A5%8B%E0%A4%B5%E0%A5%87%E0%A4%B6%E0%A4%A8-Vancouver-2026/": "/blog/apartment-building-renovation-vancouver-2026/",
  "/%E0%A4%AC%E0%A5%8D%E0%A4%B2%E0%A5%89%E0%A4%97/%E0%A4%A4%E0%A4%B9%E0%A4%96%E0%A4%BE%E0%A4%A8%E0%A5%87-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-Vancouver-%E0%A4%AA%E0%A5%82%E0%A4%B0%E0%A5%8D%E0%A4%A3-%E0%A4%97%E0%A4%BE%E0%A4%87%E0%A4%A1/": "/blog/basement-renovation-vancouver-complete-guide/",
  "/%E0%A4%AC%E0%A5%8D%E0%A4%B2%E0%A5%89%E0%A4%97/%E0%A4%B8%E0%A4%B0%E0%A5%87-%E0%A4%B0%E0%A4%B8%E0%A5%8B%E0%A4%88-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%95%E0%A5%87%E0%A4%B8-%E0%A4%B8%E0%A5%8D%E0%A4%9F%E0%A4%A1%E0%A5%80/": "/blog/surrey-kitchen-renovation-case-study/",
  "/%E0%A4%B6%E0%A5%8B%E0%A4%B0%E0%A5%82%E0%A4%AE/": "/showroom/",
  "/%E0%A4%B8%E0%A4%82%E0%A4%AA%E0%A4%B0%E0%A5%8D%E0%A4%95/": "/contact/",
  "/%E0%A4%B8%E0%A4%AE%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%BE/": "/reviews/",
  "/area/vancouver/": "/areas/vancouver/",
  "/areas/%E9%AB%98%E8%B4%B5%E6%9E%97/": "/areas/coquitlam/",
  "/blog/%D9%85%D8%AA%D9%88%D8%B3%D8%B7-%D9%87%D8%B2%DB%8C%D9%86%D9%87-%D8%A8%D8%A7%D8%B2%D8%B3%D8%A7%D8%B2%DB%8C-%D8%AD%D9%85%D8%A7%D9%85-%D9%88%D9%86%DA%A9%D9%88%D9%88%D8%B1/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/%D9%85%D8%B7%D8%A7%D9%84%D8%B9%D9%87-%D9%85%D9%88%D8%B1%D8%AF-%D9%86%D9%88%D8%B3%D8%A7%D8%B2%DB%8C-%D8%A2%D8%B4%D9%BE%D8%B2%D8%AE%D8%A7%D9%86%D9%87-%D8%B3%D9%88%D8%B1%D8%B1%DB%8C/": "/blog/surrey-kitchen-renovation-case-study/",
  "/blog/%D9%85%D8%B7%D8%A7%D9%84%D8%B9%D9%87-%D9%85%D9%88%D8%B1%D8%AF-%D9%86%D9%88%D8%B3%D8%A7%D8%B2%DB%8C-%D8%AD%D9%85%D8%A7%D9%85-%D8%BA%D8%B1%D8%A8-%D9%88%D9%86%DA%A9%D9%88%D9%88%D8%B1/": "/blog/west-vancouver-bathroom-renovation-case-study/",
  "/blog/%D9%86%D9%88%D8%B3%D8%A7%D8%B2%DB%8C-%D8%A2%D9%BE%D8%A7%D8%B1%D8%AA%D9%85%D8%A7%D9%86-%D8%B3%D8%A7%D8%B2%D9%85%D8%A7%D9%86-%D9%88%D9%86%DA%A9%D9%88%D9%88%D8%B1-2026/": "/blog/apartment-building-renovation-vancouver-2026/",
  "/blog/%D9%86%D9%88%D8%B3%D8%A7%D8%B2%DB%8C-%DA%A9%D8%A7%D9%86%D8%AF%D9%88-%DA%A9%D9%85-%D8%A8%D9%88%D8%AF%D8%AC%D9%87-%D8%AF%D8%B1-%D8%BA%D8%B1%D8%A8-%D9%85%D8%B7%D8%A7%D9%84%D8%B9%D9%87-%D9%85%D9%88%D8%B1%D8%AF%DB%8C-%D9%88%D9%86%DA%A9%D9%88%D9%88%D8%B1/": "/blog/low-budget-condo-renovation-in-west-vancouver-case-study/",
  "/blog/%E0%A4%94%E0%A4%B8%E0%A4%A4-%E0%A4%AC%E0%A4%BE%E0%A4%A5%E0%A4%B0%E0%A5%82%E0%A4%AE-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/%E0%A4%A4%E0%A4%B9%E0%A4%96%E0%A4%BE%E0%A4%A8%E0%A5%87-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver-2026/": "/guides/basement-renovation-cost-vancouver/",
  "/blog/average-bathroom-renovation-cost-vancouver/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/basement-renovation-cost-vancouver-2026/": "/guides/basement-renovation-cost-vancouver/",
  "/blog/basement-suite-renovation-cost-vancouver-zh/": "/guides/basement-suite-cost-vancouver/",
  "/blog/basement-suite-renovation-cost-vancouver/": "/guides/basement-suite-cost-vancouver/",
  "/blog/bathroom-renovation-cost-vancouver-by-size/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/bathroom-renovation-cost-vancouver-by-style/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/bathroom-renovation-langley-bc-2026/": "/blog/bathroom-renovation-langley-2026/",
  "/blog/bathroom-renovation-white-rock-2026/": "/blog/bathroom-renovations-white-rock-bc-2026/",
  "/blog/budget-Friendly-kitchen-renovation-in-coquitlam/": "/blog/budget-friendly-kitchen-renovation-in-coquitlam/",
  "/blog/budget-friend-kitchen-renovation-in-coquitlam/": "/blog/budget-friendly-kitchen-renovation-in-coquitlam/",
  "/blog/budget-friends-kitchen-renovation-in-coquitlam/": "/blog/budget-friendly-kitchen-renovation-in-coquitlam/",
  "/blog/cabinet-resurfaceing-port-moody-cost-guide/": "/blog/cabinet-resurfacing-port-moody-cost-guide/",
  "/blog/co%C3%BBt-moyen-de-r%C3%A9novation-de-salle-de-bain-vancouver/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/condo-renovation-burnaby-bc-2026/": "/blog/condo-renovation-cost-metro-vancouver-2026/",
  "/blog/condo-renovation-coquitlam-bc-2026/": "/blog/condo-renovation-cost-metro-vancouver-2026/",
  "/blog/condo-renovation-richmond-bc-2026/": "/blog/condo-renovation-cost-metro-vancouver-2026/",
  "/blog/condo-renovation-vancouver-bc-2026/": "/blog/condo-renovation-cost-vancouver-2026/",
  "/blog/coste-de-renovaci%C3%B3n-de-ba%C3%B1os-richmond-bc-2026/": "/blog/bathroom-renovation-cost-richmond-bc-2026/",
  "/blog/costo-promedio-de-renovaci%C3%B3n-de-ba%C3%B1os-vancouver/": "/guides/bathroom-renovation-cost-vancouver/",
  "/blog/estudio-de-caso-de-renovaci%C3%B3n-de-cocina-surrey/": "/blog/surrey-kitchen-renovation-case-study/",
  "/blog/gu%C3%ADa-de-permisos-de-renovaci%C3%B3n-bc/": "/blog/renovation-permits-bc-guide/",
  "/blog/how-to-choose-renovation-company-vancouver/": "/blog/how-to-choose-renovation-contractor-vancouver/",
  "/blog/modern-kitchen-renovation-langley-casestudy/": "/blog/modern-kitchen-renovation-langley-case-study/",
  "/blog/nesement-renovation-cost-vancouver-2026/": "/guides/basement-renovation-cost-vancouver/",
  "/blog/port-moody-home-renovation-guide-2026/": "/blog/whole-house-renovation-port-moody-2026/",
  "/blog/renovaci%C3%B3n-de-cocinas-presupuestarias-en-coquitlam/": "/blog/budget-friendly-kitchen-renovation-in-coquitlam/",
  "/blog/renovaci%C3%B3n-de-condominios-de-bajo-presupuesto-en-west-vancouver-case-study/": "/blog/low-budget-condo-renovation-in-west-vancouver-case-study/",
  "/blog/renovaci%C3%B3n-de-dos-ba%C3%B1os-con-puertas-arqueadas-richmond/": "/blog/two-bathroom-renovation-with-arched-doors-richmond/",
  "/blog/renovaciones-de-ba%C3%B1os-white-rock-bc-2026/": "/blog/bathroom-renovations-white-rock-bc-2026/",
  "/blog/renovation-cost-vancouver-2026-complete-guide/": "/guides/whole-house-renovation-cost-vancouver/",
  "/blog/surray-whole-house-renovation-case-study/": "/blog/surrey-whole-house-renovation-case-study/",
  "/blog/surrey-hole-house-renovation-case-study/": "/blog/surrey-whole-house-renovation-case-study/",
  "/blog/surrey-whole-house-renovation-casestudy/": "/blog/surrey-whole-house-renovation-case-study/",
  "/blog/vancouver-%20Multiplex-laneway-renovation-guide-2026/": "/blog/vancouver-multiplex-laneway-renovation-guide-2026/",
  "/blog/vancouver-renovation-Before-after-10-projects/": "/blog/vancouver-renovation-before-after-10-projects/",
  "/contacto/": "/contact/",
  "/dise%C3%B1o/": "/design/",
  "/guias/coste-de-renovaci%C3%B3n-de-cocinas-vancouver/": "/guides/kitchen-renovation-cost-vancouver/",
  "/guias/coste-de-renovaci%C3%B3n-de-la-casa-vancouver/": "/guides/whole-house-renovation-cost-vancouver/",
  "/guias/coste-de-renovaci%C3%B3n-de-toda-la-casa-vancouver/": "/guides/whole-house-renovation-cost-vancouver/",
  "/guias/coste-de-renovaci%C3%B3n-del-s%C3%B3tano-vancouver/": "/guides/basement-renovation-cost-vancouver/",
  "/guias/coste-de-renovacion-de-banos-vancouver/": "/guides/bathroom-renovation-cost-vancouver/",
  "/guias/coste-de-renovacion-de-banos-vancouver//": "/guides/bathroom-renovation-cost-vancouver/",
  "/guias/coste-de-renovacion-de-cocinas-vancouver/": "/guides/kitchen-renovation-cost-vancouver/",
  "/guias/coste-renovacion-de-bano-vancouver//": "/guides/bathroom-renovation-cost-vancouver/",
  "/guias/coste-renovacion-del-bano-vancouver//": "/guides/bathroom-renovation-cost-vancouver/",
  "/guias/costos-de-reacabado-de-gabinetes-vancouver/": "/guides/cabinet-refinishing-cost-vancouver/",
  "/guides/%D0%B2%D0%B5%D1%81%D1%8C-%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82-%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C-%D0%B2%D0%B0%D0%BD%D0%BA%D1%83%D0%B2%D0%B5%D1%80/": "/guides/whole-house-renovation-cost-vancouver/",
  "/guides/%E0%A4%95%E0%A5%88%E0%A4%AC%E0%A4%BF%E0%A4%A8%E0%A5%87%E0%A4%9F-%E0%A4%B0%E0%A5%80%E0%A4%AB%E0%A4%BF%E0%A4%A8%E0%A4%BF%E0%A4%B6%E0%A4%BF%E0%A4%82%E0%A4%97-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/cabinet-refinishing-cost-vancouver/",
  "/guides/%E0%A4%A4%E0%A4%B9%E0%A4%96%E0%A4%BE%E0%A4%A8%E0%A5%87-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/basement-renovation-cost-vancouver/",
  "/guides/%E0%A4%A4%E0%A4%B9%E0%A4%96%E0%A4%BE%E0%A4%A8%E0%A5%87-%E0%A4%B8%E0%A5%81%E0%A4%87%E0%A4%9F-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/basement-suite-cost-vancouver/",
  "/guides/%E0%A4%AC%E0%A4%BE%E0%A4%A5%E0%A4%B0%E0%A5%82%E0%A4%AE-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/bathroom-renovation-cost-vancouver/",
  "/guides/%E0%A4%B0%E0%A4%B8%E0%A5%8B%E0%A4%88-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/kitchen-renovation-cost-vancouver/",
  "/guides/%E0%A4%B8%E0%A4%82%E0%A4%AA%E0%A5%82%E0%A4%B0%E0%A5%8D%E0%A4%A3-%E0%A4%98%E0%A4%B0-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A4%A4-Vancouver/": "/guides/whole-house-renovation-cost-vancouver/",
  "/guides/basement-renovation-cost/": "/guides/basement-renovation-cost-vancouver/",
  "/guides/bathroom-renovation-cost-vancouver//": "/guides/bathroom-renovation-cost-vancouver/",
  "/guides/bathroom-renovation-cost/": "/guides/bathroom-renovation-cost-vancouver/",
  "/guides/costos-de-la-suite-del-basement-vancouver/": "/guides/basement-suite-cost-vancouver/",
  "/guides/costos-de-la-suite-del-s%C3%B3tano-vancouver/": "/guides/basement-suite-cost-vancouver/",
  "/guides/costos-de-renovaci%C3%B3n-del-s%C3%B3tano-vancouver/": "/guides/basement-renovation-cost-vancouver/",
  "/guides/hole-house-renovation-cost-vancouver/": "/guides/whole-house-renovation-cost-vancouver/",
  "/guides/kitchen-renovation-cost/": "/guides/kitchen-renovation-cost-vancouver/",
  "/guides/nesement-renovation-cost-vancouver/": "/guides/basement-renovation-cost-vancouver/",
  "/guides/whole-house-renovation-cost-vancouver/ver/": "/guides/whole-house-renovation-cost-vancouver/",
  "/guides/whole-house-renovation-cost/": "/guides/whole-house-renovation-cost-vancouver/",
  "/projects/%E0%A4%AC%E0%A5%87%E0%A4%9F%E0%A4%BF%E0%A4%AF%E0%A4%BE%E0%A4%81-%E0%A4%B8%E0%A5%8D%E0%A4%A8%E0%A4%BE%E0%A4%A8-%E0%A4%A8%E0%A4%B5%E0%A5%80%E0%A4%A8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%B8%E0%A4%BE%E0%A4%A5-%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A5%87-%E0%A4%9F%E0%A4%BE%E0%A4%87%E0%A4%B2%E0%A5%8D%E0%A4%B8/": "/projects/daughter-bath-renovation-richmond-gray-tile/",
  "/projects/%E0%A4%AE%E0%A4%BF%E0%A4%A8%E0%A4%BF%E0%A4%AE%E0%A4%B2%E0%A4%BF%E0%A4%B8%E0%A5%8D%E0%A4%9F-%E0%A4%AC%E0%A4%BE%E0%A4%A5%E0%A4%B0%E0%A5%82%E0%A4%AE-%E0%A4%B0%E0%A5%87%E0%A4%A8%E0%A5%8B%E0%A4%B5%E0%A5%87%E0%A4%B6%E0%A4%A8-%E0%A4%87%E0%A4%A8-Richmond/": "/projects/minimalist-bathroom-renovation-richmond/",
  "/projects/%E4%B8%89%E4%B8%AA%E5%8D%8A%E6%B5%B4%E5%AE%A4-%E7%BF%BB%E6%96%B0-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/%E4%B8%89%E5%80%8B%E5%8D%8A%E6%B5%B4%E5%AE%A4-%E7%BF%BB%E6%96%B0-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/3-and-a-half-bathroom-renovation-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/budget-Friendly-bathroom-renovation-burnaby/": "/projects/budget-friendly-bathroom-renovation-burnaby/",
  "/projects/budget-friend-bathroom-renovation-burnaby/": "/projects/budget-friendly-bathroom-renovation-burnaby/",
  "/projects/budget-friend-bathroom-renovation-in-burnaby/": "/projects/budget-friendly-bathroom-renovation-burnaby/",
  "/projects/budget-friend-condo-renovation-richmond/": "/projects/budget-friendly-condo-renovation-richmond/",
  "/projects/budget-friendly-bathroom-renovation-in-burnaby/": "/projects/budget-friendly-bathroom-renovation-burnaby/",
  "/projects/budget-friendly-condo-renovation-in-richmond/": "/projects/budget-friendly-condo-renovation-richmond/",
  "/projects/comprehensive-renovation-of-3-bathrooms/": "/projects/three-bathroom-renovation-delta/",
  "/projects/critical-load-panel/": "/services/critical-load-panel/",
  "/projects/daughters-bath-renovation-with-gray-tiles/": "/projects/daughter-bath-renovation-richmond-gray-tile/",
  "/projects/daughters-bath-renovation-with-grey-tiles/": "/projects/daughter-bath-renovation-richmond-gray-tile/",
  "/projects/delta-kitchen-renovation-apron-sink-quartz/": "/projects/delta-kitchen-bathroom-renovation-white-shaker-cabinets/",
  "/projects/dual-bathroom-renovation-with-unique-droom-room/": "/projects/richmond-dual-bathroom-renovation-powder-room/",
  "/projects/dual-bathroom-renovation-with-unique-powder-room/": "/projects/richmond-dual-bathroom-renovation-powder-room/",
  "/projects/heat-pump-hvac/": "/services/heat-pump-hvac/",
  "/projects/luxury-bathroom-renovation-north-vancouver/)%E3%80%82/": "/projects/luxury-bathroom-renovation-north-vancouver/",
  "/projects/minimalist-bathroom-renovation-in-richmond/": "/projects/minimalist-bathroom-renovation-richmond/",
  "/projects/realtor/": "/services/realtor/",
  "/projects/renovaci%C3%B3n-de-ba%C3%B1o-doble-con-tocador-%C3%BAnico/": "/projects/richmond-dual-bathroom-renovation-powder-room/",
  "/projects/renovaci%C3%B3n-de-ba%C3%B1o-minimalista-en-richmond/": "/projects/minimalist-bathroom-renovation-richmond/",
  "/projects/renovaci%C3%B3n-de-dos-ba%C3%B1os-con-caracter%C3%ADsticas-personalizadas-en-richmond/": "/projects/two-bathroom-renovation-richmond-2/",
  "/projects/three-and-a-haf-bathroom-renovation-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/three-and-a-half-bathroom-renovation-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/three-and-alf-bathroom-renovation-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/tres-y-bathroom-renovation-delta/": "/projects/three-bathroom-renovation-delta/",
  "/projects/two-bathroom-renovation-with-custom-features-in-richmond/": "/projects/two-bathroom-renovation-richmond-2/",
  "/projects/two-bathroom-renovation-with-modern-finishes/": "/projects/two-bathroom-renovation-richmond/",
  "/projets/": "/projects/",
  "/proyectos/": "/projects/",
  "/proyectos/renovaci%C3%B3n-de-dos-ba%C3%B1os-con-acabados-modernos/": "/projects/two-bathroom-renovation-richmond/",
  "/proyectos/renovaci%C3%B3n-del-ba%C3%B1o-de-hijas-con-azulejos-grises/": "/projects/daughter-bath-renovation-richmond-gray-tile/",
  "/reas/": "/areas/",
  "/sc/services/accessibility-bathroom/": "/services/accessible-bathroom/",
  "/sc/services/accessible-bathroom/": "/services/accessible-bathroom/",
  "/services/%E4%B8%B4%E7%95%8C%E8%B4%9F%E8%BD%BD%E9%9D%A2%E6%9D%BF/": "/services/critical-load-panel/",
  "/services/%E5%9C%B0%E4%B8%8B%E5%AE%A4/": "/services/basement/",
  "/services/bathroom-renovation/": "/services/bathroom/",
  "/services/cruit-load-panel/": "/services/critical-load-panel/",
  "/services/kitchen-renovation/": "/services/kitchen/",
  "/services/ritic-load-panel/": "/services/critical-load-panel/",
  "/services/whole-house-renovation/": "/services/whole-house/",
  "/servicios/cocina/": "/services/kitchen/",
};

/** `/en/blog/x/` → `/en/guides/y/` when x redirects; otherwise the path unchanged. */
export function finalInternalPath(path: string): string {
  const first = path.split('/')[1] ?? '';
  const [prefix, rest] = (locales as readonly string[]).includes(first)
    ? [`/${first}`, path.slice(first.length + 1)]
    : ['', path];
  const key = rest.endsWith('/') ? rest : `${rest}/`;
  const hit = INTERNAL_LINK_REDIRECTS[key] ?? INTERNAL_LINK_REDIRECTS[decodeURIComponentSafe(key)];
  return hit ? `${prefix}${hit}` : path;
}

function decodeURIComponentSafe(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

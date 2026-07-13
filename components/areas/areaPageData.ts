// Neighbourhoods covered per city. Surface as long-tail keyword hooks
// (e.g. "kitsilano renovation" → /areas/vancouver/) without needing a
// programmatic neighbourhood route. Source: GBP service-area definitions
// + intro override copy. Keep 4–8 per city, ordered by population/search.
// 2026-06-25: City-specific blog post clusters. Each key is the area slug;
// each value is an array of { label, slug } pairs for the city's cluster posts.
// Renders in AreaPage between Cost Guides and Nearby Areas so area pages pass
// PageRank equity directly to the city cluster posts.
type CityBlogLink = { label: string; slug: string };
export const CITY_BLOG_CLUSTERS: Record<string, CityBlogLink[]> = {
  burnaby: [
    { label: 'Kitchen', slug: 'kitchen-renovation-burnaby-2026' },
    { label: 'Bathroom', slug: 'burnaby-bathroom-renovation-guide-2026' },
    { label: 'Basement', slug: 'basement-renovations-burnaby-2026' },
    { label: 'Home Guide', slug: 'burnaby-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-burnaby-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-burnaby-cost-guide' },
  ],
  richmond: [
    { label: 'Kitchen', slug: 'kitchen-renovation-richmond-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-cost-richmond-bc-2026' },
    { label: 'Basement', slug: 'basement-renovation-richmond-bc-2026' },
    { label: 'Home Guide', slug: 'richmond-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-richmond-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-richmond-cost-guide' },
  ],
  surrey: [
    { label: 'Kitchen', slug: 'kitchen-renovation-surrey-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-surrey-bc-2026' },
    { label: 'Basement', slug: 'basement-renovations-surrey' },
    { label: 'Home Guide', slug: 'surrey-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-surrey-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-surrey-cost-guide' },
  ],
  coquitlam: [
    { label: 'Kitchen', slug: 'kitchen-renovation-coquitlam-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-coquitlam-bc-2026' },
    { label: 'Basement', slug: 'basement-renovations-coquitlam-2026' },
    { label: 'Home Guide', slug: 'coquitlam-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-coquitlam-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-coquitlam-cost-guide' },
  ],
  'north-vancouver': [
    { label: 'Kitchen', slug: 'kitchen-renovation-north-vancouver-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovations-north-vancouver-2026' },
    { label: 'Basement', slug: 'basement-renovations-north-vancouver' },
    { label: 'Home Guide', slug: 'north-vancouver-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-north-vancouver-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-north-vancouver-cost-guide' },
  ],
  'west-vancouver': [
    { label: 'Kitchen', slug: 'kitchen-renovation-west-vancouver-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovations-west-vancouver-2026' },
    { label: 'Basement', slug: 'basement-renovation-west-vancouver-2026' },
    { label: 'Home Guide', slug: 'west-vancouver-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-west-vancouver-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-west-vancouver-cost-guide' },
  ],
  langley: [
    { label: 'Kitchen', slug: 'kitchen-renovation-langley-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-langley-2026' },
    { label: 'Basement', slug: 'basement-renovations-langley' },
    { label: 'Home Guide', slug: 'langley-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-langley-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-resurfacing-langley-cost-guide' },
  ],
  delta: [
    { label: 'Kitchen', slug: 'kitchen-renovation-delta-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-delta-bc-2026' },
    { label: 'Basement', slug: 'basement-renovation-delta-bc' },
    { label: 'Home Guide', slug: 'delta-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-delta-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-delta-cost-guide' },
  ],
  'new-westminster': [
    { label: 'Kitchen', slug: 'kitchen-renovation-new-westminster-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-new-westminster-2026' },
    { label: 'Basement', slug: 'basement-renovation-new-westminster-2026' },
    { label: 'Home Guide', slug: 'new-westminster-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-new-westminster-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-new-westminster-cost-guide' },
  ],
  vancouver: [
    { label: 'Kitchen', slug: 'kitchen-renovation-vancouver-bc-2026' },
    { label: 'Bathroom', slug: 'average-bathroom-renovation-cost-vancouver' },
    { label: 'Basement', slug: 'basement-renovation-vancouver-complete-guide' },
    { label: 'Home Guide', slug: 'vancouver-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-vancouver-what-to-fix-before-listing' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-vancouver-cost-guide' },
  ],
  'port-coquitlam': [
    { label: 'Kitchen', slug: 'kitchen-renovation-port-coquitlam-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-port-coquitlam-2026' },
    { label: 'Basement', slug: 'basement-renovations-port-coquitlam-2026' },
    { label: 'Home Guide', slug: 'port-coquitlam-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-port-coquitlam-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-port-coquitlam-cost-guide' },
  ],
  'port-moody': [
    { label: 'Kitchen', slug: 'kitchen-renovation-port-moody-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-port-moody-2026' },
    { label: 'Basement', slug: 'basement-renovations-port-moody' },
    { label: 'Home Guide', slug: 'port-moody-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-port-moody-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-resurfacing-port-moody-cost-guide' },
  ],
  'maple-ridge': [
    { label: 'Kitchen', slug: 'kitchen-renovation-maple-ridge-bc-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovation-maple-ridge-bc-2026' },
    { label: 'Basement', slug: 'basement-renovations-maple-ridge' },
    { label: 'Home Guide', slug: 'maple-ridge-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-maple-ridge-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-maple-ridge-cost-guide' },
  ],
  'white-rock': [
    { label: 'Kitchen', slug: 'kitchen-renovation-white-rock-2026' },
    { label: 'Bathroom', slug: 'bathroom-renovations-white-rock-bc-2026' },
    { label: 'Basement', slug: 'basement-renovation-white-rock-2026' },
    { label: 'Home Guide', slug: 'white-rock-home-renovation-guide-2026' },
    { label: 'Pre-Sale', slug: 'pre-sale-renovation-white-rock-bc-2026' },
    { label: 'Cabinets', slug: 'cabinet-refinishing-white-rock-cost-guide' },
  ],
};

export const CITY_NEIGHBOURHOODS: Record<string, string[]> = {
  vancouver: ['Kitsilano', 'Mount Pleasant', 'Kerrisdale', 'Dunbar', 'West End', 'Yaletown', 'Marpole', 'Oakridge'],
  burnaby: ['Metrotown', 'The Heights', 'Capitol Hill', 'Brentwood', 'Burnaby Mountain', 'South Burnaby', 'Lougheed'],
  coquitlam: ['Burke Mountain', 'Westwood Plateau', 'Maillardville', 'Austin Heights', 'Eagle Ridge', 'Ranch Park'],
  surrey: ['Fleetwood', 'Newton', 'Cloverdale', 'South Surrey', 'Guildford', 'Whalley'],
  richmond: ['Steveston', 'Brighouse', 'Terra Nova', 'Hamilton', 'Thompson', 'Sea Island'],
  'north-vancouver': ['Lynn Valley', 'Lonsdale', 'Deep Cove', 'Edgemont', 'Lower Lonsdale', 'Capilano'],
  'west-vancouver': ['Caulfeild', 'Dundarave', 'Ambleside', 'British Properties', 'Horseshoe Bay'],
  'new-westminster': ['Quay', 'Sapperton', 'Queens Park', 'Brow of the Hill', 'West End'],
  'maple-ridge': ['Albion', 'Cottonwood', 'Hammond', 'Haney', 'West Maple Ridge', 'Whonnock'],
  'port-coquitlam': ['Citadel Heights', 'Lincoln Park', 'Oxford Heights', 'Birchland Manor', 'Riverwood'],
  'port-moody': ['Heritage Mountain', 'Ioco', 'Newport', 'Glenayre', 'Inlet Centre'],
  delta: ['Ladner', 'Tsawwassen', 'North Delta', 'Beach Grove', 'Sunshine Hills'],
  langley: ['Walnut Grove', 'Willoughby Heights', 'Brookswood', 'Aldergrove', 'Fort Langley'],
  'white-rock': ['East Beach', 'West Beach', 'White Rock Hill', 'South Surrey'],
};

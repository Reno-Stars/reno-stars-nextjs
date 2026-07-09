/**
 * Static cost-guide hub pages (mirror app/sitemap.ts staticPages /guides/*).
 * Shared by the llms.txt + llms-full.txt routes so the guide list can't drift
 * between the two machine-readable documents.
 */
export const COST_GUIDES: { slug: string; label: string }[] = [
  { slug: 'kitchen-renovation-cost-vancouver', label: 'Kitchen Renovation Cost' },
  { slug: 'bathroom-renovation-cost-vancouver', label: 'Bathroom Renovation Cost' },
  { slug: 'whole-house-renovation-cost-vancouver', label: 'Whole House Renovation Cost' },
  { slug: 'basement-renovation-cost-vancouver', label: 'Basement Renovation Cost' },
  { slug: 'basement-suite-cost-vancouver', label: 'Basement Suite Conversion Cost' },
  { slug: 'commercial-renovation-cost-vancouver', label: 'Commercial Renovation Cost' },
  { slug: 'cabinet-refinishing-cost-vancouver', label: 'Cabinet Refacing/Refinishing Cost' },
];

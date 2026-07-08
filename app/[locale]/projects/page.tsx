import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import ProjectsPage from '@/components/pages/ProjectsPage';
import { BreadcrumbSchema, FAQSchema, ItemListSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getProjectsListFromDb, getSitesAsProjectsFromDb, getCategoriesLocalized } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string; location?: string; space?: string; budget?: string; q?: string }>;
}

/** Parse+sanitize the filter params shared by generateMetadata and the page. */
async function resolveFilters(searchParams: PageProps['searchParams'], locale: string) {
  const sp = await searchParams;
  const categories = await getCategoriesLocalized();
  const service = categories.some((c) => c.serviceType === sp.service) ? sp.service : undefined;
  const serviceLabel = service
    ? (categories.find((c) => c.serviceType === service) as unknown as Record<string, string>)?.[locale]
    : undefined;
  const location = sp.location && /^[\p{L} .'-]{2,40}$/u.test(sp.location) ? sp.location : undefined;
  const space = sp.space && /^[\p{L} .'-]{2,40}$/u.test(sp.space) ? sp.space : undefined;
  const budgetMatch = sp.budget?.match(/^(\d{3,7})-(\d{3,7})$/);
  const budget: [number, number] | null = budgetMatch
    ? [parseInt(budgetMatch[1], 10), parseInt(budgetMatch[2], 10)]
    : null;
  const q = sp.q ? sp.q.slice(0, 80) : undefined;
  return { service, serviceLabel, location, space, budget, q };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });
  const { service, serviceLabel, location, budget } = await resolveFilters(searchParams, locale);

  const baseUrl = getBaseUrl();

  // Facet-aware SEO: ?service= and ?location= are finite, high-intent facets
  // ("Whole House Renovation projects in Burnaby") — give them descriptive
  // titles/descriptions and SELF-canonical URLs so they can rank as landing
  // pages. Budget/space/search are refinements, not landing pages: they are
  // STRIPPED from the canonical so engines consolidate them onto the parent
  // service+location facet instead of index-bloating on slider positions.
  const facetBits = [serviceLabel, location].filter(Boolean) as string[];
  const title = facetBits.length ? `${facetBits.join(' · ')} | ${t('title')}` : t('title');
  const budgetNote = budget ? ` ($${budget[0].toLocaleString()} – $${budget[1].toLocaleString()})` : '';
  const description = facetBits.length
    ? `${facetBits.join(' · ')}${budgetNote} — ${t('description')}`
    : t('description');
  const canonicalParams = new URLSearchParams();
  if (service) canonicalParams.set('service', service);
  if (location) canonicalParams.set('location', location);
  const canonicalQs = canonicalParams.toString();
  const canonicalPath = `/projects/${canonicalQs ? `?${canonicalQs}` : ''}`;
  const ogImage = buildOgImageUrl(title);

  return {
    title,
    description,
    alternates: buildAlternates(canonicalPath, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}${canonicalPath}`,
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

export default async function Page({ params, searchParams }: PageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const [t, faqT, company, projects, sitesAsProjects, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'projectsFaqs' }),
    getCompanyFromDb(),
    getProjectsListFromDb(),
    getSitesAsProjectsFromDb(),
    getCategoriesLocalized(),
  ]);

  // Validate + thread ALL filter params server-side so SSR output (and what
  // crawlers see) matches the filtered view, not just for ?service=.
  const { service: initialService, location: initialLocation, space: initialSpaceType, budget: initialBudget, q: initialQuery } =
    await resolveFilters(searchParams, locale);

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
  ];

  const faqs = [
    { question: faqT('q1'), answer: faqT('a1') },
    { question: faqT('q2'), answer: faqT('a2') },
    { question: faqT('q3'), answer: faqT('a3') },
  ];

  const loc = locale as Locale;
  const itemListItems = projects.map((p) => ({
    name: pickLocale(p.title, loc),
    url: `/${locale}/projects/${p.slug}/`,
    image: p.hero_image || p.images?.[0]?.src,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ItemListSchema
        items={itemListItems}
        name={`${company.name} — Renovation Projects`}
        description={`${itemListItems.length} completed renovation projects across Metro Vancouver — kitchens, bathrooms, basements and whole-house remodels.`}
      />
      <ProjectsPage locale={locale as Locale} company={company} projects={projects} sitesAsProjects={sitesAsProjects} categories={categories} initialService={initialService} initialLocation={initialLocation} initialSpaceType={initialSpaceType} initialBudget={initialBudget} initialQuery={initialQuery} />
    </>
  );
}

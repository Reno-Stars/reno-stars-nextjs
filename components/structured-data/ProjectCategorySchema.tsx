import { getBaseUrl } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

interface CategoryProject {
  slug: string;
  title: Record<string, string>;
}

interface ProjectCategorySchemaProps {
  categoryName: string;
  locale: Locale;
  projects: CategoryProject[];
}

export default function ProjectCategorySchema({
  categoryName,
  locale,
  projects,
}: ProjectCategorySchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryName,
    // inLanguage: declares the natural language of the ItemList items
    // (project titles render in `locale`). Caller already passes locale
    // for the URL construction below — just wire it into the schema
    // top-level. Completes the i18n-aware schema cluster discipline
    // (FAQ + Article + HowTo + Breadcrumb + ContactPage + LocalBusiness
    // + ProjectCategory).
    inLanguage: locale,
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/${locale}/projects/${project.slug}/`,
      name: project.title[locale] ?? project.title.en ?? project.slug,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}

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
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/${locale}/projects/${project.slug}/`,
      name: project.title[locale],
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

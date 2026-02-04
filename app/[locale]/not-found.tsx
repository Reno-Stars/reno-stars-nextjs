import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { NAVY, GOLD, SURFACE, TEXT_MID } from '@/lib/theme';

/**
 * Locale-aware 404 page. Rendered inside the [locale] layout,
 * so it does NOT render its own <html>/<body>.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: SURFACE }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: NAVY }}>404</h1>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: NAVY }}>
          {t('notFound')}
        </h2>
        <p className="mb-8" style={{ color: TEXT_MID }}>
          {t('error')}
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: GOLD }}
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}

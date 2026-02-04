'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company } from '@/lib/types';
import { getBlogPostBySlug, getLocalizedBlogPost } from '@/lib/data';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import {
  GOLD, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';


interface BlogPostPageProps {
  locale: Locale;
  postSlug: string;
  company: Company;
}

export default function BlogPostPage({ locale, postSlug, company }: BlogPostPageProps) {
  const t = useTranslations();
  const post = getBlogPostBySlug(postSlug);

  if (!post) notFound();

  const localizedPost = useMemo(() => getLocalizedBlogPost(post, locale), [post, locale]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VisualBreadcrumb variant="light" containerClassName="max-w-4xl mx-auto" items={[
        { href: '/', label: t('nav.home') },
        { href: '/blog', label: t('nav.blog') },
        { label: localizedPost.title, className: 'truncate' },
      ]} />

      {/* Article */}
      <article className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: TEXT }}>
              {localizedPost.title}
            </h1>

            {localizedPost.excerpt && (
              <p className="text-lg mb-8 leading-relaxed" style={{ color: TEXT_MID }}>
                {localizedPost.excerpt}
              </p>
            )}

            <div className="prose prose-lg max-w-none" style={{ color: TEXT_MID }}>
              {localizedPost.content ? (
                <div dangerouslySetInnerHTML={{ __html: localizedPost.content }} />
              ) : (
                <p>{t('blog.comingSoon')}</p>
              )}
            </div>

            {/* Back to Blog */}
            <div className="mt-10 pt-8 border-t" style={{ borderColor: `${TEXT}10` }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: GOLD }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('blog.backToBlog')}
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
            {t('projects.readyToStart2')}
          </h2>
          <p className="text-base mb-6" style={{ color: TEXT_MID }}>
            {t('projects.ctaSubtitle7', { years: company.yearsExperience })}
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
          >
            {t('cta.getFreeQuote')}
          </Link>
        </div>
      </section>

    </div>
  );
}

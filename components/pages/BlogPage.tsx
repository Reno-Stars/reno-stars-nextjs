'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company } from '@/lib/types';
import { getAllBlogPostsLocalized } from '@/lib/data';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE,
  CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface BlogPageProps {
  locale: Locale;
  company: Company;
}

export default function BlogPage({ locale, company }: BlogPageProps) {
  const t = useTranslations();
  const blogPosts = useMemo(() => getAllBlogPostsLocalized(locale), [locale]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>

      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          {blogPosts.length === 0 ? (
            <p className="text-center text-lg py-12" style={{ color: TEXT_MID }}>
              {t('blog.noPosts')}
            </p>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <article key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="rounded-xl p-6 flex items-start justify-between gap-4 transition-all duration-200 hover:translate-x-1 block"
                    style={{ boxShadow: neu(5), backgroundColor: CARD }}
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-2 hover:text-gold transition-colors" style={{ color: TEXT }}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm" style={{ color: TEXT_MID }}>
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 shrink-0 mt-1" style={{ color: GOLD }} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        heading={t('projects.readyToStart2')}
        subtitle={t('projects.ctaSubtitle')}
        showCallButton={false}
        phone={company.phone}
      />
    </div>
  );
}

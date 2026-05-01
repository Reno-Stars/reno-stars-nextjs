'use client';

import OptimizedImage from '@/components/OptimizedImage';
import { Link } from '@/navigation';
import { ArrowRight, DollarSign, Clock, MapPin } from 'lucide-react';
import type { LocalizedProject } from '@/lib/types';
import { CARD, GOLD, GOLD_PALE, NAVY, NAVY_PALE, SURFACE, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

interface FeaturedCityProjectProps {
  project: LocalizedProject;
  /** Section heading e.g. "Recent White Rock Bathroom Project" */
  heading: string;
  /** Subheading e.g. "Real budget, real timeline, real scope from our portfolio" */
  subheading: string;
  /** "View full project" CTA label */
  viewCta: string;
}

/**
 * Hero card for ONE featured project on a service-area combo page.
 *
 * Goal: lift /services/{svc}/{city}/ pages from page 3 (pos 21-33) to
 * page 1 by adding genuine, city-named, budget-named, scope-named depth.
 * Generic combo pages get out-ranked by directories; combo pages with
 * a real-named-project case study don't. Same SEO move as Adept and
 * Enzo Design Build use.
 */
export default function FeaturedCityProject({
  project,
  heading,
  subheading,
  viewCta,
}: FeaturedCityProjectProps) {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>
          {heading}
        </h2>
        <p className="text-center mb-8" style={{ color: TEXT_MID }}>
          {subheading}
        </p>
        <Link
          href={`/projects/${project.slug}` as '/projects/burnaby-whole-house-renovation'}
          className="block rounded-2xl overflow-hidden transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: CARD, boxShadow: neu(4) }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {project.hero_image && (
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
                <OptimizedImage
                  src={project.hero_image}
                  alt={`${project.title} — featured project`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: GOLD }}>
                <MapPin size={14} />
                <span className="font-semibold">{project.location_city}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: TEXT }}>
                {project.title}
              </h3>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: TEXT_MID }}>
                {project.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-5">
                {project.budget_range && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                  >
                    <DollarSign size={12} />
                    {project.budget_range}
                  </span>
                )}
                {project.duration && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: NAVY_PALE, color: NAVY }}
                  >
                    <Clock size={12} />
                    {project.duration}
                  </span>
                )}
                {project.space_type && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: NAVY_PALE, color: NAVY }}
                  >
                    {project.space_type}
                  </span>
                )}
              </div>
              {project.service_scope && project.service_scope.length > 0 && (
                <ul className="text-xs mb-5 space-y-1" style={{ color: TEXT_MUTED }}>
                  {project.service_scope.slice(0, 5).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: GOLD }}>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
              <span
                className="inline-flex items-center gap-2 text-sm font-semibold mt-auto"
                style={{ color: GOLD }}
              >
                {viewCta} <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

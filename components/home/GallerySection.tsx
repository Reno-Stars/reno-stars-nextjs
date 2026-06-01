import { ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import TetrisGallery, { type TetrisGalleryItem } from '@/components/TetrisGallery';
import { GOLD, SURFACE_ALT, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

interface GallerySectionProps {
  gallery: TetrisGalleryItem[];
  translations: {
    title: string;
    subtitle: string;
    projectsLink: string;
  };
}

export default function GallerySection({ gallery, translations: t }: GallerySectionProps) {
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 id="gallery-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
            <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
          </div>
          <Link href="/projects"
            className="hidden md:flex items-center gap-1 text-base font-semibold cursor-pointer transition-colors hover:opacity-80"
            style={{ color: GOLD }}
          >
            {t.projectsLink} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <TetrisGallery
          items={gallery}
          cardClassName="rounded-xl"
          cardStyle={{ boxShadow: neu(5) }}
        />
        {/* Twin visual-hub taglines below the TetrisGallery:
            (1) /before-after/ — added on seo/daily-2026-06-02 (3c1998d).
                Renovation-results trust signal (image pairs of before/
                after states across ~50 projects).
            (2) /design/ — added on seo/daily-2026-06-02 (this commit) as
                kickoff of /design/ rollout. Pre-rollout audit found
                /design/ had ZERO body refs site-wide despite being a
                strong design-research surface (TetrisGallery layouts
                showing renovation design ideas). Natural pair to
                /before-after/ (results) — both are visual hubs that
                readers in inspiration mode want to navigate between.
            Existing /projects/ link in the section header wins for
            primary engagement; these taglines add secondary discoverability
            for the dedicated visual-mode views. */}
        <p className="text-center mt-8 text-sm flex flex-wrap items-center justify-center gap-x-3 gap-y-1" style={{ color: TEXT_MID }}>
          <Link
            href="/before-after"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            See our before / after renovation gallery →
          </Link>
          <span aria-hidden="true" className="hidden sm:inline" style={{ color: TEXT_MUTED }}>·</span>
          <Link
            href="/design"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            Browse design inspiration →
          </Link>
        </p>
      </div>
    </section>
  );
}

import { ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import TetrisGallery, { type TetrisGalleryItem } from '@/components/TetrisGallery';
import { GOLD, SURFACE_ALT, TEXT, TEXT_MID, neu } from '@/lib/theme';

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
        {/* /before-after/ inbound — kicks off the /before-after/ rollout.
            Pre-rollout audit (2026-05-31) found this visual-portfolio
            page had ZERO body-content inbound links site-wide despite
            being a strong renovation-results trust signal (image pairs
            of before/after states across ~50 projects). HomePage
            GallerySection is the natural surface — readers engaging
            with the TetrisGallery above are already in visual-portfolio
            consumption mode. Existing /projects/ link in the section
            header still wins for primary engagement; this adds a
            secondary tagline below the grid for the dedicated before/
            after view. */}
        <p className="text-center mt-8 text-sm" style={{ color: TEXT_MID }}>
          <Link
            href="/before-after"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            See our before / after renovation gallery →
          </Link>
        </p>
      </div>
    </section>
  );
}

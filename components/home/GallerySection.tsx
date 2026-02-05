'use client';

import { ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import TetrisGallery from '@/components/TetrisGallery';
import { GOLD, SURFACE_ALT, TEXT, TEXT_MID, neu } from '@/lib/theme';

interface GallerySectionProps {
  gallery: { image: string; title: string; category: string }[];
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
      </div>
    </section>
  );
}

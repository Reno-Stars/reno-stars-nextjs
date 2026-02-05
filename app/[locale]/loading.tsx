import { SURFACE, GOLD } from '@/lib/theme';

/**
 * Loading UI shown instantly while page data loads.
 * This improves FCP by rendering immediately without waiting for database.
 */
export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero skeleton - matches HeroSection layout */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center" style={{ backgroundColor: '#374151' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl space-y-5">
            {/* Logo placeholder */}
            <div className="h-14 w-56 bg-white/20 rounded-md animate-pulse" />
            {/* Title placeholder */}
            <div className="h-12 w-96 bg-white/20 rounded animate-pulse" />
            {/* Description placeholder */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
            </div>
            {/* Buttons placeholder */}
            <div className="flex gap-3 pt-1">
              <div className="h-12 w-36 rounded-xl animate-pulse" style={{ backgroundColor: GOLD, opacity: 0.5 }} />
              <div className="h-12 w-28 bg-white/20 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Service areas bar skeleton */}
      <section className="py-5 px-4" style={{ backgroundColor: '#DDD8D0' }}>
        <div className="max-w-7xl mx-auto flex justify-center gap-2">
          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </section>

      {/* Content sections skeleton */}
      <section className="py-14 px-4" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

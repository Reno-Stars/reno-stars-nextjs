import { Link } from '@/navigation';
import { GOLD, TEXT_MID, TEXT_MUTED, TEXT, SURFACE_ALT } from '@/lib/theme';

interface ServiceAreasBarProps {
  areas: { slug: string; name: string }[];
  label: string;
}

export default function ServiceAreasBar({ areas, label }: ServiceAreasBarProps) {
  return (
    <section aria-labelledby="service-areas-title" className="py-5 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <h2 id="service-areas-title" className="sr-only">{label}</h2>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider" aria-hidden="true" style={{ color: GOLD }}>{label}</span>
        <span className="mx-1" style={{ color: TEXT_MUTED }}>|</span>
        {areas.map((area, i) => (
          <span key={area.slug} className="text-xs sm:text-sm font-medium" style={{ color: TEXT_MID }}>
            <Link href={`/areas/${area.slug}` as '/'} className="hover:underline" style={{ color: TEXT_MID }}>
              {area.name}
            </Link>
            {i < areas.length - 1 ? <span className="mx-1.5" style={{ color: `${TEXT}20` }}>&bull;</span> : ''}
          </span>
        ))}
      </div>
    </section>
  );
}

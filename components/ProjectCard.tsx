import Image from 'next/image';
import { ChevronRight, Layers } from 'lucide-react';
import { Link } from '@/navigation';
import type { LocalizedProject } from '@/lib/types';
import { GOLD, NAVY, CARD, TEXT, TEXT_MID, TEXT_MUTED, SH_DARK, neu } from '@/lib/theme';

const NEU5 = neu(5);

interface ProjectCardProps {
  project: LocalizedProject;
  /** Show the project description below the title */
  showDescription?: boolean;
  /** Show a chevron arrow in the footer */
  showChevron?: boolean;
  /** Crawlable link to the project detail page */
  href?: string;
  /** Called when the card is clicked (opens modal) */
  onClick?: (project: LocalizedProject) => void;
  /** Whether this card represents a whole-house site project */
  isSiteProject?: boolean;
  /** Number of project areas in the site */
  projectCount?: number;
  /** Translated label for the areas count badge (e.g. "3 Areas") */
  areasCountLabel?: string;
  /** Translated label for site badge (e.g. "Site") */
  siteBadgeLabel?: string;
}

export default function ProjectCard({
  project, showDescription, showChevron, href, onClick,
  isSiteProject, projectCount, areasCountLabel, siteBadgeLabel,
}: ProjectCardProps) {

  const cardContent = (
    <>
      <figure className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
        <Image
          src={project.hero_image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <figcaption className="sr-only">{project.title}</figcaption>
        {project.badge && project.badge !== project.title && (
          <span
            className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: GOLD }}
          >
            {project.badge}
          </span>
        )}
        {isSiteProject && (
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {siteBadgeLabel && (
              <span
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                <Layers className="w-3.5 h-3.5" />
                {siteBadgeLabel}
              </span>
            )}
            {projectCount != null && projectCount > 0 && areasCountLabel && (
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: 'rgba(27,54,93,0.8)', color: 'white' }}
              >
                {areasCountLabel}
              </span>
            )}
          </div>
        )}
      </figure>
      <div className="p-4">
        <h3 className="font-bold mb-1 group-hover:text-gold transition-colors" style={{ color: TEXT }}>
          {project.title}
        </h3>
        {showDescription && (
          <p className="text-sm mb-2 line-clamp-2" style={{ color: TEXT_MID }}>
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.location_city && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${NAVY}12`, color: NAVY }}
              >
                {project.location_city}
              </span>
            )}
            <span className="text-xs" style={{ color: TEXT_MUTED }}>
              {project.category}
            </span>
          </div>
          {showChevron && <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />}
        </div>
      </div>
    </>
  );

  // Stacked card effect for site projects
  const stackedStyle = isSiteProject
    ? { boxShadow: `${NEU5}, 4px 8px 0 -2px ${CARD}, 4px 8px 4px -2px ${SH_DARK}` }
    : { boxShadow: NEU5 };

  const className = "block rounded-2xl overflow-hidden group text-left cursor-pointer w-full";
  const style = { ...stackedStyle, backgroundColor: CARD };

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick ? (e: React.MouseEvent) => { e.preventDefault(); onClick(project); } : undefined}
        className={className}
        style={style}
      >
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={() => onClick(project)} className={className} style={style}>
        {cardContent}
      </button>
    );
  }

  return (
    <article className={className} style={style}>
      {cardContent}
    </article>
  );
}

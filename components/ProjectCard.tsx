import Image from 'next/image';
import { ChevronRight, Layers } from 'lucide-react';
import type { LocalizedProject } from '@/lib/types';
import { GOLD, NAVY, CARD, TEXT, TEXT_MID, TEXT_MUTED, SH_DARK, neu } from '@/lib/theme';

const NEU5 = neu(5);

interface ProjectCardProps {
  project: LocalizedProject;
  /** Show the project description below the title */
  showDescription?: boolean;
  /** Show a chevron arrow in the footer */
  showChevron?: boolean;
  /** Called when the card is clicked (opens modal) */
  onClick?: (project: LocalizedProject) => void;
  /** Whether this card represents a whole-house site project */
  isSiteProject?: boolean;
  /** Number of project areas in the site */
  projectCount?: number;
  /** Translated label for the areas count badge (e.g. "3 Areas") */
  areasCountLabel?: string;
}

export default function ProjectCard({
  project, showDescription, showChevron, onClick,
  isSiteProject, projectCount, areasCountLabel,
}: ProjectCardProps) {
  // Render as <article> when used inside a Link (no onClick), <button> otherwise
  const Tag = onClick ? 'button' : 'article';

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
        {project.badge && (
          <span
            className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: GOLD }}
          >
            {project.badge}
          </span>
        )}
        {isSiteProject && projectCount != null && projectCount > 0 && areasCountLabel && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: NAVY }}
          >
            <Layers className="w-3.5 h-3.5" />
            {areasCountLabel}
          </span>
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
          <span className="text-xs" style={{ color: TEXT_MUTED }}>
            {project.location_city} • {project.category}
          </span>
          {showChevron && <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />}
        </div>
      </div>
    </>
  );

  // Stacked card effect for site projects
  const stackedStyle = isSiteProject
    ? { boxShadow: `${NEU5}, 4px 8px 0 -2px ${CARD}, 4px 8px 4px -2px ${SH_DARK}` }
    : { boxShadow: NEU5 };

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick: () => onClick(project) } : {})}
      className="rounded-2xl overflow-hidden group text-left cursor-pointer w-full"
      style={{ ...stackedStyle, backgroundColor: CARD }}
    >
      {cardContent}
    </Tag>
  );
}

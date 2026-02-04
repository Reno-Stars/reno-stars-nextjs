import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import type { LocalizedProject } from '@/lib/types';
import { GOLD, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

interface ProjectCardProps {
  project: LocalizedProject;
  /** Show the project description below the title */
  showDescription?: boolean;
  /** Show a chevron arrow in the footer */
  showChevron?: boolean;
  /** Called when the card is clicked (opens modal) */
  onClick?: (project: LocalizedProject) => void;
}

export default function ProjectCard({ project, showDescription, showChevron, onClick }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(project)}
      className="rounded-2xl overflow-hidden group text-left cursor-pointer w-full"
      style={{ boxShadow: neu(5), backgroundColor: CARD }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
        <Image
          src={project.hero_image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {project.badge && (
          <span
            className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: GOLD }}
          >
            {project.badge}
          </span>
        )}
      </div>
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
    </button>
  );
}

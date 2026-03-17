'use client';

import { useState, useMemo, useCallback } from 'react';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, ERROR, neu } from '@/lib/theme';
import { slugToLabel } from '@/lib/utils';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from './AdminLocaleProvider';
import DragHandle from './DragHandle';

interface ProjectLayer {
  id: string;
  titleEn: string;
  titleZh: string;
  serviceType: string | null;
  isPublished: boolean;
  displayOrderInSite: number;
}

interface HouseStackProps {
  site: { id: string; titleEn: string; titleZh: string };
  projects: ProjectLayer[];
  selectedId: string | 'site' | 'new';
  onSelect: (id: string | 'site' | 'new') => void;
  onDeleteProject?: (id: string) => void;
  onReorderProjects?: (projectIds: string[]) => void;
}

// Static styles moved outside component to prevent re-creation
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1.25rem',
  backgroundColor: CARD,
  borderRadius: '12px',
  boxShadow: neu(4),
  minWidth: '240px',
};

const houseBodyStyle: React.CSSProperties = {
  backgroundColor: SURFACE,
  borderRadius: '0 0 8px 8px',
  padding: '0.625rem',
};

const layerContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginTop: '0.5rem',
};

const noProjectsStyle: React.CSSProperties = {
  padding: '1rem 0.5rem',
  textAlign: 'center',
  color: TEXT_MID,
  fontSize: '0.75rem',
};

const projectCountStyle: React.CSSProperties = {
  marginTop: '0.75rem',
  fontSize: '0.6875rem',
  color: TEXT_MID,
};

export default function HouseStack({
  site,
  projects,
  selectedId,
  onSelect,
  onDeleteProject,
  onReorderProjects,
}: HouseStackProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Memoize sorted projects to avoid re-sorting on every render
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.displayOrderInSite - b.displayOrderInSite),
    [projects]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, projectId: string) => {
    setDraggedId(projectId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', projectId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId((prev) => (draggedId && draggedId !== projectId ? projectId : prev));
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Reorder projects
    const draggedIndex = sortedProjects.findIndex((p) => p.id === draggedId);
    const targetIndex = sortedProjects.findIndex((p) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...sortedProjects];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Call the reorder callback with new order of IDs
    onReorderProjects?.(newOrder.map((p) => p.id));

    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, sortedProjects, onReorderProjects]);

  // Keyboard reordering support
  const handleKeyDown = useCallback((e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      onSelect(projectId);
      return;
    }

    // Alt+Up/Down for keyboard reordering
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && onReorderProjects) {
      e.preventDefault();
      const currentIndex = sortedProjects.findIndex((p) => p.id === projectId);
      if (currentIndex === -1) return;

      const newIndex = e.key === 'ArrowUp'
        ? Math.max(0, currentIndex - 1)
        : Math.min(sortedProjects.length - 1, currentIndex + 1);

      if (newIndex !== currentIndex) {
        const newOrder = [...sortedProjects];
        const [removed] = newOrder.splice(currentIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        onReorderProjects(newOrder.map((p) => p.id));
      }
    }
  }, [sortedProjects, onReorderProjects, onSelect]);

  const siteTitle = locale === 'zh' ? site.titleZh : site.titleEn;
  const isRoofHovered = hoveredId === 'site';
  const isRoofSelected = selectedId === 'site';

  const handleDeleteClick = useCallback((e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(projectId);
  }, []);

  const handleConfirmDelete = useCallback((e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    onDeleteProject?.(projectId);
    setConfirmDeleteId(null);
  }, [onDeleteProject]);

  const handleCancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  }, []);

  const projectCountText = useMemo(() => {
    const template = t.sites.projectCount;
    const count = String(projects.length);
    return template.includes('{count}') ? template.replace('{count}', count) : `${count} projects`;
  }, [projects.length, t.sites.projectCount]);

  return (
    <div style={containerStyle}>
      {/* Minimal House Icon */}
      <div style={{ width: '200px' }}>
        {/* Roof - Simple triangle outline */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect('site')}
          onKeyDown={(e) => e.key === 'Enter' && onSelect('site')}
          onMouseEnter={() => setHoveredId('site')}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.875rem 1rem',
            backgroundColor: isRoofSelected ? GOLD : SURFACE,
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            borderBottom: `1px solid ${isRoofSelected ? GOLD : 'rgba(27,54,93,0.08)'}`,
            opacity: isRoofHovered && !isRoofSelected ? 0.85 : 1,
          }}
          aria-label={`${t.sites.editSite}: ${siteTitle}`}
        >
          {/* House icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isRoofSelected ? '#fff' : NAVY}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '0.5rem', flexShrink: 0 }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: isRoofSelected ? '#fff' : NAVY,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {siteTitle}
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: isRoofSelected ? 'rgba(255,255,255,0.75)' : TEXT_MID,
                marginTop: '1px',
              }}
            >
              {t.sites.clickToEdit}
            </div>
          </div>
        </div>

        {/* House body */}
        <div style={houseBodyStyle}>
          {/* Add Project button */}
          <button
            type="button"
            onClick={() => onSelect('new')}
            onMouseEnter={() => setHoveredId('new')}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.5rem',
              backgroundColor: selectedId === 'new' ? GOLD : 'transparent',
              color: selectedId === 'new' ? '#fff' : TEXT_MID,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.8125rem',
              transition: 'all 0.15s ease',
              border: selectedId === 'new' ? 'none' : `1px dashed rgba(27,54,93,0.2)`,
              opacity: hoveredId === 'new' && selectedId !== 'new' ? 0.7 : 1,
            }}
            aria-label={t.sites.addProject}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t.sites.addProject}
          </button>

          {/* Project layers */}
          {sortedProjects.length === 0 ? (
            <div style={noProjectsStyle}>
              {t.sites.noProjects}
            </div>
          ) : (
            <div style={layerContainerStyle}>
              {sortedProjects.map((project) => {
                const isHovered = hoveredId === project.id;
                const isSelected = selectedId === project.id;
                const isConfirmingDelete = confirmDeleteId === project.id;
                const isDragging = draggedId === project.id;
                const isDragOver = dragOverId === project.id;
                const projectTitle = locale === 'zh' ? project.titleZh : project.titleEn;

                return (
                  <div
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    draggable={!isConfirmingDelete}
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, project.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onClick={() => !isConfirmingDelete && onSelect(project.id)}
                    onKeyDown={(e) => !isConfirmingDelete && handleKeyDown(e, project.id)}
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => {
                      setHoveredId(null);
                      if (confirmDeleteId === project.id) setConfirmDeleteId(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.625rem',
                      backgroundColor: isDragOver ? 'rgba(200,146,42,0.15)' : isSelected ? GOLD : CARD,
                      color: isSelected ? '#fff' : NAVY,
                      borderRadius: '6px',
                      cursor: isDragging ? 'grabbing' : 'grab',
                      transition: 'all 0.15s ease',
                      transform: isHovered && !isSelected && !isDragging ? 'translateX(4px)' : 'none',
                      boxShadow: isSelected ? '0 2px 8px rgba(200,146,42,0.25)' : 'none',
                      opacity: isDragging ? 0.5 : 1,
                      borderTop: isDragOver ? `2px solid ${GOLD}` : '2px solid transparent',
                    }}
                    aria-label={`${projectTitle}. ${t.sites.clickToEdit}`}
                  >
                    {/* Drag handle */}
                    <div style={{ marginRight: '0.5rem' }}>
                      <DragHandle active={isHovered || isDragging} color={isSelected ? '#fff' : NAVY} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {projectTitle}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: isSelected ? 'rgba(255,255,255,0.75)' : TEXT_MID,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '1px',
                        }}
                      >
                        {project.serviceType ? slugToLabel(project.serviceType) : '—'}
                        {!project.isPublished && (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              color: isSelected ? 'rgba(255,255,255,0.6)' : ERROR,
                            }}
                          >
                            · {t.common.draft}
                          </span>
                        )}
                      </div>
                    </div>

                    {isHovered && onDeleteProject && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.375rem' }}>
                        {isConfirmingDelete ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleConfirmDelete(e, project.id)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.625rem',
                                backgroundColor: ERROR,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                            >
                              {t.common.yes}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.625rem',
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : TEXT_MID,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                            >
                              {t.common.no}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, project.id)}
                            aria-label={t.sites.deleteProject}
                            style={{
                              width: '18px',
                              height: '18px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              color: isSelected ? 'rgba(255,255,255,0.6)' : TEXT_MID,
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = isSelected ? '#fff' : ERROR;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isSelected ? 'rgba(255,255,255,0.6)' : TEXT_MID;
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Project count with aria-live for screen readers */}
      <div style={projectCountStyle} aria-live="polite" aria-atomic="true">
        {projectCountText}
      </div>
    </div>
  );
}

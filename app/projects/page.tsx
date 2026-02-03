'use client';

import { useState, useMemo } from 'react';
import { Award, Shield, Users, MapPin, SlidersHorizontal } from 'lucide-react';
import { getLocalizedProjects } from '@/lib/projectsData';
import { getLocalizedData } from '@/lib/data';
import { useLanguage } from '@/i18n/LanguageContext';
import ProjectModal from '@/components/ProjectModal';
import SelectDropdown from '@/components/SelectDropdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  NAVY, NAVY_MID, GOLD, GOLD_PALE, SURFACE,
  CARD, SH_DARK, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

const CATEGORY_IMAGES: Record<string, string> = {
  'Kitchen': 'https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg',
  'Bathroom': 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
  'Whole House': 'https://reno-stars.com/wp-content/uploads/2025/04/brightened-whole-house-renovation-living-room.jpg',
  'Commercial': 'https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg',
};

const ZH_TO_EN: Record<string, string> = { '全部': 'All', '厨房': 'Kitchen', '卫浴': 'Bathroom', '全屋': 'Whole House', '商业': 'Commercial' };

export default function ProjectsPage() {
  const { lang, t } = useLanguage();
  const { categories, projects } = getLocalizedProjects(lang);
  const { company } = getLocalizedData(lang);
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [spaceTypeFilter, setSpaceTypeFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const allLabel = categories[0];
  const categoryCards = categories.slice(1);

  const locations = useMemo(() => [...new Set(projects.map(p => p.location))].sort(), [projects]);
  const spaceTypes = useMemo(() => [...new Set(projects.map(p => p.spaceType))].sort(), [projects]);
  const budgets = useMemo(() => [...new Set(projects.map(p => p.budget))], [projects]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (activeCategory !== 'All' && activeCategory !== allLabel && p.category !== activeCategory) return false;
      if (locationFilter && p.location !== locationFilter) return false;
      if (spaceTypeFilter && p.spaceType !== spaceTypeFilter) return false;
      if (budgetFilter && p.budget !== budgetFilter) return false;
      return true;
    });
  }, [projects, activeCategory, allLabel, locationFilter, spaceTypeFilter, budgetFilter]);

  const hasActiveFilters = (activeCategory !== 'All' && activeCategory !== allLabel) || locationFilter || spaceTypeFilter || budgetFilter;

  const clearAllFilters = () => {
    setActiveCategory('All');
    setLocationFilter('');
    setSpaceTypeFilter('');
    setBudgetFilter('');
  };

  const getEnCategory = (cat: string) => ZH_TO_EN[cat] || cat;

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <Navbar variant="projects" />

      {/* TITLE */}
      <section className="pt-10 pb-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: TEXT }}>{t('section.ourProjects')}</h1>
          <p className="text-sm" style={{ color: TEXT_MID }}>{t('projects.subtitle')}</p>
        </div>
      </section>

      {/* CATEGORY IMAGE CARDS */}
      <section className="pb-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold mb-5" style={{ color: TEXT }}>{t('filter.browseByCategory')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryCards.map((cat) => {
              const enCat = getEnCategory(cat);
              const img = CATEGORY_IMAGES[enCat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(isActive ? 'All' : cat);
                    setLocationFilter('');
                    setSpaceTypeFilter('');
                    setBudgetFilter('');
                  }}
                  className="relative overflow-hidden rounded-xl cursor-pointer group aspect-[4/5] transition-all duration-300"
                  style={{
                    boxShadow: isActive ? `0 0 0 3px ${GOLD}, ${neu(5)}` : neu(5),
                  }}
                >
                  <img src={img} alt={`${cat} renovation projects`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: isActive
                        ? `linear-gradient(to top, ${NAVY}cc 0%, ${NAVY}40 50%, transparent 100%)`
                        : 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xl md:text-2xl font-bold tracking-wide drop-shadow-lg">{cat}</span>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: GOLD }}>
                      {t('filter.allCategories')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ADVANCED FILTERS */}
      <section className="pb-2 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-1">
              <SlidersHorizontal className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MID }}>
                {t('filter.location')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-0">
              <SelectDropdown
                value={locationFilter}
                onChange={setLocationFilter}
                options={[
                  { value: '', label: t('filter.allLocations') },
                  ...locations.map(l => ({ value: l, label: l })),
                ]}
              />
              <SelectDropdown
                value={spaceTypeFilter}
                onChange={setSpaceTypeFilter}
                options={[
                  { value: '', label: t('filter.allSpaceTypes') },
                  ...spaceTypes.map(s => ({ value: s, label: s })),
                ]}
              />
              <SelectDropdown
                value={budgetFilter}
                onChange={setBudgetFilter}
                options={[
                  { value: '', label: t('filter.allBudgets') },
                  ...budgets.map(b => ({ value: b, label: b })),
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 mb-2">
            <p className="text-xs font-medium" style={{ color: TEXT_MID }}>
              {t('filter.showing')} <span className="font-bold" style={{ color: GOLD }}>{filtered.length}</span> {t('filter.projects')}
            </p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs font-semibold cursor-pointer transition-colors duration-200 hover:underline" style={{ color: GOLD }}>
                {t('filter.clearAll')}
              </button>
            )}
          </div>
          <div className="h-px" style={{ backgroundColor: SH_DARK }} />
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project, i) => (
              <div key={i}
                onClick={() => setSelectedProject(project)}
                className="rounded-xl overflow-hidden cursor-pointer group transition-all duration-200"
                style={{ boxShadow: neu(5), backgroundColor: CARD }}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={project.image}
                    alt={`${project.title} - ${project.category} renovation in ${project.location}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {project.badge === 'New' && (
                    <div className="absolute top-3 right-3 text-white px-3 py-1 text-xs font-bold uppercase rounded-md"
                      style={{ backgroundColor: GOLD, boxShadow: `0 2px 8px ${GOLD}66` }}
                    >
                      {t('label.new2')}
                    </div>
                  )}
                </div>
                <div className="h-0.5" style={{ backgroundColor: GOLD }} />
                <div className="p-5">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase rounded mb-2.5"
                    style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                  >
                    {project.category}
                  </span>
                  <h3 className="text-base font-bold mb-1.5 group-hover:text-[#C8922A] transition-colors" style={{ color: TEXT }}>
                    {project.title}
                  </h3>
                  <p className="text-xs flex items-center gap-1.5 font-medium mb-2" style={{ color: TEXT_MUTED }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: GOLD }} /> {project.location}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{project.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: TEXT_MUTED }}>{t('filter.noProjectsMatch')}</p>
              <button onClick={clearAllFilters} className="mt-3 text-sm font-semibold cursor-pointer" style={{ color: GOLD }}>
                {t('filter.clearAll')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_MID} 100%)` }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('projects.readyToStart2')}</h2>
          <p className="text-sm mb-6 text-white/55 leading-relaxed">
            {t('projects.ctaSubtitle6').replace('{years}', company.yearsExperience)}
          </p>
          <a href={company.quoteUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block px-10 py-3 text-white text-sm font-semibold uppercase cursor-pointer rounded-lg transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}55` }}
          >
            {t('cta.getYourFreeQuote')}
          </a>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-white/35">
            {[
              { icon: Shield, txt: `${company.warranty} ${t('stats.warranty')}` },
              { icon: Award, txt: t('footer.licensedInsured') },
              { icon: Users, txt: t('stats.expertTeam') },
            ].map((x, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <x.icon className="w-3.5 h-3.5" style={{ color: GOLD }} /> {x.txt}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        theme={{
          overlay: 'bg-black/50 backdrop-blur-sm',
          modal: 'bg-[#EDE8E1]',
          text: 'text-[#1B365D]',
          textSecondary: 'text-[#1B365D]/70',
          accent: 'bg-[#C8922A] text-white',
          border: 'border-[#c4bbb0]',
          sidebarBg: 'bg-[#E8E2DA]',
          closeBtn: 'bg-[#DED6CC] hover:bg-[#c4bbb0] text-[#1B365D]',
          thumbActive: 'ring-2 ring-[#C8922A]',
          thumbInactive: 'ring-1 ring-[#c4bbb0] opacity-70 hover:opacity-100',
        }}
      />
    </div>
  );
}

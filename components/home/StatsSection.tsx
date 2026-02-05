'use client';

import { NAVY, GOLD } from '@/lib/theme';

interface StatsSectionProps {
  stats: { value: string; label: string }[];
  srTitle: string;
}

export default function StatsSection({ stats, srTitle }: StatsSectionProps) {
  return (
    <section id="stats" aria-labelledby="stats-title" className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
      <h2 id="stats-title" className="sr-only">{srTitle}</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center py-2">
            <div className="text-2xl md:text-3xl font-bold" style={{ color: GOLD }}>{s.value}</div>
            <div className="text-sm font-medium text-white/70 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

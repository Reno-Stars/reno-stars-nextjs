'use client';

import { useMemo } from 'react';
import { CARD, GOLD, NAVY, NAVY_PALE, SURFACE_ALT, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

interface MinimalProject {
  locationCity: string | null;
  budgetRange: string | null;
}

interface CostByCityTableProps {
  projects: MinimalProject[];
  /** Section heading, e.g. "Kitchen Cost by Metro Vancouver Neighbourhood" */
  title: string;
  subtitle: string;
  headerCity: string;
  headerProjects: string;
  headerAvg: string;
  headerRange: string;
  footnote: string;
}

function parseBudget(range: string | null): [number, number] | null {
  if (!range) return null;
  const nums = range.match(/[\d,]+/g);
  if (!nums || nums.length < 2) return null;
  const lo = parseInt(nums[0].replace(/,/g, ''), 10);
  const hi = parseInt(nums[nums.length - 1].replace(/,/g, ''), 10);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
  return [lo, hi];
}

function formatCurrency(n: number): string {
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
  return '$' + n.toLocaleString('en-CA');
}

/**
 * Per-city cost table — the "we have real data, HomeStars doesn't" SEO moat.
 *
 * Aggregates a service's project budgets by locationCity, drops cities with
 * fewer than 2 projects (low-confidence), and renders min/avg/max per city.
 * Sorts by project count descending — highest-confidence rows first.
 *
 * Reno Stars' SERP differentiator on cost queries: directories like HomeStars
 * and Houzz can only quote industry averages. We can quote portfolio averages
 * by neighbourhood. That's a moat they cannot replicate.
 */
export default function CostByCityTable({
  projects,
  title,
  subtitle,
  headerCity,
  headerProjects,
  headerAvg,
  headerRange,
  footnote,
}: CostByCityTableProps) {
  const rows = useMemo(() => {
    const byCity = new Map<string, number[][]>();
    for (const p of projects) {
      const city = p.locationCity?.trim();
      if (!city) continue;
      const range = parseBudget(p.budgetRange);
      if (!range) continue;
      if (!byCity.has(city)) byCity.set(city, []);
      byCity.get(city)!.push(range);
    }
    return Array.from(byCity.entries())
      .map(([city, ranges]) => {
        const lows = ranges.map((r) => r[0]);
        const highs = ranges.map((r) => r[1]);
        const mids = ranges.map((r) => (r[0] + r[1]) / 2);
        const avg = mids.reduce((s, v) => s + v, 0) / mids.length;
        return {
          city,
          count: ranges.length,
          min: Math.min(...lows),
          max: Math.max(...highs),
          avg: Math.round(avg),
        };
      })
      .filter((r) => r.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  if (rows.length < 3) return null; // need at least 3 cities to be meaningful

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{title}</h2>
        <p className="text-center mb-8" style={{ color: TEXT_MID }}>{subtitle}</p>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD, boxShadow: neu() }}>
          <div className="grid grid-cols-4 gap-2 p-4 font-bold text-xs sm:text-sm" style={{ backgroundColor: NAVY_PALE, color: NAVY }}>
            <span>{headerCity}</span>
            <span className="text-center">{headerProjects}</span>
            <span className="text-center">{headerAvg}</span>
            <span className="text-right">{headerRange}</span>
          </div>
          {rows.map((r) => (
            <div key={r.city} className="grid grid-cols-4 gap-2 p-4 text-xs sm:text-sm border-t" style={{ borderColor: SURFACE_ALT, color: TEXT_MID }}>
              <span className="font-semibold" style={{ color: TEXT }}>{r.city}</span>
              <span className="text-center">{r.count}</span>
              <span className="text-center font-semibold" style={{ color: GOLD }}>{formatCurrency(r.avg)}</span>
              <span className="text-right">{formatCurrency(r.min)} – {formatCurrency(r.max)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-center mt-4" style={{ color: TEXT_MUTED }}>{footnote}</p>
      </div>
    </section>
  );
}

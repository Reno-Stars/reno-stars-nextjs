'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Link2, Printer, RotateCcw } from 'lucide-react';
import { GOLD, TEXT, TEXT_MID, CARD, SURFACE_ALT } from '@/lib/theme';
import type { SectionSelection, SiteVisitCatalog } from '@/lib/site-visit/types';
import { resolveScope } from '@/lib/site-visit/resolve';
import { decodeSelections, encodeSelections } from '@/lib/site-visit/url';
import ScopePicker from './ScopePicker';
import CheckRow, { type Severity } from './CheckRow';
import { useChecklistState } from './useChecklistState';
import { buildSummary, type SummaryGroup } from './summary';

interface AuthoredItem {
  id: string;
  label: string;
  hint?: string;
  severity?: Severity;
}

interface AuthoredStep {
  label: string;
  checks: string[];
}

export default function SiteVisitChecklist({ catalog }: { catalog: SiteVisitCatalog }) {
  const t = useTranslations('siteVisit');
  const { checks, notes, toggle, setNote, reset, hydrated } = useChecklistState();
  const [selections, setSelections] = useState<SectionSelection[]>([]);
  const [copied, setCopied] = useState<'summary' | 'link' | null>(null);

  // Read the incoming link once on mount. The page is statically rendered for
  // every locale, so the query string can only be read client-side.
  const [urlRead, setUrlRead] = useState(false);
  useEffect(() => {
    const fromUrl = decodeSelections(catalog, new URLSearchParams(window.location.search));
    if (fromUrl.length > 0) setSelections(fromUrl);
    setUrlRead(true);
  }, [catalog]);

  // Keep the URL in step with the picks so the address bar is always shareable.
  // replaceState, not push — the back button should leave the page, not walk
  // back through every add-on the visitor ticked.
  //
  // Gated on urlRead: both effects run in the same commit, so without the gate
  // this one fires first with the still-empty initial state and blanks the
  // incoming query string before the decode above has been applied.
  useEffect(() => {
    if (!urlRead) return;
    const qs = encodeSelections(selections);
    window.history.replaceState(null, '', `${window.location.pathname}${qs}`);
  }, [selections, urlRead]);

  const nameOf = useCallback((id: string) => t(`names.${id}`), [t]);
  const sectionLabel = useCallback((id: string) => t(`sectionNames.${id}`), [t]);

  const toggleSection = (sectionId: string) =>
    setSelections((s) =>
      s.some((x) => x.sectionId === sectionId)
        ? s.filter((x) => x.sectionId !== sectionId)
        : [...s, { sectionId, modelId: '', addonIds: [] }],
    );

  const setModel = (sectionId: string, modelId: string) =>
    setSelections((s) =>
      s.map((x) => (x.sectionId === sectionId ? { ...x, modelId, addonIds: [] } : x)),
    );

  const toggleAddon = (sectionId: string, addonId: string) =>
    setSelections((s) =>
      s.map((x) =>
        x.sectionId === sectionId
          ? {
              ...x,
              addonIds: x.addonIds.includes(addonId)
                ? x.addonIds.filter((a) => a !== addonId)
                : [...x.addonIds, addonId],
            }
          : x,
      ),
    );

  const scope = useMemo(() => resolveScope(catalog, selections), [catalog, selections]);
  const hasScope = scope.steps.length > 0;

  const always = t.raw('always.items') as AuthoredItem[];
  const conditions = t.raw('conditions.items') as AuthoredItem[];
  const authoredSteps = t.raw('steps') as Record<string, AuthoredStep>;
  const captureLabels = t.raw('captureLabels') as Record<string, string>;

  // Every tickable id on the page right now, in reading order — drives both
  // the progress count and the exported summary.
  const groups: SummaryGroup[] = useMemo(() => {
    const g: SummaryGroup[] = [
      { title: t('always.title'), items: always.map((i) => ({ id: `always:${i.id}`, label: i.label })) },
      { title: t('conditions.title'), items: conditions.map((i) => ({ id: `cond:${i.id}`, label: i.label })) },
    ];
    for (const section of catalog.sections) {
      const steps = scope.steps.filter((s) => s.sectionId === section.id);
      if (steps.length === 0) continue;
      g.push({
        title: `${t('scope.title')} — ${sectionLabel(section.id)}`,
        items: steps.flatMap((step) =>
          (authoredSteps[step.key]?.checks ?? []).map((label, i) => ({
            id: `step:${section.id}:${step.key}:${i}`,
            label: `${authoredSteps[step.key]?.label ?? step.key} — ${label}`,
          })),
        ),
      });
    }
    // Client-supplies is a real set of confirmations, so it belongs in the
    // progress count and needs its ticked state in the export — not just a
    // flat list of nouns the estimator can't tell were confirmed.
    if (scope.clientProvides.length > 0) {
      g.push({
        title: t('provides.title'),
        items: scope.clientProvides.map((item) => ({ id: `provides:${item}`, label: item })),
      });
    }
    return g;
  }, [always, conditions, authoredSteps, catalog.sections, scope.steps, scope.clientProvides, t, sectionLabel]);

  const allIds = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups]);
  const doneCount = allIds.filter((id) => checks[id]).length;

  const scopeLine = selections
    .filter((s) => s.modelId)
    .map((s) => {
      const addons = s.addonIds.map(nameOf).join(', ');
      return `${sectionLabel(s.sectionId)}: ${nameOf(s.modelId)}${addons ? ` (+ ${addons})` : ''}`;
    })
    .join(' | ');

  const copy = async (kind: 'summary' | 'link') => {
    const text =
      kind === 'link'
        ? `${window.location.origin}${window.location.pathname}${encodeSelections(selections)}`
        : buildSummary({
            heading: `RENO STARS — ${t('hero.title').toUpperCase()}`,
            scopeLine,
            groups,
            checks,
            notes,
            outstandingLabel: t('summary.unchecked'),
          });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked (insecure origin, or permission denied). Better to
      // do nothing visible than to throw — the print button still works.
    }
  };

  const rowProps = {
    noteLabel: t('summary.notesLabel'),
    notePlaceholder: t('summary.notesPlaceholder'),
    onToggle: toggle,
    onNote: setNote,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl p-4 sm:p-6 print:hidden" style={{ background: CARD }}>
        <ScopePicker
          sections={catalog.sections}
          selections={selections}
          sectionLabel={sectionLabel}
          name={nameOf}
          t={t}
          onToggleSection={toggleSection}
          onModel={setModel}
          onToggleAddon={toggleAddon}
        />
      </section>

      {/* The picker is print:hidden, so a printed sheet would otherwise not
          say which job it belongs to. */}
      {scopeLine && (
        <p className="hidden text-sm font-semibold print:block" style={{ color: TEXT }}>
          {scopeLine}
        </p>
      )}

      {hydrated && allIds.length > 0 && (
        <div
          className="sticky top-16 z-10 rounded-full px-4 py-2 text-sm font-semibold shadow-sm print:hidden"
          style={{ background: SURFACE_ALT, color: TEXT }}
        >
          {/* One placeholder, not two. Machine translation reorders "{done} of
              {total}" — zh came back as "{total} 的 {done}", i.e. backwards.
              A single pre-formatted count can't be swapped. */}
          {t('summary.progress', { count: `${doneCount} / ${allIds.length}` })}
        </div>
      )}

      <ChecklistBlock title={t('always.title')} subtitle={t('always.subtitle')}>
        {always.map((item) => (
          <CheckRow
            key={item.id}
            id={`always:${item.id}`}
            label={item.label}
            hint={item.hint}
            checked={Boolean(checks[`always:${item.id}`])}
            note={notes[`always:${item.id}`] ?? ''}
            {...rowProps}
          />
        ))}
      </ChecklistBlock>

      <ChecklistBlock title={t('conditions.title')} subtitle={t('conditions.subtitle')}>
        {conditions.map((item) => (
          <CheckRow
            key={item.id}
            id={`cond:${item.id}`}
            label={item.label}
            hint={item.hint}
            severity={item.severity}
            severityLabel={item.severity ? t(`ui.${item.severity}`) : undefined}
            checked={Boolean(checks[`cond:${item.id}`])}
            note={notes[`cond:${item.id}`] ?? ''}
            {...rowProps}
          />
        ))}
      </ChecklistBlock>

      <section>
        <h2 className="text-xl font-bold sm:text-2xl" style={{ color: TEXT }}>
          {t('scope.title')}
        </h2>
        <p className="mt-1 text-sm" style={{ color: TEXT_MID, opacity: 0.8 }}>
          {t('scope.subtitle')}
        </p>

        {!hasScope ? (
          <p className="mt-4 rounded-xl p-4 text-sm" style={{ background: SURFACE_ALT, color: TEXT_MID }}>
            {t('picker.empty')}
          </p>
        ) : (
          catalog.sections.map((section) => {
            const steps = scope.steps.filter((s) => s.sectionId === section.id);
            if (steps.length === 0) return null;
            return (
              <div key={section.id} className="mt-5">
                <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                  {sectionLabel(section.id)}
                </h3>
                <div className="mt-3 space-y-4">
                  {steps.map((step) => {
                    const authored = authoredSteps[step.key];
                    if (!authored) return null;
                    return (
                      // SURFACE_ALT behind CARD rows so each check reads as a
                      // distinct line rather than one flat block of beige.
                      <article key={`${section.id}:${step.key}`} className="rounded-2xl p-4" style={{ background: SURFACE_ALT }}>
                        <h4 className="text-base font-bold" style={{ color: TEXT }}>{authored.label}</h4>
                        {step.text && (
                          <p className="mt-1 text-xs" style={{ color: TEXT_MID, opacity: 0.65 }}>
                            <span className="font-semibold">{t('scope.quoteLineLabel')}:</span> {step.text}
                          </p>
                        )}
                        {step.captureFields.length > 0 && (
                          <p className="mt-2 flex flex-wrap gap-1.5">
                            {step.captureFields.map((f) => (
                              <span
                                key={f}
                                className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                                style={{ background: 'rgba(200,146,42,0.15)', color: '#6b4c0e' }}
                              >
                                {captureLabels[f] ?? f}
                              </span>
                            ))}
                          </p>
                        )}
                        <ul className="mt-3 space-y-1.5">
                          {authored.checks.map((label, i) => {
                            const id = `step:${section.id}:${step.key}:${i}`;
                            return (
                              <CheckRow
                                key={id}
                                id={id}
                                label={label}
                                checked={Boolean(checks[id])}
                                note={notes[id] ?? ''}
                                {...rowProps}
                              />
                            );
                          })}
                        </ul>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>

      {scope.clientProvides.length > 0 && (
        <section>
          <h2 className="text-xl font-bold sm:text-2xl" style={{ color: TEXT }}>{t('provides.title')}</h2>
          <p className="mt-1 text-sm" style={{ color: TEXT_MID, opacity: 0.8 }}>{t('provides.subtitle')}</p>
          <ul className="mt-3 space-y-1.5">
            {scope.clientProvides.map((item) => (
              <CheckRow
                key={item}
                id={`provides:${item}`}
                label={item}
                checked={Boolean(checks[`provides:${item}`])}
                note={notes[`provides:${item}`] ?? ''}
                {...rowProps}
              />
            ))}
          </ul>
          <p className="mt-2 text-sm" style={{ color: TEXT_MID, opacity: 0.75 }}>{t('provides.note')}</p>
        </section>
      )}

      <section className="rounded-2xl p-4 sm:p-6 print:hidden" style={{ background: SURFACE_ALT }}>
        <h2 className="text-lg font-bold" style={{ color: TEXT }}>{t('summary.title')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton onClick={() => copy('summary')} primary>
            <Copy size={16} aria-hidden="true" />
            {copied === 'summary' ? t('summary.copied') : t('summary.copy')}
          </ActionButton>
          <ActionButton onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" />
            {t('summary.print')}
          </ActionButton>
          <ActionButton onClick={() => copy('link')}>
            <Link2 size={16} aria-hidden="true" />
            {copied === 'link' ? t('summary.copied') : t('summary.shareCopy')}
          </ActionButton>
          <ActionButton
            onClick={() => {
              if (window.confirm(t('summary.resetConfirm'))) reset();
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {t('summary.reset')}
          </ActionButton>
        </div>
        <p className="mt-3 text-sm" style={{ color: TEXT_MID, opacity: 0.75 }}>{t('summary.shareHint')}</p>
      </section>
    </div>
  );
}

function ChecklistBlock({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold sm:text-2xl" style={{ color: TEXT }}>{title}</h2>
      <p className="mt-1 text-sm" style={{ color: TEXT_MID, opacity: 0.8 }}>{subtitle}</p>
      <ul className="mt-3 space-y-1.5">{children}</ul>
    </section>
  );
}

function ActionButton({
  onClick, primary, children,
}: { onClick: () => void; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
      style={{
        background: primary ? GOLD : CARD,
        color: primary ? '#fff' : TEXT,
        border: `1px solid ${primary ? GOLD : 'rgba(27,54,93,0.18)'}`,
      }}
    >
      {children}
    </button>
  );
}

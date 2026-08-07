'use client';

import { GOLD, TEXT, TEXT_MID, CARD, SURFACE_ALT } from '@/lib/theme';
import type { CatalogSection, SectionSelection } from '@/lib/site-visit/types';

interface ScopePickerProps {
  sections: CatalogSection[];
  selections: SectionSelection[];
  sectionLabel: (id: string) => string;
  name: (id: string) => string;
  t: (key: string) => string;
  onToggleSection: (sectionId: string) => void;
  onModel: (sectionId: string, modelId: string) => void;
  onToggleAddon: (sectionId: string, addonId: string) => void;
}

/**
 * Scope → job type → add-ons, in that order.
 *
 * Add-ons only appear once a model is chosen: several of them are
 * replacements that only make sense against a base job, and showing 30
 * checkboxes before the visitor has said "bathroom" is noise.
 */
export default function ScopePicker({
  sections, selections, sectionLabel, name, t,
  onToggleSection, onModel, onToggleAddon,
}: ScopePickerProps) {
  const selectionFor = (id: string) => selections.find((s) => s.sectionId === id);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-base font-semibold" style={{ color: TEXT }}>
          {t('picker.scopeTitle')}
        </legend>
        <p className="mt-1 text-sm" style={{ color: TEXT_MID, opacity: 0.8 }}>
          {t('picker.scopeHint')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sections.map((section) => {
            const on = Boolean(selectionFor(section.id));
            return (
              <button
                key={section.id}
                type="button"
                aria-pressed={on}
                onClick={() => onToggleSection(section.id)}
                className="rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: on ? GOLD : CARD,
                  color: on ? '#fff' : TEXT,
                  border: `1px solid ${on ? GOLD : 'rgba(27,54,93,0.18)'}`,
                }}
              >
                {sectionLabel(section.id)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {sections.map((section) => {
        const selection = selectionFor(section.id);
        if (!selection) return null;
        const addons = section.modifiers.filter((m) => m.kind === 'addon');
        const replacements = section.modifiers.filter((m) => m.kind === 'replacement');

        return (
          <div
            key={section.id}
            className="rounded-xl p-4"
            style={{ background: SURFACE_ALT }}
          >
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: GOLD }}>
              {sectionLabel(section.id)}
            </p>

            <label className="mt-3 block">
              <span className="text-base font-semibold" style={{ color: TEXT }}>
                {t('picker.modelTitle')}
              </span>
              <span className="mt-1 block text-sm" style={{ color: TEXT_MID, opacity: 0.8 }}>
                {t('picker.modelHint')}
              </span>
              <select
                value={selection.modelId}
                onChange={(e) => onModel(section.id, e.target.value)}
                className="mt-2 w-full rounded-lg border p-3 text-base"
                style={{ borderColor: 'rgba(27,54,93,0.2)', background: '#fff', color: TEXT }}
              >
                <option value="">{t('picker.modelPlaceholder')}</option>
                {section.models.map((m) => (
                  <option key={m.id} value={m.id}>{name(m.id)}</option>
                ))}
              </select>
            </label>

            {selection.modelId && (
              <fieldset className="mt-4">
                <legend className="text-base font-semibold" style={{ color: TEXT }}>
                  {t('picker.addonsTitle')}
                </legend>
                <p className="mt-1 text-sm" style={{ color: TEXT_MID, opacity: 0.8 }}>
                  {t('picker.addonsHint')}
                </p>
                {[
                  { key: 'addon', label: t('picker.addonsGroupAddon'), list: addons },
                  { key: 'replacement', label: t('picker.addonsGroupReplacement'), list: replacements },
                ].map(({ key, label, list }) =>
                  list.length === 0 ? null : (
                    <div key={key} className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: TEXT_MID, opacity: 0.7 }}>
                        {label}
                      </p>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {list.map((mod) => {
                          const on = selection.addonIds.includes(mod.id);
                          return (
                            <label
                              key={mod.id}
                              className="flex cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2 text-sm"
                              style={{ background: on ? CARD : 'transparent', color: TEXT }}
                            >
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => onToggleAddon(section.id, mod.id)}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-[#7A5810]"
                              />
                              <span className="leading-snug">{name(mod.id)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </fieldset>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { describe, it, expect } from 'vitest';
import catalogJson from '@/data/site-visit/catalog.json';
import enMessages from '@/messages/en/siteVisit.json';
import type { SiteVisitCatalog } from '@/lib/site-visit/types';
import { SCHEMA_VERSION } from '@/lib/site-visit/types';
import { resolveScope, sanitizeSelection } from '@/lib/site-visit/resolve';
import { decodeSelections, encodeSelections } from '@/lib/site-visit/url';

const catalog = catalogJson as unknown as SiteVisitCatalog;
const copy = enMessages.siteVisit as unknown as {
  steps: Record<string, { label: string; checks: string[] }>;
  names: Record<string, string>;
};

const bathroom = catalog.sections.find((s) => s.id === 'bathrooms')!;
const kitchen = catalog.sections.find((s) => s.id === 'kitchen')!;

describe('site-visit catalog artifact', () => {
  it('matches the schema version this code expects', () => {
    expect(catalog.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('every catalog step has authored checks', () => {
    const missing = catalog.steps.filter((s) => !copy.steps[s.key]);
    expect(missing.map((s) => s.key)).toEqual([]);
  });

  it('every step has at least one check and a label', () => {
    for (const step of catalog.steps) {
      const authored = copy.steps[step.key];
      expect(authored.label, step.key).toBeTruthy();
      expect(authored.checks.length, step.key).toBeGreaterThan(0);
    }
  });

  it('every model and modifier has a display name', () => {
    const ids = catalog.sections.flatMap((s) => [
      ...s.models.map((m) => m.id),
      ...s.modifiers.map((m) => m.id),
    ]);
    expect(ids.filter((id) => !copy.names[id])).toEqual([]);
  });

  it('no modifier failed to apply during export', () => {
    const errored = catalog.sections.flatMap((s) =>
      s.modifiers.filter((m) => m.error).map((m) => `${s.id}/${m.id}: ${m.error}`),
    );
    expect(errored).toEqual([]);
  });
});

describe('resolveScope', () => {
  it('returns nothing when no model is chosen', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: '', addonIds: [] },
    ]);
    expect(scope.steps).toEqual([]);
    expect(scope.clientProvides).toEqual([]);
  });

  it('returns the base model steps with no add-ons', () => {
    const model = bathroom.models.find((m) => m.id === 'bathroom-4piece')!;
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: [] },
    ]);
    expect(scope.steps.map((s) => s.key).sort()).toEqual([...model.steps].sort());
  });

  it('orders steps by the catalog order, not selection order', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: ['bathroom-potlights'] },
    ]);
    const orders = scope.steps.map((s) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('an addon pulls its step into scope', () => {
    const base = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: [] },
    ]);
    const withPotlights = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: ['bathroom-potlights'] },
    ]);
    expect(base.steps.some((s) => s.key === 'potlights')).toBe(false);
    expect(withPotlights.steps.some((s) => s.key === 'potlights')).toBe(true);
    const potlights = withPotlights.steps.find((s) => s.key === 'potlights')!;
    expect(potlights.addedBy).toContain('bathroom-potlights');
  });

  it('a keep-* replacement removes its step from scope', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: ['bathroom-keep-toilet'] },
    ]);
    expect(scope.steps.some((s) => s.key === 'toilet')).toBe(false);
  });

  it('derives client-provided items from the active steps', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: [] },
    ]);
    expect(scope.clientProvides).toContain('toilet');
    expect(scope.clientProvides).toContain('vanity sink');
  });

  it('drops a client-provided item when its step leaves scope', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: ['bathroom-keep-toilet'] },
    ]);
    expect(scope.clientProvides).not.toContain('toilet');
  });

  it('combines two sections into one ordered checklist', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: [] },
      { sectionId: 'kitchen', modelId: 'kitchen-prefab-cabinet', addonIds: [] },
    ]);
    expect(scope.steps.some((s) => s.sectionId === 'bathrooms')).toBe(true);
    expect(scope.steps.some((s) => s.sectionId === 'kitchen')).toBe(true);
    expect(scope.steps.some((s) => s.key === 'cabinets')).toBe(true);
  });

  it('every model in the catalog resolves to at least one step', () => {
    for (const section of catalog.sections) {
      for (const model of section.models) {
        const scope = resolveScope(catalog, [
          { sectionId: section.id, modelId: model.id, addonIds: [] },
        ]);
        expect(scope.steps.length, `${section.id}/${model.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('every addon resolves against every model without dropping the model', () => {
    for (const section of catalog.sections) {
      for (const mod of section.modifiers) {
        const scope = resolveScope(catalog, [
          { sectionId: section.id, modelId: section.baselineModel, addonIds: [mod.id] },
        ]);
        expect(scope.steps.length, `${section.id}/${mod.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('ignores a section selection that names an unknown model', () => {
    const scope = resolveScope(catalog, [
      { sectionId: 'kitchen', modelId: 'kitchen-does-not-exist', addonIds: [] },
    ]);
    expect(scope.steps).toEqual([]);
  });
});

describe('sanitizeSelection', () => {
  it('rejects an unknown model', () => {
    expect(sanitizeSelection(kitchen, 'nope', [])).toBeNull();
  });

  it('strips addons that belong to another section', () => {
    const sel = sanitizeSelection(kitchen, 'kitchen-prefab-cabinet', [
      'kitchen-potlights',
      'bathroom-potlights',
    ]);
    expect(sel?.addonIds).toEqual(['kitchen-potlights']);
  });
});

describe('url round-trip', () => {
  it('encodes and decodes a two-section selection', () => {
    const selections = [
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: ['bathroom-potlights', 'bathroom-niche'] },
      { sectionId: 'kitchen', modelId: 'kitchen-prefab-cabinet', addonIds: [] },
    ];
    const qs = encodeSelections(selections);
    const decoded = decodeSelections(catalog, new URLSearchParams(qs));
    expect(decoded).toEqual(selections);
  });

  it('skips a section with no model chosen', () => {
    const qs = encodeSelections([{ sectionId: 'kitchen', modelId: '', addonIds: [] }]);
    expect(qs).toBe('');
  });

  it('degrades a hand-edited link to its valid subset', () => {
    const decoded = decodeSelections(
      catalog,
      new URLSearchParams('bathrooms=bathroom-4piece,made-up-addon&kitchen=made-up-model'),
    );
    expect(decoded).toEqual([
      { sectionId: 'bathrooms', modelId: 'bathroom-4piece', addonIds: [] },
    ]);
  });

  it('returns nothing for an empty query string', () => {
    expect(decodeSelections(catalog, new URLSearchParams(''))).toEqual([]);
  });
});

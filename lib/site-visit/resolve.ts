/**
 * Turns the visitor's picks into the exact set of checks to show.
 *
 * Mirrors what the quoting system does when it builds a section: start from the
 * model's steps, then let each chosen modifier add or remove steps. The
 * add/remove sets in the catalog were diffed against each section's baseline
 * model, so applying them to a different model is an approximation — a removal
 * whose step isn't present is simply a no-op, and an addition already present
 * collapses into the set. That holds for every modifier in the catalog today.
 */
import type {
  CatalogSection,
  ResolvedScope,
  ResolvedStep,
  SectionSelection,
  SiteVisitCatalog,
} from './types';

/** Resolves one section's picks to an ordered step list. */
function resolveSection(
  section: CatalogSection,
  selection: SectionSelection,
  stepsByKey: Map<string, SiteVisitCatalog['steps'][number]>,
): ResolvedStep[] {
  const model = section.models.find((m) => m.id === selection.modelId);
  if (!model) return [];

  const active = new Set(model.steps);
  // Which modifier put each step in scope. Model-carried steps stay empty.
  const addedBy = new Map<string, string[]>();

  // Apply in catalog order, not click order, so the result is deterministic
  // regardless of the order the visitor ticked the boxes.
  const chosen = section.modifiers.filter((m) => selection.addonIds.includes(m.id));
  for (const mod of chosen) {
    for (const key of mod.removesSteps) {
      active.delete(key);
      addedBy.delete(key);
    }
    for (const key of mod.addsSteps) {
      active.add(key);
      addedBy.set(key, [...(addedBy.get(key) ?? []), mod.id]);
    }
  }

  return [...active]
    .map((key) => {
      const step = stepsByKey.get(key);
      if (!step) return null;
      return { ...step, sectionId: section.id, addedBy: addedBy.get(key) ?? [] };
    })
    .filter((s): s is ResolvedStep => s !== null)
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

/**
 * Resolves every section selection into a single ordered checklist.
 * Steps are grouped by section, in the order the sections appear in the catalog.
 */
export function resolveScope(
  catalog: SiteVisitCatalog,
  selections: SectionSelection[],
): ResolvedScope {
  const stepsByKey = new Map(catalog.steps.map((s) => [s.key, s]));
  const steps: ResolvedStep[] = [];
  const provides = new Set<string>();

  for (const section of catalog.sections) {
    const selection = selections.find((s) => s.sectionId === section.id);
    if (!selection?.modelId) continue;

    const resolved = resolveSection(section, selection, stepsByKey);
    steps.push(...resolved);

    for (const step of resolved) {
      for (const item of section.clientProvides[step.key] ?? []) {
        provides.add(item);
      }
    }
  }

  return { steps, clientProvides: [...provides].sort() };
}

/** Drops addon ids that don't belong to the section — guards URL-supplied input. */
export function sanitizeSelection(
  section: CatalogSection,
  modelId: string,
  addonIds: string[],
): SectionSelection | null {
  if (!section.models.some((m) => m.id === modelId)) return null;
  const valid = new Set(section.modifiers.map((m) => m.id));
  return {
    sectionId: section.id,
    modelId,
    addonIds: addonIds.filter((id) => valid.has(id)),
  };
}

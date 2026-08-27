type Messages = Record<string, unknown>;

/**
 * Deep-pick message paths out of the merged catalog.
 *
 * Paths may be dotted, so a page can take one guide section
 * (`guides.kitchenCost`, 22.7 KB) instead of the whole `guides` namespace
 * (177.6 KB — 57% of the catalog).
 *
 * A path that does not resolve is skipped rather than throwing: a hard error
 * here would take down the page, and `i18n/request.ts` already treats a
 * missing message as non-fatal. Typos are caught at test time instead, by
 * `client-namespace-scope.test.ts`, which asserts every declared path resolves
 * against the EN catalog.
 */
export function pickMessages(
  messages: Messages,
  paths: readonly string[],
): Messages {
  const out: Messages = {};

  for (const path of paths) {
    const parts = path.split('.');

    let value: unknown = messages;
    for (const part of parts) {
      value =
        value && typeof value === 'object'
          ? (value as Messages)[part]
          : undefined;
    }
    if (value === undefined) continue;

    let node = out;
    for (const part of parts.slice(0, -1)) {
      if (typeof node[part] !== 'object' || node[part] === null) node[part] = {};
      node = node[part] as Messages;
    }
    node[parts[parts.length - 1]] = value;
  }

  return out;
}

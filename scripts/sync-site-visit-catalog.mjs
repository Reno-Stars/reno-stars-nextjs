#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Pulls the quoting catalog export into this repo as a committed artifact and
 * fails if it has drifted away from the authored checklist copy.
 *
 * The site-visit checklist derives which checks to show from the same models
 * and modifiers the quoting system uses, so a worker captures exactly what the
 * quote will need. The catalog lives in reno-stars-invoice-service; this script
 * copies its export here so the page never depends on that service at runtime.
 *
 * Usage:
 *   node scripts/sync-site-visit-catalog.mjs            # sync + verify
 *   node scripts/sync-site-visit-catalog.mjs --check    # verify only, no write
 *
 * Source path override: SITE_VISIT_CATALOG_SRC=/path/to/site-visit-catalog.json
 *
 * The verify step is the point of this script. Add a modifier to the quoting
 * system and the next run fails loudly with the un-authored step keys, instead
 * of silently shipping a checklist that omits the new work.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHECK_ONLY = process.argv.includes('--check');

const SRC =
  process.env.SITE_VISIT_CATALOG_SRC ??
  path.join(
    os.homedir(),
    'workspace/reno-stars-invoice-service/tools/site-visit-catalog.json',
  );

const DEST = path.resolve('data/site-visit/catalog.json');
const COPY = path.resolve('messages/en/siteVisit.json');

const SCHEMA_VERSION = 1;

const die = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};

const readJson = async (p, label) => {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') die(`${label} not found at ${p}`);
    die(`${label} at ${p} is not valid JSON: ${err.message}`);
  }
};

// ── Load ────────────────────────────────────────────────────────────────────
// --check runs in CI and on machines without the invoice-service checkout, so
// it verifies the committed artifact rather than re-reading the source.
const catalog = CHECK_ONLY
  ? await readJson(DEST, 'Committed catalog')
  : await readJson(SRC, 'Catalog export');

if (catalog.schemaVersion !== SCHEMA_VERSION) {
  die(
    `Catalog schemaVersion is ${catalog.schemaVersion}, this repo expects ${SCHEMA_VERSION}. ` +
      `Re-check lib/site-visit/types.ts against the exporter before bumping.`,
  );
}

const copy = await readJson(COPY, 'Checklist copy (messages/en/siteVisit.json)');
const authored = copy?.siteVisit?.steps ?? {};

// ── Verify: every step the catalog can put in scope has authored checks ─────
const catalogSteps = catalog.steps.map((s) => s.key);
const missing = catalogSteps.filter((k) => !authored[k]);
const orphaned = Object.keys(authored).filter((k) => !catalogSteps.includes(k));

// Every model/modifier the picker offers needs a display name too.
const names = copy?.siteVisit?.names ?? {};
const namedThings = catalog.sections.flatMap((s) => [
  ...s.models.map((m) => m.id),
  ...s.modifiers.map((m) => m.id),
]);
const missingNames = namedThings.filter((id) => !names[id]);

const problems = [];
if (missing.length) {
  problems.push(
    `${missing.length} catalog step(s) have no authored checks in messages/en/siteVisit.json ` +
      `under siteVisit.steps:\n    ${missing.join('\n    ')}`,
  );
}
if (missingNames.length) {
  problems.push(
    `${missingNames.length} model/modifier(s) have no display name under siteVisit.names:\n    ` +
      missingNames.join('\n    '),
  );
}
if (orphaned.length) {
  // Not fatal: a step can be dropped from the catalog while the copy lingers.
  // Worth surfacing so the copy gets cleaned up, but it breaks nothing.
  console.warn(
    `⚠ ${orphaned.length} authored step(s) no longer exist in the catalog: ${orphaned.join(', ')}`,
  );
}

if (problems.length) die(problems.join('\n\n  '));

// ── Write ───────────────────────────────────────────────────────────────────
if (!CHECK_ONLY) {
  await fs.mkdir(path.dirname(DEST), { recursive: true });
  const next = `${JSON.stringify(catalog, null, 2)}\n`;
  const prev = await fs.readFile(DEST, 'utf8').catch(() => null);
  await fs.writeFile(DEST, next);
  console.log(
    prev === next
      ? `= ${path.relative(process.cwd(), DEST)} already up to date`
      : `✓ wrote ${path.relative(process.cwd(), DEST)}`,
  );
}

const modelCount = catalog.sections.reduce((n, s) => n + s.models.length, 0);
const modCount = catalog.sections.reduce((n, s) => n + s.modifiers.length, 0);
console.log(
  `✓ ${catalog.sections.length} sections, ${modelCount} models, ${modCount} modifiers, ` +
    `${catalogSteps.length} steps — all have authored checks`,
);

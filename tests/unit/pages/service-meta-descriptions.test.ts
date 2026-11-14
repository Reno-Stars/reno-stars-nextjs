import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Ryan (via Captain, 2026-11-13 20:49): the cabinet page may only claim the
 * up-to-3-year warranty for its plumbing/electrical parts (under-cabinet
 * lighting, sinks, faucets) and must never say "workmanship". The approved EN
 * sentence is pinned here verbatim so a rewording cannot slip through.
 */
const PAGE = 'app/[locale]/services/[service-slug]/page.tsx';
const EXPECTED_EN_CABINET =
  'Vancouver cabinet refacing & replacement. Up to 3-year warranty on plumbing and electrical work such as under-cabinet lighting, sinks and faucets. Free quote.';
const EN_BLOCK = /const enServiceMetaDescriptions[^=]*=\s*\{([\s\S]*?)\n\};/;
const CABINET_LINE = /^\s*cabinet:\s*'([^']*)',?\s*$/m;
const read = (p: string) => readFileSync(p, 'utf8');

function enCabinetDescription(): string | undefined {
  const block = EN_BLOCK.exec(read(PAGE))?.[1];
  return block === undefined ? undefined : CABINET_LINE.exec(block)?.[1];
}

it('en cabinet meta description is the approved plumbing/electrical sentence', () => {
  expect(enCabinetDescription()).toBe(EXPECTED_EN_CABINET);
});

it('en cabinet meta description never says workmanship', () => {
  expect(enCabinetDescription()).toBeDefined();
  expect(enCabinetDescription()).not.toMatch(/workmanship/i);
});

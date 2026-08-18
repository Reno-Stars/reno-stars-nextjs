import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { RECRUITING_EMAIL } from '@/lib/company-config';

/**
 * Resumes go to a dedicated recruiting mailbox, NOT the general company inbox
 * that `getCompanyFromDb()` returns. This regressed silently once already: the
 * recruiting poster printed one address while every ad and the site printed
 * another, so applications split across two mailboxes. Asserting on the source
 * keeps the careers CTA wired to the single owner-chosen address.
 */
describe('careers apply CTA', () => {
  const source = readFileSync('components/pages/CareersPage.tsx', 'utf8');

  it('mails the dedicated recruiting address, not a company/db email', () => {
    expect(source).toContain('mailto:${RECRUITING_EMAIL}');
    expect(source).not.toMatch(/mailto:\$\{email\}/);
    expect(source).not.toContain('info@reno-stars.com');
  });

  it('takes no email prop, so no caller can override the destination', () => {
    expect(source).not.toMatch(/^\s*email: string;$/m);
  });

  it('the recruiting address is a real, non-placeholder mailbox', () => {
    expect(RECRUITING_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });
});

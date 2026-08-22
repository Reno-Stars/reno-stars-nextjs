import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { RECRUITING_EMAIL } from '@/lib/company-config';

/**
 * The careers CTA must mail RECRUITING_EMAIL — the one owner-chosen address —
 * and never a literal or a caller-supplied one. Applications have already been
 * split across two mailboxes once (the recruiting poster printed a different
 * address from the ads), and the destination has since been repointed, so the
 * single source of truth is the thing worth pinning down.
 */
describe('careers apply CTA', () => {
  const source = readFileSync('components/pages/CareersPage.tsx', 'utf8');

  it('mails the dedicated recruiting address, not a company/db email', () => {
    expect(source).toContain('mailto:${RECRUITING_EMAIL}');
    expect(source).not.toMatch(/mailto:\$\{email\}/);
    // No literal address in the component — the destination has already moved
    // once, and a hardcoded one would silently outlive the constant.
    expect(source).not.toMatch(/[\w.]+@[\w.-]+\.\w+/);
  });

  it('takes no email prop, so no caller can override the destination', () => {
    expect(source).not.toMatch(/^\s*email: string;$/m);
  });

  it('the recruiting address is a real, non-placeholder mailbox', () => {
    expect(RECRUITING_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });
});

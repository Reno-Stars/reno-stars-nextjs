import { describe, it, expect } from 'vitest';
import { renderProseChips } from '@/lib/prose-chips';
import { renderProseHtml, normalizeInternalLinks } from '@/lib/markdown-html';

const link = (href: string, text: string) => `<a href="${href}">${text}</a>`;

describe('renderProseChips', () => {
  it('turns a "Label: link | link | link" paragraph into a chip group', () => {
    const html = `<p>Related cost guides: ${link('/en/guides/kitchen/', 'Kitchen costs')} | ${link('/en/guides/bath/', 'Bathroom costs')} | ${link('/en/guides/basement/', 'Basement costs')}</p>`;
    const out = renderProseChips(html);

    expect(out).toContain('rs-chip-group');
    expect(out).toContain('not-prose');
    expect(out).toContain('<span class="rs-chip-group-label">Related cost guides:</span>');
    expect(out).toContain('rs-chip-row');
    // every link becomes a pill and NO literal " | " survives
    expect(out.match(/class="rs-chip"/g)).toHaveLength(3);
    expect(out).not.toContain(' | ');
    expect(out).not.toContain('<p>');
  });

  it('preserves every href exactly (locale prefixes, query, fragment)', () => {
    const html = `<p>Featured projects: ${link('/en/blog/a/', 'A')} | ${link('/zh/services/kitchen/vancouver/?x=1#f', 'B')}</p>`;
    const out = renderProseChips(html);
    expect(out).toContain('href="/en/blog/a/"');
    expect(out).toContain('href="/zh/services/kitchen/vancouver/?x=1#f"');
  });

  it('reads a bold/strong-wrapped label and preserves its emphasis', () => {
    const html = `<p><strong>Our Vancouver renovation services:</strong> ${link('/en/services/kitchen/vancouver/', 'Kitchen')} | ${link('/en/services/bathroom/vancouver/', 'Bathroom')}</p>`;
    const out = renderProseChips(html);
    // the <strong> emphasis is carried into the label (not dropped)
    expect(out).toContain('<span class="rs-chip-group-label"><strong>Our Vancouver renovation services:</strong></span>');
    expect(out.match(/class="rs-chip"/g)).toHaveLength(2);
  });

  it('preserves an <em> label emphasis too', () => {
    const html = `<p><em>Featured:</em> ${link('/en/p/1/', '1')} | ${link('/en/p/2/', '2')}</p>`;
    const out = renderProseChips(html);
    expect(out).toContain('<span class="rs-chip-group-label"><em>Featured:</em></span>');
  });

  it('reads a plain (unwrapped) label with no added emphasis', () => {
    const html = `<p>Guides: ${link('/en/a/', 'A')} | ${link('/en/b/', 'B')}</p>`;
    const out = renderProseChips(html);
    expect(out).toContain('<span class="rs-chip-group-label">Guides:</span>');
  });

  it('leaves a single-link labelled paragraph inline', () => {
    const html = `<p>See our ${link('/en/reviews/', 'verified reviews')}.</p>`;
    expect(renderProseChips(html)).toBe(html);
  });

  it('leaves a normal prose paragraph untouched', () => {
    const html = '<p>We renovate kitchens and bathrooms across Metro Vancouver.</p>';
    expect(renderProseChips(html)).toBe(html);
  });

  it('leaves a paragraph with a colon but no piped links untouched', () => {
    const html = `<p>We offer these services: kitchen, bathroom, and ${link('/en/services/basement/', 'basement')} work.</p>`;
    expect(renderProseChips(html)).toBe(html);
  });

  it('does not fire when links are joined by prose instead of " | "', () => {
    const html = `<p>Guides: ${link('/en/a/', 'A')} and ${link('/en/b/', 'B')}.</p>`;
    expect(renderProseChips(html)).toBe(html);
  });

  it('does not fire when there is trailing prose after the link list', () => {
    const html = `<p>Guides: ${link('/en/a/', 'A')} | ${link('/en/b/', 'B')} — full scope.</p>`;
    expect(renderProseChips(html)).toBe(html);
  });

  it('requires a label ending in a colon (a bare piped list stays inline)', () => {
    const html = `<p>${link('/en/a/', 'A')} | ${link('/en/b/', 'B')}</p>`;
    expect(renderProseChips(html)).toBe(html);
  });

  it('does not touch a heading that contains piped links (only <p> is transformed)', () => {
    const html = `<h2>Guides: ${link('/en/a/', 'A')} | ${link('/en/b/', 'B')}</h2>`;
    expect(renderProseChips(html)).toBe(html);
  });

  it('leaves plain-text pipes (no links) untouched', () => {
    const html = '<p>Kitchen | Bathroom | Basement</p>';
    expect(renderProseChips(html)).toBe(html);
  });

  it('transforms multiple chip groups and leaves prose between them intact', () => {
    const p1 = `<p>Related cost guides: ${link('/en/g/k/', 'K')} | ${link('/en/g/b/', 'B')}</p>`;
    const mid = '<p>Some ordinary sentence in between.</p>';
    const p2 = `<p>Featured projects: ${link('/en/p/1/', '1')} | ${link('/en/p/2/', '2')}</p>`;
    const out = renderProseChips(p1 + mid + p2);
    expect(out.match(/class="rs-chip-group not-prose"/g)).toHaveLength(2);
    expect(out).toContain(mid);
  });

  it('is idempotent (re-running does not double-wrap)', () => {
    const html = `<p>Related cost guides: ${link('/en/g/k/', 'K')} | ${link('/en/g/b/', 'B')}</p>`;
    const once = renderProseChips(html);
    expect(renderProseChips(once)).toBe(once);
  });

  it('works end-to-end from markdown through renderProseHtml (the real render path)', () => {
    const md = 'Related cost guides: [Kitchen costs](/en/guides/kitchen/) | [Bathroom costs](/en/guides/bath/) | [Basement costs](/en/guides/basement/)';
    const out = renderProseChips(renderProseHtml(md));
    expect(out).toContain('rs-chip-group');
    expect(out.match(/class="rs-chip"/g)).toHaveLength(3);
    expect(out).toContain('href="/en/guides/kitchen/"');
    expect(out).not.toContain(' | ');
  });

  // Finding 1 — the combo/area render path locale-normalizes the chip anchors
  // BEFORE chipping, so a zh page rewrites authored /en/… links to /zh/… (no
  // 308 redirect, no wrong-locale equity drain). Mirrors the real pipeline order
  // renderProseChips(normalizeInternalLinks(renderProseHtml(slice), locale)).
  it('locale-normalizes chip anchor hrefs before chipping (zh page rewrites /en → /zh)', () => {
    const md = 'Related cost guides: [Kitchen costs](/en/guides/kitchen/) | [Bathroom costs](/en/guides/bath/) | [Basement costs](/en/guides/basement/)';
    const out = renderProseChips(normalizeInternalLinks(renderProseHtml(md), 'zh'));
    expect(out).toContain('rs-chip-group');
    expect(out.match(/class="rs-chip"/g)).toHaveLength(3);
    // every authored /en/… link is now /zh/… on the CHIP anchors
    expect(out).toContain('href="/zh/guides/kitchen/"');
    expect(out).toContain('href="/zh/guides/bath/"');
    expect(out).toContain('href="/zh/guides/basement/"');
    expect(out).not.toContain('href="/en/guides/');
  });

  // Finding 4 — merge rs-chip into a pre-existing class attribute rather than
  // emitting a second, invalid `class=` attribute.
  it('merges rs-chip into a pre-existing class attribute (no double class=)', () => {
    const html = `<p>Guides: <a href="/en/a/" class="foo">A</a> | <a href="/en/b/" class="bar baz">B</a></p>`;
    const out = renderProseChips(html);
    expect(out).toContain('class="foo rs-chip"');
    expect(out).toContain('class="bar baz rs-chip"');
    // no anchor carries two separate class attributes
    expect(out).not.toMatch(/<a\b[^>]*\sclass="[^"]*"[^>]*\sclass="/i);
  });

  // Finding 5 — a pathologically long piped list (past the anchor-count guard)
  // is left inline instead of being fed to the tempered-greedy LINK_LIST_RE.
  it('bails to inline for a list past the anchor-count guard (ReDoS guard)', () => {
    const many = Array.from({ length: 25 }, (_, i) => link(`/en/g/${i}/`, `G${i}`)).join(' | ');
    const html = `<p>Guides: ${many}</p>`;
    const out = renderProseChips(html);
    expect(out).toBe(html);
    expect(out).not.toContain('rs-chip-group');
  });

  it('still chips a normal-sized list right under the guard bounds', () => {
    const some = Array.from({ length: 6 }, (_, i) => link(`/en/g/${i}/`, `G${i}`)).join(' | ');
    const html = `<p>Guides: ${some}</p>`;
    const out = renderProseChips(html);
    expect(out).toContain('rs-chip-group');
    expect(out.match(/class="rs-chip"/g)).toHaveLength(6);
  });
});

import { describe, it, expect } from 'vitest';
import { renderProseChips } from '@/lib/prose-chips';
import { renderProseHtml } from '@/lib/markdown-html';

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

  it('reads a bold/strong-wrapped label and drops the emphasis tag', () => {
    const html = `<p><strong>Our Vancouver renovation services:</strong> ${link('/en/services/kitchen/vancouver/', 'Kitchen')} | ${link('/en/services/bathroom/vancouver/', 'Bathroom')}</p>`;
    const out = renderProseChips(html);
    expect(out).toContain('<span class="rs-chip-group-label">Our Vancouver renovation services:</span>');
    // the <strong> wrapper is not carried into the label
    expect(out).not.toContain('<strong>Our Vancouver');
    expect(out.match(/class="rs-chip"/g)).toHaveLength(2);
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
});

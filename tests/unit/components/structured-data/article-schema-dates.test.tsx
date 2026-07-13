import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ArticleSchema from '@/components/structured-data/ArticleSchema';
import type { Company } from '@/lib/types';

// Pin the honest-dates contract for BlogPosting JSON-LD (2026-07-10 bathtub
// forensics): dateModified must come ONLY from an explicit, trusted caller
// value — never fabricated from datePublished or request time. Fake-fresh
// dates are a trust signal Google explicitly devalues.

const company: Company = {
  name: 'Reno Stars',
  logo: 'https://example.com/logo.png',
} as unknown as Company;

function renderSchema(props: { datePublished?: string; dateModified?: string }) {
  const html = renderToStaticMarkup(
    <ArticleSchema
      company={company}
      headline="Bathtub Renovation Cost Vancouver"
      url="/en/blog/bathtub-renovation-cost-vancouver/"
      {...props}
    />,
  );
  const inner = html
    .replace(/^.*?<script[^>]*type="application\/ld\+json"[^>]*>/, '')
    .replace(/<\/script>.*$/, '');
  return JSON.parse(inner.replace(/\\u003c/g, '<')) as Record<string, unknown>;
}

describe('ArticleSchema date emission', () => {
  it('emits both dates when both are provided', () => {
    const schema = renderSchema({
      datePublished: '2026-04-17T18:31:46.466Z',
      dateModified: '2026-05-20T10:00:00.000Z',
    });
    expect(schema.datePublished).toBe('2026-04-17T18:31:46.466Z');
    expect(schema.dateModified).toBe('2026-05-20T10:00:00.000Z');
  });

  it('OMITS dateModified when not provided — no datePublished fallback fabrication', () => {
    const schema = renderSchema({ datePublished: '2026-04-17T18:31:46.466Z' });
    expect(schema.datePublished).toBe('2026-04-17T18:31:46.466Z');
    expect('dateModified' in schema).toBe(false);
  });

  it('omits both dates when neither is provided', () => {
    const schema = renderSchema({});
    expect('datePublished' in schema).toBe(false);
    expect('dateModified' in schema).toBe(false);
  });
});

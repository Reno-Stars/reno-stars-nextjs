import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Keep the render self-contained: the navigation Link and the image optimizer
// pull in Next runtime internals that don't resolve under the plain jsdom
// transform, so stub them to trivial DOM elements. next-intl is already
// globally mocked in tests/setup.ts to echo the translation KEY, so the
// Challenge/Solution <h2> text is the key string 'modal.challenge' /
// 'modal.solution' — which is exactly what we count below.
vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));
vi.mock('@/components/OptimizedImage', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => React.createElement('img', { alt: props.alt, src: props.src }),
}));

import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import type { Company, Project } from '@/lib/types';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: 'test-project',
    title: { en: 'Test Kitchen Reno', zh: '测试厨房翻新' },
    description: { en: 'A test project.', zh: '测试项目。' },
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Vancouver',
    images: [],
    hero_image: '',
    ...overrides,
  };
}

const company = { phone: '778-960-7999' } as unknown as Company;

// ShareBar is a required prop of the real component and the server page always
// supplies it, so the render under test supplies it too rather than leaning on
// ShareBar's missing-context guard.
const share = { url: 'https://www.reno-stars.com/en/projects/test-project/', title: 'Test Kitchen Reno' };

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('ProjectDetailPage — Challenge/Solution single DOM copy (finding #33)', () => {
  it('renders the Challenge and Solution headings + body exactly once each', () => {
    const project = makeProject({
      challenge: { en: 'The kitchen was cramped and dated.', zh: '厨房狭小陈旧。' },
      solution: { en: 'We removed a wall and opened the layout.', zh: '我们拆墙打开布局。' },
    });

    const html = renderToStaticMarkup(
      <ProjectDetailPage locale="en" project={project} relatedProjects={[]} company={company} share={share} />,
    );

    // Previously duplicated across a `hidden lg:block` desktop copy + an
    // `lg:hidden` mobile copy — both shipped in the DOM. Now exactly one copy.
    expect(count(html, 'modal.challenge')).toBe(1);
    expect(count(html, 'modal.solution')).toBe(1);
    expect(count(html, 'The kitchen was cramped and dated.')).toBe(1);
    expect(count(html, 'We removed a wall and opened the layout.')).toBe(1);
  });

  it('renders only the half that exists (challenge without solution)', () => {
    const project = makeProject({
      challenge: { en: 'Tight galley footprint.', zh: '狭窄的走廊式布局。' },
    });

    const html = renderToStaticMarkup(
      <ProjectDetailPage locale="en" project={project} relatedProjects={[]} company={company} share={share} />,
    );

    expect(count(html, 'modal.challenge')).toBe(1);
    expect(count(html, 'modal.solution')).toBe(0);
  });

  it('omits the block entirely when there is no challenge or solution', () => {
    const html = renderToStaticMarkup(
      <ProjectDetailPage locale="en" project={makeProject()} relatedProjects={[]} company={company} share={share} />,
    );

    expect(html).not.toContain('modal.challenge');
    expect(html).not.toContain('modal.solution');
  });
});

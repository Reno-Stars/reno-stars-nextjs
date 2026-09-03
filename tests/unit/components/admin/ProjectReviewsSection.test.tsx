import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectReviewsSection, { type AdminProjectReview } from '@/components/admin/ProjectReviewsSection';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';
import en from '@/messages/admin/en';
import zh from '@/messages/admin/zh';

// The card is a client component wired to server actions and the app router;
// stub both so the copy can be asserted without a Next.js runtime.
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/app/actions/admin/project-reviews', () => ({
  createProjectReview: vi.fn(),
  updateProjectReview: vi.fn(() => vi.fn()),
  deleteProjectReview: vi.fn(),
}));
vi.mock('@/components/admin/ToastProvider', () => ({ useToast: () => ({ toast: vi.fn() }) }));

const REVIEW: AdminProjectReview = {
  id: '11111111-1111-4111-8111-111111111111',
  projectId: null,
  source: 'google',
  authorName: 'Lisa Jung',
  rating: 5,
  body: 'They rebuilt our kitchen on schedule.',
  bodyLang: 'en',
  reviewDate: '2026-03-01',
  ownerResponse: null,
  sourceUrl: null,
};

function renderSection(props: Partial<React.ComponentProps<typeof ProjectReviewsSection>> = {}) {
  return render(
    <AdminLocaleProvider>
      <ProjectReviewsSection defaultProjectId={null} projectOptions={[]} reviews={[]} {...props} />
    </AdminLocaleProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('ProjectReviewsSection copy scope', () => {
  it('defaults to the project-page copy when no scope is given', () => {
    renderSection();
    expect(screen.getByText(en.projectReviews.noReviews)).toBeInTheDocument();
  });

  // The regression: /admin/reviews reused this card and inherited the project
  // page's empty state ("No verified reviews linked to this project yet"),
  // which is false there — an unlinked review belongs to no project.
  it('uses the unlinked copy for the /admin/reviews surface', () => {
    renderSection({ scope: 'unlinked' });
    expect(screen.getByText(en.projectReviews.unlinkedNoReviews)).toBeInTheDocument();
    expect(screen.queryByText(en.projectReviews.noReviews)).not.toBeInTheDocument();
  });

  it('scopes the delete-confirmation message to the unlinked surface', () => {
    renderSection({ scope: 'unlinked', reviews: [REVIEW] });
    fireEvent.click(screen.getByRole('button', { name: en.common.delete }));
    expect(screen.getByText(en.projectReviews.unlinkedDeleteMessage)).toBeInTheDocument();
    expect(screen.queryByText(en.projectReviews.deleteMessage)).not.toBeInTheDocument();
  });

  it('never claims an unlinked review belongs to a project', () => {
    renderSection({ scope: 'unlinked', reviews: [REVIEW] });
    const rendered = document.body.textContent ?? '';
    expect(rendered).not.toMatch(/this project/i);
    expect(rendered).not.toMatch(/project page/i);
  });
});

describe('admin message parity', () => {
  it('defines every unlinked-scope key in both locales', () => {
    for (const key of ['unlinkedTooltip', 'unlinkedNoReviews', 'unlinkedDeleteMessage'] as const) {
      expect(en.projectReviews[key], `en.${key}`).toBeTruthy();
      expect(zh.projectReviews[key], `zh.${key}`).toBeTruthy();
      expect(zh.projectReviews[key]).not.toBe(en.projectReviews[key]);
    }
  });
});

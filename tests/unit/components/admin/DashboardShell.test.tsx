import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DashboardShell from '@/components/admin/DashboardShell';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
}));

// Mock useIsMobile hook
const mockUseIsMobile = vi.fn();
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Wrapper to provide required context
function renderWithProvider(ui: React.ReactElement) {
  return render(<AdminLocaleProvider>{ui}</AdminLocaleProvider>);
}

describe('DashboardShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false); // Default to desktop
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children content', () => {
    renderWithProvider(
      <DashboardShell>
        <div data-testid="test-content">Test Content</div>
      </DashboardShell>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar on desktop', () => {
    mockUseIsMobile.mockReturnValue(false);

    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Sidebar should be present
    const sidebar = document.querySelector('.admin-sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders TopBar', () => {
    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // TopBar renders locale switcher buttons (admin UI is en/zh only)
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('简体中文')).toBeInTheDocument();
  });

  it('closes sidebar on Escape key when open on mobile', async () => {
    mockUseIsMobile.mockReturnValue(true);

    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Open sidebar first (via context)
    const hamburger = screen.getByLabelText('Open menu');
    await act(async () => {
      fireEvent.click(hamburger);
    });

    // Verify sidebar has open class
    const sidebar = document.querySelector('.admin-sidebar--open');
    expect(sidebar).toBeInTheDocument();

    // Press Escape to close
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    // Sidebar should no longer have open class
    const closedSidebar = document.querySelector('.admin-sidebar--open');
    expect(closedSidebar).not.toBeInTheDocument();
  });

  it('renders overlay on mobile when sidebar is open', async () => {
    mockUseIsMobile.mockReturnValue(true);

    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Open sidebar
    const hamburger = screen.getByLabelText('Open menu');
    await act(async () => {
      fireEvent.click(hamburger);
    });

    // Overlay should be visible
    const overlay = document.querySelector('.admin-sidebar-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('closes sidebar when overlay is clicked', async () => {
    mockUseIsMobile.mockReturnValue(true);

    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Open sidebar
    const hamburger = screen.getByLabelText('Open menu');
    await act(async () => {
      fireEvent.click(hamburger);
    });

    // Click overlay
    const overlay = document.querySelector('.admin-sidebar-overlay');
    expect(overlay).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(overlay!);
    });

    // Sidebar should be closed
    const closedSidebar = document.querySelector('.admin-sidebar--open');
    expect(closedSidebar).not.toBeInTheDocument();
  });

  it('main content area has proper styling', () => {
    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    const main = document.querySelector('.admin-main-content');
    expect(main).toBeInTheDocument();
    expect(main).toHaveStyle({ flex: '1' });
  });

  it('does not show overlay on desktop', () => {
    mockUseIsMobile.mockReturnValue(false);

    renderWithProvider(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    const overlay = document.querySelector('.admin-sidebar-overlay');
    expect(overlay).not.toBeInTheDocument();
  });
});

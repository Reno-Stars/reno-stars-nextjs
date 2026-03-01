import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/admin/Sidebar';

// Mock next/navigation
const mockPathname = vi.fn(() => '/admin');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock translations
vi.mock('@/lib/admin/translations', () => ({
  useAdminTranslations: () => ({
    nav: {
      adminNavigation: 'Admin Navigation',
      renoStars: 'Reno Stars',
      dashboard: 'Dashboard',
      sites: 'Sites',
      services: 'Services',
      serviceAreas: 'Service Areas',
      blog: 'Blog',
      gallery: 'Gallery',
      faqs: 'FAQs',
      trustBadges: 'Trust Badges',
      contacts: 'Contacts',
      company: 'Company',
      showroom: 'Showroom',
      socialLinks: 'Social Links',
      about: 'About',
      partners: 'Partners',
      groups: {
        portfolio: 'Portfolio',
        content: 'Content',
        crm: 'CRM',
        settings: 'Settings',
      },
    },
    batchUpload: {
      navLabel: 'Batch Upload',
    },
  }),
}));

describe('Sidebar', () => {
  const localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/admin');

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => localStorageMock[key] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => {
        localStorageMock[key] = value;
      }
    );
  });

  afterEach(() => {
    // Clear localStorage mock
    Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key]);
  });

  it('renders navigation with dashboard link', () => {
    render(<Sidebar />);

    expect(screen.getByRole('navigation', { name: 'Admin Navigation' })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reno Stars')).toBeInTheDocument();
  });

  it('renders collapsible group headers', () => {
    render(<Sidebar />);

    expect(screen.getByRole('button', { name: /Portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Content/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CRM/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
  });

  it('shows items in expanded groups by default', () => {
    render(<Sidebar />);

    // Portfolio group is expanded by default
    expect(screen.getByText('Sites')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Service Areas')).toBeInTheDocument();
  });

  it('hides items in collapsed groups', () => {
    render(<Sidebar />);

    // Settings group is collapsed by default
    expect(screen.queryByText('Company')).not.toBeInTheDocument();
    expect(screen.queryByText('Showroom')).not.toBeInTheDocument();
  });

  it('toggles group expansion when header is clicked', () => {
    render(<Sidebar />);

    // Settings is collapsed by default
    expect(screen.queryByText('Company')).not.toBeInTheDocument();

    // Click to expand
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);

    // Items should now be visible
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Showroom')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(settingsButton);
    expect(screen.queryByText('Company')).not.toBeInTheDocument();
  });

  it('persists expanded state to localStorage', () => {
    render(<Sidebar />);

    // Expand Settings group
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'admin_sidebar_groups',
      expect.stringContaining('"settings":true')
    );
  });

  it('loads persisted state from localStorage', () => {
    // Pre-populate localStorage with settings expanded
    localStorageMock['admin_sidebar_groups'] = JSON.stringify({ settings: true });

    render(<Sidebar />);

    // Settings items should be visible because of persisted state
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('highlights dashboard as active on /admin path', () => {
    mockPathname.mockReturnValue('/admin');
    render(<Sidebar />);

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights nav item as active for matching path', () => {
    mockPathname.mockReturnValue('/admin/blog');
    render(<Sidebar />);

    const blogLink = screen.getByRole('link', { name: 'Blog' });
    expect(blogLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights nav item as active for child paths', () => {
    mockPathname.mockReturnValue('/admin/blog/123');
    render(<Sidebar />);

    const blogLink = screen.getByRole('link', { name: 'Blog' });
    expect(blogLink).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate when link is clicked', () => {
    const mockOnNavigate = vi.fn();
    render(<Sidebar onNavigate={mockOnNavigate} />);

    const blogLink = screen.getByRole('link', { name: 'Blog' });
    fireEvent.click(blogLink);

    expect(mockOnNavigate).toHaveBeenCalled();
  });

  it('auto-expands group when navigating to child item', () => {
    // Navigate to a settings page (settings is collapsed by default)
    mockPathname.mockReturnValue('/admin/company');
    render(<Sidebar />);

    // Settings items should be visible because of auto-expansion
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Showroom')).toBeInTheDocument();
  });

  it('has correct aria attributes on group headers', () => {
    render(<Sidebar />);

    const portfolioButton = screen.getByRole('button', { name: /Portfolio/i });
    expect(portfolioButton).toHaveAttribute('aria-expanded', 'true');
    expect(portfolioButton).toHaveAttribute('aria-controls', 'sidebar-group-content-portfolio');
  });

  it('has correct region and labeling on group content', () => {
    render(<Sidebar />);

    const portfolioRegion = screen.getByRole('region', { name: /Portfolio/i });
    expect(portfolioRegion).toBeInTheDocument();
  });
});

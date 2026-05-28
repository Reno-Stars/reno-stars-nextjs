import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardClient from '@/app/admin/(dashboard)/DashboardClient';

// Mock translations
vi.mock('@/lib/admin/translations', () => ({
  useAdminTranslations: () => ({
    dashboard: {
      welcome: 'Welcome',
      subtitle: 'Manage your content',
      groupPortfolio: 'Portfolio',
      groupContent: 'Content',
      groupSettings: 'Settings',
      projects: 'Projects',
      services: 'Services',
      serviceAreas: 'Service Areas',
      blogPosts: 'Blog Posts',
      socialPosts: 'Social Posts',
      designs: 'Designs',
      faqs: 'FAQs',
      socialLinks: 'Social Links',
      trustBadges: 'Trust Badges',
      partners: 'Partners',
      company: 'Company',
      showroom: 'Showroom',
      about: 'About',
    },
  }),
}));

describe('DashboardClient', () => {
  const defaultStats = {
    projects: 10,
    services: 6,
    blogPosts: 15,
    faqs: 8,
    designs: 42,
    areas: 12,
    socialLinks: 5,
    badges: 3,
    partners: 4,
    socialPosts: 9,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome header', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Manage your content')).toBeInTheDocument();
  });

  it('renders all group sections', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render a CRM section (Twenty CRM owns leads now)', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.queryByText('CRM')).not.toBeInTheDocument();
    expect(screen.queryByText('Contacts')).not.toBeInTheDocument();
    expect(screen.queryByText('New Contacts')).not.toBeInTheDocument();
  });

  it('renders stat cards with correct values', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // projects
    expect(screen.getByText('6')).toBeInTheDocument(); // services
    expect(screen.getByText('15')).toBeInTheDocument(); // blogPosts
    expect(screen.getByText('42')).toBeInTheDocument(); // designs
  });

  it('renders cards as links', () => {
    render(<DashboardClient stats={defaultStats} />);

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveAttribute('href', '/admin/projects');

    const blogLink = screen.getByRole('link', { name: /blog posts/i });
    expect(blogLink).toHaveAttribute('href', '/admin/blog');
  });

  it('renders portfolio section cards', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Service Areas')).toBeInTheDocument();
  });

  it('renders content section cards', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Designs')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();
    expect(screen.getByText('Social Links')).toBeInTheDocument();
    expect(screen.getByText('Trust Badges')).toBeInTheDocument();
  });
});

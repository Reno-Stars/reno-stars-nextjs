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
      groupCrm: 'CRM',
      projects: 'Projects',
      services: 'Services',
      serviceAreas: 'Service Areas',
      blogPosts: 'Blog Posts',
      designs: 'Designs',
      faqs: 'FAQs',
      socialLinks: 'Social Links',
      trustBadges: 'Trust Badges',
      contacts: 'Contacts',
      newContacts: 'New Contacts',
    },
  }),
}));

describe('DashboardClient', () => {
  const defaultStats = {
    projects: 10,
    services: 6,
    contacts: 25,
    newContacts: 0,
    blogPosts: 15,
    faqs: 8,
    designs: 42,
    areas: 12,
    socialLinks: 5,
    badges: 3,
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
    expect(screen.getByText('CRM')).toBeInTheDocument();
  });

  it('renders stat cards with correct values', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // projects
    expect(screen.getByText('6')).toBeInTheDocument(); // services
    expect(screen.getByText('15')).toBeInTheDocument(); // blogPosts
    expect(screen.getByText('42')).toBeInTheDocument(); // designs
    expect(screen.getByText('25')).toBeInTheDocument(); // contacts
  });

  it('renders cards as links', () => {
    render(<DashboardClient stats={defaultStats} />);

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveAttribute('href', '/admin/projects');

    const blogLink = screen.getByRole('link', { name: /blog posts/i });
    expect(blogLink).toHaveAttribute('href', '/admin/blog');
  });

  it('shows new contacts value when newContacts > 0', () => {
    const statsWithNewContacts = { ...defaultStats, newContacts: 7, socialLinks: 5 };
    render(<DashboardClient stats={statsWithNewContacts} />);

    // The new contacts card should show the value
    // Check within the New Contacts card context
    const newContactsCard = screen.getByRole('link', { name: /new contacts/i });
    expect(newContactsCard).toHaveTextContent('7');
  });

  it('shows 0 when there are no new contacts', () => {
    render(<DashboardClient stats={defaultStats} />);

    // New contacts card exists but with value 0
    const newContactsCard = screen.getByRole('link', { name: /new contacts/i });
    expect(newContactsCard).toHaveTextContent('0');
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

  it('renders crm section cards', () => {
    render(<DashboardClient stats={defaultStats} />);

    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('New Contacts')).toBeInTheDocument();
  });
});

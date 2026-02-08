import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataTable from '@/components/admin/DataTable';

// Mock the admin translations hook
vi.mock('@/lib/admin/translations', () => ({
  useAdminTranslations: () => ({
    common: {
      search: 'Search...',
      searchRecords: 'Search records',
      noRecords: 'No records found.',
      actions: 'Actions',
      prev: 'Prev',
      next: 'Next',
      record: 'record',
      records: 'records',
      dataTable: 'Data table',
    },
  }),
}));

interface TestRow {
  id: string;
  name: string;
  value: number;
}

const testData: TestRow[] = [
  { id: '1', name: 'Item 1', value: 100 },
  { id: '2', name: 'Item 2', value: 200 },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'value', header: 'Value' },
];

describe('DataTable', () => {
  it('renders data correctly', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });

  it('renders search input when searchable is true', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
        searchable={true}
      />
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('hides search input when searchable is false', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
        searchable={false}
      />
    );

    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('renders headerAction when provided', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
        headerAction={<button data-testid="add-button">Add Item</button>}
      />
    );

    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('renders headerAction next to search bar', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
        searchable={true}
        headerAction={<button data-testid="add-button">Add Item</button>}
      />
    );

    // Both search and headerAction should be in the same flex container
    const headerRow = container.querySelector('div[style*="justify-content: space-between"]');
    expect(headerRow).toBeInTheDocument();
    expect(headerRow).toContainElement(screen.getByPlaceholderText('Search...'));
    expect(headerRow).toContainElement(screen.getByTestId('add-button'));
  });

  it('renders headerAction alone when searchable is false', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
        searchable={false}
        headerAction={<button data-testid="add-button">Add Item</button>}
      />
    );

    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
  });

  it('renders action column when actions prop is provided', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getRowKey={(row) => row.id}
        actions={(row) => <button>Edit {row.name}</button>}
      />
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Edit Item 1')).toBeInTheDocument();
    expect(screen.getByText('Edit Item 2')).toBeInTheDocument();
  });
});

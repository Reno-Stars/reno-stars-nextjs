import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchableSelect from '@/components/admin/SearchableSelect';

// Mock scrollIntoView since jsdom doesn't support it
Element.prototype.scrollIntoView = vi.fn();

const mockOptions = [
  { id: '1', label: 'Option One' },
  { id: '2', label: 'Option Two' },
  { id: '3', label: 'Another Choice' },
];

describe('SearchableSelect', () => {
  const defaultProps = {
    name: 'test-select',
    options: mockOptions,
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder text', () => {
    render(<SearchableSelect {...defaultProps} placeholder="Select an option" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('placeholder', 'Select an option');
  });

  it('opens dropdown on focus', async () => {
    render(<SearchableSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      fireEvent.focus(input);
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('displays all options when dropdown is open', async () => {
    render(<SearchableSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
    });

    expect(screen.getByText('Option One')).toBeInTheDocument();
    expect(screen.getByText('Option Two')).toBeInTheDocument();
    expect(screen.getByText('Another Choice')).toBeInTheDocument();
  });

  it('filters options based on search input', async () => {
    render(<SearchableSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Option' } });
    });

    expect(screen.getByText('Option One')).toBeInTheDocument();
    expect(screen.getByText('Option Two')).toBeInTheDocument();
    expect(screen.queryByText('Another Choice')).not.toBeInTheDocument();
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();
    render(<SearchableSelect {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
    });

    const option = screen.getByText('Option Two');
    await act(async () => {
      fireEvent.click(option);
    });

    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('displays selected option label when value is set', () => {
    render(<SearchableSelect {...defaultProps} value="2" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Option Two');
  });

  it('shows no results message when search has no matches', async () => {
    render(<SearchableSelect {...defaultProps} noResultsText="Nothing found" />);

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'xyz' } });
    });

    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('clears selection when clear button is clicked', async () => {
    const onChange = vi.fn();
    render(<SearchableSelect {...defaultProps} value="1" onChange={onChange} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await act(async () => {
      fireEvent.click(clearButton);
    });

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('navigates options with arrow keys', async () => {
    render(<SearchableSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    // First option should be highlighted (aria-activedescendant set)
    expect(input).toHaveAttribute('aria-activedescendant', 'test-select-option-1');
  });

  it('selects highlighted option with Enter key', async () => {
    const onChange = vi.fn();
    render(<SearchableSelect {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('combobox');

    // Focus to open dropdown
    await act(async () => {
      fireEvent.focus(input);
    });

    // Navigate down to first option
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    // Select with Enter
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('closes dropdown with Escape key', async () => {
    render(<SearchableSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('is disabled when disabled prop is true', () => {
    render(<SearchableSelect {...defaultProps} disabled />);

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('has proper accessibility attributes', async () => {
    render(<SearchableSelect {...defaultProps} />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');

    await act(async () => {
      fireEvent.focus(input);
    });

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('id', 'test-select-listbox');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    options.forEach((option) => {
      expect(option).toHaveAttribute('aria-selected');
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <SearchableSelect {...defaultProps} />
        <button>Outside</button>
      </div>
    );

    const input = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.focus(input);
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');

    await act(async () => {
      fireEvent.mouseDown(screen.getByText('Outside'));
    });

    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});

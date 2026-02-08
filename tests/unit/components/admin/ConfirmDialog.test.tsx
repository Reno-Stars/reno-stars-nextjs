import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';

// Wrapper to provide required context
function renderWithProvider(ui: React.ReactElement) {
  return render(<AdminLocaleProvider>{ui}</AdminLocaleProvider>);
}

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock HTMLDialogElement methods
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('renders title and message', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('calls showModal when open is true', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} />);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('calls close when open changes to false', () => {
    // Track dialog open state since jsdom doesn't support it natively
    let dialogOpen = false;
    HTMLDialogElement.prototype.showModal = vi.fn(() => {
      dialogOpen = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(() => {
      dialogOpen = false;
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: () => dialogOpen,
      configurable: true,
    });

    const { rerender } = renderWithProvider(<ConfirmDialog {...defaultProps} />);

    rerender(
      <AdminLocaleProvider>
        <ConfirmDialog {...defaultProps} open={false} />
      </AdminLocaleProvider>
    );

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();

    renderWithProvider(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    // Find the delete/confirm button by text
    const confirmButton = screen.getByText('Delete');

    await act(async () => {
      fireEvent.click(confirmButton);
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();

    renderWithProvider(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses custom confirm label when provided', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} confirmLabel="Remove" />);

    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('disables confirm button when loading', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByText('Processing...');
    expect(confirmButton).toBeDisabled();
  });

  it('shows processing text when loading', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} loading={true} />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const { container } = renderWithProvider(<ConfirmDialog {...defaultProps} />);

    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('buttons have focus-visible class for keyboard accessibility', () => {
    renderWithProvider(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Delete');

    expect(cancelButton).toHaveClass('confirm-dialog-btn');
    expect(confirmButton).toHaveClass('confirm-dialog-btn');
  });
});

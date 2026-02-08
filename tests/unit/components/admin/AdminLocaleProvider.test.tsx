import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AdminLocaleProvider, useAdminLocale } from '@/components/admin/AdminLocaleProvider';

// Test component to access context
function TestConsumer() {
  const { locale, setLocale, sidebarOpen, setSidebarOpen } = useAdminLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="sidebar">{sidebarOpen ? 'open' : 'closed'}</span>
      <button onClick={() => setLocale('zh')} data-testid="set-zh">Set ZH</button>
      <button onClick={() => setLocale('en')} data-testid="set-en">Set EN</button>
      <button onClick={() => setSidebarOpen(true)} data-testid="open-sidebar">Open</button>
      <button onClick={() => setSidebarOpen(false)} data-testid="close-sidebar">Close</button>
    </div>
  );
}

describe('AdminLocaleProvider', () => {
  const localStorageMock = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock.store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock.store[key];
    }),
    clear: vi.fn(() => {
      localStorageMock.store = {};
    }),
  };

  beforeEach(() => {
    localStorageMock.store = {};
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides default locale as en', () => {
    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('provides default sidebar as closed', () => {
    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    expect(screen.getByTestId('sidebar')).toHaveTextContent('closed');
  });

  it('loads locale from localStorage on mount', async () => {
    localStorageMock.store['admin_locale'] = 'zh';

    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    // Wait for useEffect to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
  });

  it('persists locale to localStorage when changed', async () => {
    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-zh'));
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_locale', 'zh');
    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
  });

  it('handles sidebar state changes', async () => {
    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    expect(screen.getByTestId('sidebar')).toHaveTextContent('closed');

    await act(async () => {
      fireEvent.click(screen.getByTestId('open-sidebar'));
    });
    expect(screen.getByTestId('sidebar')).toHaveTextContent('open');

    await act(async () => {
      fireEvent.click(screen.getByTestId('close-sidebar'));
    });
    expect(screen.getByTestId('sidebar')).toHaveTextContent('closed');
  });

  it('ignores invalid localStorage values', async () => {
    localStorageMock.store['admin_locale'] = 'invalid';

    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Should remain as default 'en'
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('handles localStorage errors gracefully', async () => {
    const errorStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage disabled');
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage disabled');
      }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: errorStorage,
      writable: true,
    });

    // Should not throw
    render(
      <AdminLocaleProvider>
        <TestConsumer />
      </AdminLocaleProvider>
    );

    // Should still work functionally
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-zh'));
    });
    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
  });

  it('throws error when useAdminLocale is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAdminLocale must be used within AdminLocaleProvider');

    consoleSpy.mockRestore();
  });
});

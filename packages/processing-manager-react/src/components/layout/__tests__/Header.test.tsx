/**
 * Header Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { useAppStore } from '../../../stores/appStore';

// Mock the external stores
vi.mock('@cyoda/ui-lib-react', () => ({
  LogOutButton: ({ onLogout, buttonText, type }: any) => (
    <button onClick={() => onLogout(false)} data-testid="logout-button">
      {buttonText || 'Logout'}
    </button>
  ),
  useAuthStore: (selector?: any) => {
    const state = { logout: vi.fn() };
    return selector ? selector(state) : state.logout;
  },
  useUserManagerStore: (selector?: any) => {
    const state = { user: { email: 'test@example.com' } };
    return selector ? selector(state) : state.user;
  },
}));

const mockNavigate = vi.fn();
const mockRefetch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useClusterStats hook
vi.mock('../../../hooks/useProcessing', () => ({
  useClusterStats: () => ({
    data: { consistencyTimeLagMs: 42 },
    refetch: mockRefetch,
    isLoading: false,
    error: null,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useAppStore.setState({
      sideBarIsShow: false,
      liveUpdate: false,
      proxyRequest: true,
    });
    mockRefetch.mockResolvedValue({ data: { consistencyTimeLagMs: 42 } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render header', () => {
    const { container } = renderWithRouter(<Header />);

    const header = container.querySelector('.c-header');
    expect(header).toBeInTheDocument();
  });

  it('should display user email', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText(/demo@cyoda.com/)).toBeInTheDocument();
  });

  it('should render logout button', () => {
    renderWithRouter(<Header />);

    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
  });

  it('should render sidebar toggle buttons', () => {
    const { container } = renderWithRouter(<Header />);

    const toggleButtons = container.querySelectorAll('.c-header-toggler');
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it('should toggle sidebar on button click', () => {
    const { container } = renderWithRouter(<Header />);

    const toggleButton = container.querySelector('.c-header-toggler');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton!);

    // Check that the store was updated
    const state = useAppStore.getState();
    expect(state.sideBarIsShow).toBe(true);
  });

  it('should render dashboard link', () => {
    renderWithRouter(<Header />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/processing-ui');
  });

  it('should render breadcrumbs portal', () => {
    const { container } = renderWithRouter(<Header />);

    const breadcrumbsPortal = container.querySelector('#breadcrumbs-portal');
    expect(breadcrumbsPortal).toBeInTheDocument();
  });

  it('should have subheader section', () => {
    const { container } = renderWithRouter(<Header />);

    const subheader = container.querySelector('.c-subheader');
    expect(subheader).toBeInTheDocument();
  });

  it('should render menu icons', () => {
    const { container } = renderWithRouter(<Header />);

    const menuIcons = container.querySelectorAll('.anticon-menu');
    expect(menuIcons.length).toBeGreaterThan(0);
  });

  it('should have navigation items', () => {
    const { container } = renderWithRouter(<Header />);

    const navList = container.querySelector('.c-header-nav');
    expect(navList).toBeInTheDocument();
  });

  it('should render with correct header classes', () => {
    const { container } = renderWithRouter(<Header />);

    const header = container.querySelector('.c-header');
    expect(header).toHaveClass('c-header-light');
    expect(header).toHaveClass('c-header-fixed');
    expect(header).toHaveClass('c-header-with-subheader');
  });

  // New feature tests
  describe('Consistency Time Lag', () => {
    it('should render consistency time lag display', () => {
      renderWithRouter(<Header />);

      expect(screen.getByText(/Consistency time lag\(millis\):/)).toBeInTheDocument();
    });

    it('should display initial consistency time lag value', () => {
      renderWithRouter(<Header />);

      expect(screen.getByText(/Consistency time lag\(millis\): 0/)).toBeInTheDocument();
    });

    it('should poll cluster stats when live update is enabled', async () => {
      useAppStore.setState({ liveUpdate: true });

      renderWithRouter(<Header />);

      // Fast-forward time by 1 second and run all timers
      await vi.advanceTimersByTimeAsync(1000);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should not poll cluster stats when live update is disabled', async () => {
      useAppStore.setState({ liveUpdate: false });

      renderWithRouter(<Header />);

      // Fast-forward time by 1 second
      vi.advanceTimersByTime(1000);

      // refetch should not be called when liveUpdate is false
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should update consistency time lag when data is fetched', async () => {
      useAppStore.setState({ liveUpdate: true });
      mockRefetch.mockResolvedValue({ data: { consistencyTimeLagMs: 123 } });

      renderWithRouter(<Header />);

      // Fast-forward time by 1 second and run all timers
      await vi.advanceTimersByTimeAsync(1000);

      // Check that refetch was called
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Live Update Toggle', () => {
    it('should render live update toggle', () => {
      renderWithRouter(<Header />);

      expect(screen.getByText('Live update:')).toBeInTheDocument();
    });

    it('should render live update toggle with switch', () => {
      const { container } = renderWithRouter(<Header />);

      const liveUpdateSection = screen.getByText('Live update:').closest('.live-update-toggle');
      expect(liveUpdateSection).toBeInTheDocument();

      const switchElement = liveUpdateSection?.querySelector('.ant-switch');
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe('Proxy Mode Toggle', () => {
    it('should render proxy mode toggle', () => {
      renderWithRouter(<Header />);

      expect(screen.getByText('Proxy mode')).toBeInTheDocument();
    });

    it('should render proxy mode toggle with switch and info icon', () => {
      const { container } = renderWithRouter(<Header />);

      const proxyModeSection = screen.getByText('Proxy mode').closest('.proxy-mode-toggle');
      expect(proxyModeSection).toBeInTheDocument();

      const switchElement = proxyModeSection?.querySelector('.ant-switch');
      expect(switchElement).toBeInTheDocument();

      const infoIcon = proxyModeSection?.querySelector('.anticon-info-circle');
      expect(infoIcon).toBeInTheDocument();
    });
  });

  describe('Subheader Layout', () => {
    it('should render all subheader elements in correct order', () => {
      const { container } = renderWithRouter(<Header />);

      const subheader = container.querySelector('.c-subheader');
      expect(subheader).toBeInTheDocument();

      // Check for consistency time lag
      expect(screen.getByText(/Consistency time lag/)).toBeInTheDocument();

      // Check for delimiters
      const delimiters = container.querySelectorAll('.delimiter');
      expect(delimiters.length).toBeGreaterThanOrEqual(2);

      // Check for live update toggle
      expect(screen.getByText('Live update:')).toBeInTheDocument();

      // Check for proxy mode toggle
      expect(screen.getByText('Proxy mode')).toBeInTheDocument();
    });
  });
});

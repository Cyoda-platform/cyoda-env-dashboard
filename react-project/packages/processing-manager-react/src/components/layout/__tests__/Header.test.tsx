/**
 * Header Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      sideBarIsShow: false,
    });
  });

  it('should render header', () => {
    const { container } = renderWithRouter(<Header />);

    const header = container.querySelector('.c-header');
    expect(header).toBeInTheDocument();
  });

  it('should display user email', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
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

  it('should toggle sidebar on button click', async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<Header />);

    const toggleButton = container.querySelector('.c-header-toggler');
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton!);

    // Check that the store was updated
    const state = useAppStore.getState();
    expect(state.sideBarIsShow).toBe(true);
  });

  it('should render dashboard link', () => {
    renderWithRouter(<Header />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
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
});


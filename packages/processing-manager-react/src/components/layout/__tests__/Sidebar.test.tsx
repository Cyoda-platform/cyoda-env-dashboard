/**
 * Sidebar Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { useAppStore } from '../../../stores/appStore';

const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {component}
    </MemoryRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    // Reset store to default state
    useAppStore.setState({
      sideBarIsShow: false,
      sideBarIsMinimize: false,
    });
  });

  it('should render sidebar', () => {
    const { container } = renderWithRouter(<Sidebar />);

    const sidebar = container.querySelector('.c-sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('should display Cyoda logo', () => {
    renderWithRouter(<Sidebar />);

    const logos = screen.getAllByAltText('Cyoda Logo');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('should render menu items from menu.json', () => {
    renderWithRouter(<Sidebar />);

    // Check for Dashboard menu item
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();

    // Check for Nodes menu item
    const nodesLink = screen.getByText('Nodes');
    expect(nodesLink).toBeInTheDocument();
  });

  it('should have links to correct routes', () => {
    renderWithRouter(<Sidebar />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/processing-ui');

    const nodesLink = screen.getByText('Nodes').closest('a');
    expect(nodesLink).toHaveAttribute('href', '/processing-ui/nodes');
  });

  it('should highlight active menu item', () => {
    renderWithRouter(<Sidebar />, '/processing-ui/dashboard');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('c-active');
  });

  it('should not highlight inactive menu items', () => {
    renderWithRouter(<Sidebar />, '/processing-ui/dashboard');

    const nodesLink = screen.getByText('Nodes').closest('a');
    expect(nodesLink).not.toHaveClass('c-active');
  });

  it('should show sidebar when sideBarIsShow is true', () => {
    useAppStore.setState({ sideBarIsShow: true });
    const { container } = renderWithRouter(<Sidebar />);

    const sidebar = container.querySelector('.c-sidebar');
    expect(sidebar).toHaveClass('c-sidebar-lg-show');
  });

  it('should minimize sidebar when sideBarIsMinimize is true', () => {
    useAppStore.setState({ sideBarIsMinimize: true });
    const { container } = renderWithRouter(<Sidebar />);

    const sidebar = container.querySelector('.c-sidebar');
    expect(sidebar).toHaveClass('c-sidebar-unfoldable');
  });

  it('should render minimize button', () => {
    const { container } = renderWithRouter(<Sidebar />);

    const minimizeButton = container.querySelector('.c-sidebar-minimizer');
    expect(minimizeButton).toBeInTheDocument();
  });

  it('should toggle minimize on button click', async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<Sidebar />);

    const minimizeButton = container.querySelector('.c-sidebar-minimizer');
    expect(minimizeButton).toBeInTheDocument();

    await user.click(minimizeButton!);

    // Check that the store was updated
    const state = useAppStore.getState();
    expect(state.sideBarIsMinimize).toBe(true);
  });

  it('should render menu icons', () => {
    const { container } = renderWithRouter(<Sidebar />);

    // Check that icon spans exist
    const iconSpans = container.querySelectorAll('.c-sidebar-nav-icon');
    expect(iconSpans.length).toBeGreaterThan(0);

    // Check for anticon elements (Ant Design icons)
    const icons = container.querySelectorAll('.anticon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have sidebar navigation list', () => {
    const { container } = renderWithRouter(<Sidebar />);

    const navList = container.querySelector('.c-sidebar-nav');
    expect(navList).toBeInTheDocument();
  });

  it('should render brand section with logo link', () => {
    renderWithRouter(<Sidebar />);

    const brandLink = screen.getAllByAltText('Cyoda Logo')[0].closest('a');
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('should highlight active route with subpath', () => {
    renderWithRouter(<Sidebar />, '/processing-ui/nodes/test-node');

    const nodesLink = screen.getByText('Nodes').closest('a');
    expect(nodesLink).toHaveClass('c-active');
  });
});


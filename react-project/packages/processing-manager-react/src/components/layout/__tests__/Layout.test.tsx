/**
 * Layout Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../Layout';
import { useProcessingStore } from '../../../stores/processingStore';
import { useAppStore } from '../../../stores/appStore';

// Mock the child components
vi.mock('../Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

// Mock the external stores
vi.mock('@cyoda/ui-lib-react', () => ({
  useAuthStore: (selector?: any) => {
    const state = { logout: vi.fn() };
    return selector ? selector(state) : state.logout;
  },
  useUserManagerStore: (selector?: any) => {
    const state = { user: { email: 'test@example.com' } };
    return selector ? selector(state) : state.user;
  },
  LogOutButton: ({ onLogout, buttonText }: any) => (
    <button onClick={() => onLogout(false)} data-testid="logout-button">
      {buttonText || 'Logout'}
    </button>
  ),
}));

const renderWithRouter = (
  component: React.ReactElement,
  initialRoute = '/',
  routePath = '/'
) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path={routePath} element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Layout', () => {
  beforeEach(() => {
    // Reset stores before each test
    useProcessingStore.getState().reset();
    useAppStore.getState().reset();
  });

  it('should render all layout components', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for main layout classes
    expect(container.querySelector('.c-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.c-body')).toBeInTheDocument();
    expect(container.querySelector('.c-main')).toBeInTheDocument();
    expect(container.querySelector('.container-fluid')).toBeInTheDocument();
    expect(container.querySelector('.fade-in')).toBeInTheDocument();
  });

  it('should set baseUrl when route param matches a node', () => {
    const mockNodes = [
      { hostname: 'node-01', baseUrl: 'http://node-01:8080', grafana: null },
      { hostname: 'node-02', baseUrl: 'http://node-02:8080', grafana: null },
    ];

    // Set nodes in the store
    useProcessingStore.setState({ nodes: mockNodes });

    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      '/processing-ui/nodes/node-01',
      '/processing-ui/nodes/:name'
    );

    // Check that baseUrl was set
    const baseUrl = useAppStore.getState().baseUrl;
    expect(baseUrl).toBe('http://node-01:8080');
  });

  it('should not set baseUrl when route param does not match any node', () => {
    const mockNodes = [
      { hostname: 'node-01', baseUrl: 'http://node-01:8080', grafana: null },
      { hostname: 'node-02', baseUrl: 'http://node-02:8080', grafana: null },
    ];

    // Set nodes in the store
    useProcessingStore.setState({ nodes: mockNodes });

    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      '/processing-ui/nodes/node-99',
      '/processing-ui/nodes/:name'
    );

    // Check that baseUrl was not set (should be empty string from initial state)
    const baseUrl = useAppStore.getState().baseUrl;
    expect(baseUrl).toBe('');
  });

  it('should not set baseUrl when there are no nodes', () => {
    // Ensure nodes array is empty
    useProcessingStore.setState({ nodes: [] });

    // Ensure baseUrl is reset
    useAppStore.setState({ baseUrl: '' });

    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      '/processing-ui/nodes/node-01',
      '/processing-ui/nodes/:name'
    );

    // Check that baseUrl was not set
    const baseUrl = useAppStore.getState().baseUrl;
    expect(baseUrl).toBe('');
  });

  it('should not set baseUrl when there is no route param', () => {
    const mockNodes = [
      { hostname: 'node-01', baseUrl: 'http://node-01:8080', grafana: null },
    ];

    // Set nodes in the store
    useProcessingStore.setState({ nodes: mockNodes });

    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      '/processing-ui',
      '/processing-ui'
    );

    // Check that baseUrl was not set
    const baseUrl = useAppStore.getState().baseUrl;
    expect(baseUrl).toBe('');
  });

  it('should render multiple children', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </Layout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });
});


/**
 * Tests for PmComponentsServiceProcessesView Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PmComponentsServiceProcessesView } from '../PmComponentsServiceProcessesView';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useLoadServiceProcessesStats: vi.fn(),
}));

// Mock child components
vi.mock('../PmComponentsServiceProcessesViewReady', () => ({
  PmComponentsServiceProcessesViewReady: ({ tableData, className }: any) => (
    <div data-testid="ready-component" className={className}>
      Ready Component - {tableData.length} items
    </div>
  ),
}));

vi.mock('../PmComponentsServiceProcessesViewNoneReady', () => ({
  PmComponentsServiceProcessesViewNoneReady: ({ tableData, className }: any) => (
    <div data-testid="none-ready-component" className={className}>
      None Ready Component - {tableData.length} items
    </div>
  ),
}));

const mockReadyData = [
  { id: 1, name: 'Service 1', status: 'ready' },
  { id: 2, name: 'Service 2', status: 'ready' },
];

const mockNoneReadyData = [
  { id: 3, name: 'Service 3', status: 'not-ready' },
];

describe('PmComponentsServiceProcessesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {
        data: {
          ready: mockReadyData,
          noneReady: mockNoneReadyData,
        },
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByTestId('ready-component')).toBeInTheDocument();
    expect(screen.getByTestId('none-ready-component')).toBeInTheDocument();
  });

  it('should render Ready component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    const readyComponent = screen.getByTestId('ready-component');
    expect(readyComponent).toBeInTheDocument();
  });

  it('should render None Ready component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    const noneReadyComponent = screen.getByTestId('none-ready-component');
    expect(noneReadyComponent).toBeInTheDocument();
  });

  it('should pass ready data to Ready component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/Ready Component - 2 items/)).toBeInTheDocument();
  });

  it('should pass noneReady data to None Ready component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/None Ready Component - 1 items/)).toBeInTheDocument();
  });

  it('should render Divider between components', () => {
    const { container } = render(<PmComponentsServiceProcessesView />);
    
    const divider = container.querySelector('.ant-divider');
    expect(divider).toBeInTheDocument();
  });

  it('should have delimiter class on Divider', () => {
    const { container } = render(<PmComponentsServiceProcessesView />);
    
    const divider = container.querySelector('.delimiter');
    expect(divider).toBeInTheDocument();
  });

  it('should pass ready className to Ready component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    const readyComponent = screen.getByTestId('ready-component');
    expect(readyComponent).toHaveClass('ready');
  });

  it('should pass not-ready className to None Ready component', () => {
    render(<PmComponentsServiceProcessesView />);
    
    const noneReadyComponent = screen.getByTestId('none-ready-component');
    expect(noneReadyComponent).toHaveClass('not-ready');
  });

  it('should handle empty ready data', () => {
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {
        data: {
          ready: [],
          noneReady: mockNoneReadyData,
        },
      },
    } as any);

    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/Ready Component - 0 items/)).toBeInTheDocument();
  });

  it('should handle empty noneReady data', () => {
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {
        data: {
          ready: mockReadyData,
          noneReady: [],
        },
      },
    } as any);

    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/None Ready Component - 0 items/)).toBeInTheDocument();
  });

  it('should handle missing data', () => {
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: null,
    } as any);

    render(<PmComponentsServiceProcessesView />);

    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Ready Component - 0 items';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'None Ready Component - 0 items';
    })).toBeInTheDocument();
  });

  it('should handle missing data.data', () => {
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {},
    } as any);

    render(<PmComponentsServiceProcessesView />);

    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Ready Component - 0 items';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'None Ready Component - 0 items';
    })).toBeInTheDocument();
  });

  it('should handle missing ready field', () => {
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {
        data: {
          noneReady: mockNoneReadyData,
        },
      },
    } as any);

    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/Ready Component - 0 items/)).toBeInTheDocument();
  });

  it('should handle missing noneReady field', () => {
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {
        data: {
          ready: mockReadyData,
        },
      },
    } as any);

    render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/None Ready Component - 0 items/)).toBeInTheDocument();
  });

  it('should use useLoadServiceProcessesStats hook', () => {
    render(<PmComponentsServiceProcessesView />);
    
    expect(hooks.useLoadServiceProcessesStats).toHaveBeenCalled();
  });

  it('should update when data changes', () => {
    const { rerender } = render(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/Ready Component - 2 items/)).toBeInTheDocument();
    
    vi.mocked(hooks.useLoadServiceProcessesStats).mockReturnValue({
      data: {
        data: {
          ready: [...mockReadyData, { id: 4, name: 'Service 4', status: 'ready' }],
          noneReady: mockNoneReadyData,
        },
      },
    } as any);
    
    rerender(<PmComponentsServiceProcessesView />);
    
    expect(screen.getByText(/Ready Component - 3 items/)).toBeInTheDocument();
  });
});


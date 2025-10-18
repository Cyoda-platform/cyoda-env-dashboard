/**
 * Tests for Tasks Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tasks } from './Tasks';
import * as useTasks from '../hooks/useTasks';

// Mock components
vi.mock('../components/TasksFilter', () => ({
  TasksFilter: ({ onChangeFilter }: any) => (
    <div data-testid="tasks-filter">
      <button onClick={() => onChangeFilter({ status: 'open' })}>Apply Filter</button>
    </div>
  ),
}));

vi.mock('../components/TasksGrid', () => ({
  TasksGrid: ({ isApplyRealData, filter }: any) => (
    <div data-testid="tasks-grid">
      <div>Real Data: {isApplyRealData ? 'Yes' : 'No'}</div>
      <div>Filter: {JSON.stringify(filter)}</div>
    </div>
  ),
}));

// Mock hooks
vi.mock('../hooks/useTasks', () => ({
  useTasksState: vi.fn(),
}));

describe('Tasks Page', () => {
  const mockSetIsApplyRealData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTasks.useTasksState).mockReturnValue({
      isApplyRealData: false,
      setIsApplyRealData: mockSetIsApplyRealData,
      readedIds: [],
      addReadedId: vi.fn(),
      removeReadedId: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the page', () => {
      render(<Tasks />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render TasksFilter component', () => {
      render(<Tasks />);

      expect(screen.getByTestId('tasks-filter')).toBeInTheDocument();
    });

    it('should render TasksGrid component', () => {
      render(<Tasks />);

      expect(screen.getByTestId('tasks-grid')).toBeInTheDocument();
    });

    it('should render Subscribe button when not subscribed', () => {
      render(<Tasks />);

      expect(screen.getByRole('button', { name: /Subscribe to live data/i })).toBeInTheDocument();
    });

    it('should render Unsubscribe button when subscribed', () => {
      vi.mocked(useTasks.useTasksState).mockReturnValue({
        isApplyRealData: true,
        setIsApplyRealData: mockSetIsApplyRealData,
        readedIds: [],
        addReadedId: vi.fn(),
        removeReadedId: vi.fn(),
      });

      render(<Tasks />);

      expect(screen.getByRole('button', { name: /Unsubscribe to live data/i })).toBeInTheDocument();
    });

    it('should display correct icon for Subscribe button', () => {
      const { container } = render(<Tasks />);

      const button = screen.getByRole('button', { name: /Subscribe to live data/i });
      expect(button.querySelector('.anticon-api')).not.toBeNull();
    });

    it('should display correct icon for Unsubscribe button', () => {
      vi.mocked(useTasks.useTasksState).mockReturnValue({
        isApplyRealData: true,
        setIsApplyRealData: mockSetIsApplyRealData,
        readedIds: [],
        addReadedId: vi.fn(),
        removeReadedId: vi.fn(),
      });

      const { container } = render(<Tasks />);

      const button = screen.getByRole('button', { name: /Unsubscribe to live data/i });
      expect(button.querySelector('.anticon-close')).not.toBeNull();
    });
  });

  describe('Live Data Subscription', () => {
    it('should toggle subscription when Subscribe button is clicked', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const subscribeButton = screen.getByRole('button', { name: /Subscribe to live data/i });
      await user.click(subscribeButton);

      expect(mockSetIsApplyRealData).toHaveBeenCalledWith(true);
    });

    it('should toggle subscription when Unsubscribe button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(useTasks.useTasksState).mockReturnValue({
        isApplyRealData: true,
        setIsApplyRealData: mockSetIsApplyRealData,
        readedIds: [],
        addReadedId: vi.fn(),
        removeReadedId: vi.fn(),
      });

      render(<Tasks />);

      const unsubscribeButton = screen.getByRole('button', { name: /Unsubscribe to live data/i });
      await user.click(unsubscribeButton);

      expect(mockSetIsApplyRealData).toHaveBeenCalledWith(false);
    });

    it('should pass isApplyRealData to TasksGrid', () => {
      render(<Tasks />);

      expect(screen.getByText('Real Data: No')).toBeInTheDocument();
    });

    it('should pass isApplyRealData=true to TasksGrid when subscribed', () => {
      vi.mocked(useTasks.useTasksState).mockReturnValue({
        isApplyRealData: true,
        setIsApplyRealData: mockSetIsApplyRealData,
        readedIds: [],
        addReadedId: vi.fn(),
        removeReadedId: vi.fn(),
      });

      render(<Tasks />);

      expect(screen.getByText('Real Data: Yes')).toBeInTheDocument();
    });
  });

  describe('Filter Handling', () => {
    it('should pass empty filter to TasksGrid initially', () => {
      render(<Tasks />);

      expect(screen.getByText('Filter: {}')).toBeInTheDocument();
    });

    it('should update filter when TasksFilter changes', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const applyFilterButton = screen.getByRole('button', { name: /Apply Filter/i });
      await user.click(applyFilterButton);

      expect(screen.getByText(/Filter:.*status.*open/)).toBeInTheDocument();
    });

    it('should pass updated filter to TasksGrid', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const applyFilterButton = screen.getByRole('button', { name: /Apply Filter/i });
      await user.click(applyFilterButton);

      expect(screen.getByText('Filter: {"status":"open"}')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render Card component', () => {
      const { container } = render(<Tasks />);

      const card = container.querySelector('.ant-card');
      expect(card).not.toBeNull();
    });

    it('should have actions section with flex layout', () => {
      const { container } = render(<Tasks />);

      const actions = container.querySelector('.actions');
      expect(actions).not.toBeNull();
    });

    it('should display Filters heading', () => {
      render(<Tasks />);

      expect(screen.getByRole('heading', { name: /Filters/i })).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should render Subscribe button with primary type', () => {
      const { container } = render(<Tasks />);

      const button = screen.getByRole('button', { name: /Subscribe to live data/i });
      expect(button.classList.contains('ant-btn-primary')).toBe(true);
    });

    it('should render Unsubscribe button with danger type', () => {
      vi.mocked(useTasks.useTasksState).mockReturnValue({
        isApplyRealData: true,
        setIsApplyRealData: mockSetIsApplyRealData,
        readedIds: [],
        addReadedId: vi.fn(),
        removeReadedId: vi.fn(),
      });

      const { container } = render(<Tasks />);

      const button = screen.getByRole('button', { name: /Unsubscribe to live data/i });
      expect(button.classList.contains('ant-btn-dangerous')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple filter changes', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const applyFilterButton = screen.getByRole('button', { name: /Apply Filter/i });
      
      await user.click(applyFilterButton);
      expect(screen.getByText('Filter: {"status":"open"}')).toBeInTheDocument();

      await user.click(applyFilterButton);
      expect(screen.getByText('Filter: {"status":"open"}')).toBeInTheDocument();
    });

    it('should handle rapid subscription toggles', async () => {
      const user = userEvent.setup();
      render(<Tasks />);

      const subscribeButton = screen.getByRole('button', { name: /Subscribe to live data/i });
      
      await user.click(subscribeButton);
      await user.click(subscribeButton);
      await user.click(subscribeButton);

      expect(mockSetIsApplyRealData).toHaveBeenCalledTimes(3);
    });
  });
});


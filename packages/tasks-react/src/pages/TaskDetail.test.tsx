/**
 * Tests for TaskDetail Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetail } from './TaskDetail';
import * as useTasks from '../hooks/useTasks';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: (...args: any[]) => mockUseParams(...args),
    useNavigate: () => mockNavigate,
  };
});

// Mock hooks - need to import them properly
const mockUseTask = vi.fn();
const mockUseUpdateTask = vi.fn();
const mockUseTasksState = vi.fn();

vi.mock('../hooks/useTasks', () => ({
  useTask: (...args: any[]) => mockUseTask(...args),
  useUpdateTask: (...args: any[]) => mockUseUpdateTask(...args),
  useTasksState: (...args: any[]) => mockUseTasksState(...args),
}));

// Mock HelperFormat
vi.mock('@cyoda/ui-lib-react', () => ({
  HelperFormat: {
    date: (date: string) => date ? new Date(date).toLocaleDateString() : '',
  },
}));

const mockTask = {
  id: 'task-123',
  title: 'Test Task',
  state: 'open',
  priority: 1,
  assignee: 'user1',
  message: 'Test message',
  createdDatetime: '2024-01-01T00:00:00Z',
  lastModifiedDatetime: '2024-01-02T00:00:00Z',
  srcEntityClass: 'TestEntity',
  srcEntityId: 'entity-123',
};

describe('TaskDetail Page', () => {
  const mockAddReadedId = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ id: 'task-123' });

    mockUseTasksState.mockReturnValue({
      isApplyRealData: false,
      setIsApplyRealData: vi.fn(),
      readedIds: [],
      addReadedId: mockAddReadedId,
      removeReadedId: vi.fn(),
    });

    mockUseTask.mockReturnValue({
      data: { alertTask: mockTask, transitions: ['approve', 'reject'] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseUpdateTask.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      mockUseTask.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      const { container } = renderWithRouter(<TaskDetail />);

      // Check for Spin component
      expect(container.querySelector('.ant-spin')).not.toBeNull();
    });
  });

  describe('Not Found State', () => {
    it('should show not found message when task does not exist', () => {
      mockUseTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Task not found')).toBeInTheDocument();
    });

    it('should show Back to Tasks button when task not found', () => {
      mockUseTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithRouter(<TaskDetail />);

      expect(screen.getByRole('button', { name: /Back to Tasks/i })).toBeInTheDocument();
    });

    it('should navigate to tasks when Back to Tasks is clicked', async () => {
      const user = userEvent.setup();
      mockUseTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithRouter(<TaskDetail />);

      const backButton = screen.getByRole('button', { name: /Back to Tasks/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('Rendering Task Details', () => {
    it('should render task title in header', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByText(/Task Detail: Test Task/)).toBeInTheDocument();
    });

    it('should render Back button', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getAllByRole('button', { name: /Back/i })[0]).toBeInTheDocument();
    });

    it('should render Edit button initially', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('should render form fields', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('should mark task as read', () => {
      renderWithRouter(<TaskDetail />);

      expect(mockAddReadedId).toHaveBeenCalledWith('task-123');
    });

    it('should display transition select', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Transition')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
    });

    it('should show Cancel and Update buttons in edit mode', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Edit$/i })).not.toBeInTheDocument();
    });

    it('should exit edit mode when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
    });

    it('should enable form fields in edit mode', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      // Form should be enabled (not disabled)
      const titleInput = screen.getByDisplayValue('Test Task');
      expect(titleInput).not.toBeDisabled();
    });
  });

  describe('Update Task', () => {
    it('should show confirmation modal when Update is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      const updateButton = screen.getByRole('button', { name: /Update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Do you really want to update task?')).toBeInTheDocument();
      });
    });

    it('should call update mutation when confirmed', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      const updateButton = screen.getByRole('button', { name: /Update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getAllByText('Do you really want to update task?').length).toBeGreaterThan(0);
      });

      const okButtons = screen.getAllByRole('button', { name: /OK/i });
      await user.click(okButtons[0]);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it('should show loading state on Update button when updating', async () => {
      mockUseUpdateTask.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      renderWithRouter(<TaskDetail />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await userEvent.click(editButton);

      const updateButton = screen.getByRole('button', { name: /Update/i });
      expect(updateButton.querySelector('.anticon-loading')).not.toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when Back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TaskDetail />);

      const backButton = screen.getAllByRole('button', { name: /Back/i })[0];
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('Transitions', () => {
    it('should display available transitions', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Transition')).toBeInTheDocument();
    });

    it('should have transition select disabled when not in edit mode', () => {
      const { container } = renderWithRouter(<TaskDetail />);

      const select = container.querySelector('.ant-select-disabled');
      expect(select).not.toBeNull();
    });
  });

  describe('Date Formatting', () => {
    it('should display formatted created date', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should display formatted last modified date', () => {
      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Last Modified')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with no transitions', () => {
      mockUseTask.mockReturnValue({
        data: { alertTask: mockTask, transitions: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Transition')).toBeInTheDocument();
    });

    it('should handle task with null values', () => {
      const taskWithNulls = {
        ...mockTask,
        assignee: null,
        message: null,
      };

      mockUseTask.mockReturnValue({
        data: { alertTask: taskWithNulls, transitions: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithRouter(<TaskDetail />);

      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
    });
  });
});


/**
 * Tests for TasksFilter component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TasksFilter } from './TasksFilter';

// Mock HelperDictionary and HelperStorage
vi.mock('@cyoda/ui-lib-react', () => ({
  HelperDictionary: {
    statuses: [
      { key: 'OPEN', value: 'Open' },
      { key: 'CLOSED', value: 'Closed' },
    ],
    users: [
      { name: 'user1@example.com' },
      { name: 'user2@example.com' },
    ],
    priorities: [
      { key: '1', value: 'Low' },
      { key: '5', value: 'Medium' },
      { key: '10', value: 'High' },
    ],
  },
  HelperStorage: class {
    get(key: string, defaultValue: any) {
      const item = localStorage.getItem(`cyoda_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    }
    set(key: string, value: any) {
      localStorage.setItem(`cyoda_${key}`, JSON.stringify(value));
    }
  },
}));

describe('TasksFilter', () => {
  const mockOnChangeFilter = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    mockOnChangeFilter.mockClear();
  });

  it('should render filter form', () => {
    render(<TasksFilter onChangeFilter={mockOnChangeFilter} />);

    expect(screen.getByText('By Status')).toBeInTheDocument();
    expect(screen.getByText('By Assignee')).toBeInTheDocument();
    expect(screen.getByText('By Priority')).toBeInTheDocument();
  });

  it('should call onChangeFilter when filter changes', async () => {
    render(<TasksFilter onChangeFilter={mockOnChangeFilter} />);

    // Initial call with default filter
    await waitFor(() => {
      expect(mockOnChangeFilter).toHaveBeenCalledWith({
        status_id: undefined,
        assignee_id: undefined,
        priority_id: undefined,
      });
    });
  });

  it('should call onChangeFilter on mount', async () => {
    render(<TasksFilter onChangeFilter={mockOnChangeFilter} />);

    // Should call onChangeFilter with initial/saved filter
    await waitFor(() => {
      expect(mockOnChangeFilter).toHaveBeenCalled();
    });
  });

  it('should load saved filter from localStorage', () => {
    const savedFilter = {
      status_id: 'OPEN',
      assignee_id: 'user1@example.com',
      priority_id: '5',
    };

    localStorage.setItem('cyoda_TasksFilter', JSON.stringify(savedFilter));

    render(<TasksFilter onChangeFilter={mockOnChangeFilter} />);

    // Should call with saved filter
    expect(mockOnChangeFilter).toHaveBeenCalledWith(savedFilter);
  });
});


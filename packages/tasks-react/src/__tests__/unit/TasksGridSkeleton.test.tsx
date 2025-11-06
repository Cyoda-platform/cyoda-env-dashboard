/**
 * Unit Tests: TasksGridSkeleton Component
 * Tests skeleton loading state for tasks grid
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TasksGridSkeleton } from '../../components/TasksGridSkeleton';

describe('TasksGridSkeleton', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<TasksGridSkeleton />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<TasksGridSkeleton />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading tasks');
    });

    it('should render "Tasks" heading', () => {
      render(<TasksGridSkeleton />);
      
      const heading = screen.getByRole('heading', { name: /tasks/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Table Structure', () => {
    it('should render table component', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const table = container.querySelector('.ant-table');
      expect(table).toBeInTheDocument();
    });

    it('should render table with skeleton rows', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      // Should have 5 skeleton rows
      const rows = container.querySelectorAll('.ant-table-tbody tr');
      expect(rows.length).toBe(5);
    });

    it('should render all column headers', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      // Should have columns: Title, Status, Priority, Assigned To, Created, Operations
      const headers = container.querySelectorAll('.ant-table-thead th');
      expect(headers.length).toBe(6);
    });
  });

  describe('Skeleton Elements', () => {
    it('should render skeleton inputs for text columns', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const skeletonInputs = container.querySelectorAll('.ant-skeleton-input');
      expect(skeletonInputs.length).toBeGreaterThan(0);
    });

    it('should render skeleton buttons for operations column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const skeletonButtons = container.querySelectorAll('.ant-skeleton-button');
      expect(skeletonButtons.length).toBeGreaterThan(0);
    });

    it('should render active skeletons', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      // All skeletons should be active (animated)
      const activeSkeletons = container.querySelectorAll('.ant-skeleton-active');
      expect(activeSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination Skeleton', () => {
    it('should render pagination skeleton', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      // Should have skeleton button for pagination
      const paginationSkeleton = container.querySelectorAll('.ant-skeleton-button');
      expect(paginationSkeleton.length).toBeGreaterThan(0);
    });

    it('should render pagination skeleton at the right', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      // Find the div with text-align: right
      const paginationContainer = Array.from(container.querySelectorAll('div')).find(
        (div) => div.style.textAlign === 'right'
      );
      expect(paginationContainer).toBeInTheDocument();
    });
  });

  describe('Column Definitions', () => {
    it('should have Title column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const titleHeader = Array.from(container.querySelectorAll('.ant-table-thead th')).find(
        (th) => th.textContent === 'Title'
      );
      expect(titleHeader).toBeInTheDocument();
    });

    it('should have Status column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const statusHeader = Array.from(container.querySelectorAll('.ant-table-thead th')).find(
        (th) => th.textContent === 'Status'
      );
      expect(statusHeader).toBeInTheDocument();
    });

    it('should have Priority column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const priorityHeader = Array.from(container.querySelectorAll('.ant-table-thead th')).find(
        (th) => th.textContent === 'Priority'
      );
      expect(priorityHeader).toBeInTheDocument();
    });

    it('should have Assigned To column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const assigneeHeader = Array.from(container.querySelectorAll('.ant-table-thead th')).find(
        (th) => th.textContent === 'Assigned To'
      );
      expect(assigneeHeader).toBeInTheDocument();
    });

    it('should have Created column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const createdHeader = Array.from(container.querySelectorAll('.ant-table-thead th')).find(
        (th) => th.textContent === 'Created'
      );
      expect(createdHeader).toBeInTheDocument();
    });

    it('should have Operations column', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const operationsHeader = Array.from(container.querySelectorAll('.ant-table-thead th')).find(
        (th) => th.textContent === 'Operations'
      );
      expect(operationsHeader).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<TasksGridSkeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('should announce loading state', () => {
      render(<TasksGridSkeleton />);
      
      const skeleton = screen.getByLabelText('Loading tasks');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have polite aria-live region', () => {
      render(<TasksGridSkeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Visual Structure', () => {
    it('should have tasks-grid class', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const grid = container.querySelector('.tasks-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have wrap-table class', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const wrapTable = container.querySelector('.wrap-table');
      expect(wrapTable).toBeInTheDocument();
    });

    it('should have proper spacing for pagination', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const paginationContainer = Array.from(container.querySelectorAll('div')).find(
        (div) => div.style.marginTop === '16px'
      );
      expect(paginationContainer).toBeInTheDocument();
    });
  });

  describe('Data Structure', () => {
    it('should render exactly 5 skeleton rows', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      const rows = container.querySelectorAll('.ant-table-tbody tr');
      expect(rows.length).toBe(5);
    });

    it('should not show pagination controls', () => {
      const { container } = render(<TasksGridSkeleton />);
      
      // Table should have pagination={false}
      const pagination = container.querySelector('.ant-pagination');
      expect(pagination).not.toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<TasksGridSkeleton />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});


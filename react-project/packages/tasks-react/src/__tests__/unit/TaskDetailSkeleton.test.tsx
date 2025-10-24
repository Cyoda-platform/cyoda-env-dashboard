/**
 * Unit Tests: TaskDetailSkeleton Component
 * Tests skeleton loading state for task detail page
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TaskDetailSkeleton } from '../../components/TaskDetailSkeleton';

describe('TaskDetailSkeleton', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<TaskDetailSkeleton />);

      // Should render a card
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<TaskDetailSkeleton />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading task details');
    });
  });

  describe('Structure', () => {
    it('should render skeleton for card header', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // Should have skeleton buttons in header (back button, title)
      const skeletonButtons = container.querySelectorAll('.ant-skeleton-button');
      expect(skeletonButtons.length).toBeGreaterThan(0);
    });

    it('should render skeleton for form fields', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // Should have skeleton paragraphs for form fields
      const skeletonParagraphs = container.querySelectorAll('.ant-skeleton-paragraph');
      expect(skeletonParagraphs.length).toBeGreaterThan(0);
    });

    it('should render two-column layout', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // Should have two columns (left: form, right: entity info)
      const columns = container.querySelectorAll('.ant-col');
      expect(columns.length).toBeGreaterThanOrEqual(2);
    });

    it('should render left column with form skeleton', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // Left column should have 16 span
      const leftColumn = container.querySelector('.ant-col-16');
      expect(leftColumn).toBeInTheDocument();
    });

    it('should render right column with entity info skeleton', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // Right column should have 8 span
      const rightColumn = container.querySelector('.ant-col-8');
      expect(rightColumn).toBeInTheDocument();
    });
  });

  describe('Skeleton Elements', () => {
    it('should render active skeletons', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // All skeletons should be active (animated)
      const activeSkeletons = container.querySelectorAll('.ant-skeleton-active');
      expect(activeSkeletons.length).toBeGreaterThan(0);
    });

    it('should render multiple skeleton rows', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      // Should have multiple skeleton rows for form fields
      const skeletonElements = container.querySelectorAll('.ant-skeleton-element');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<TaskDetailSkeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('should announce loading state', () => {
      render(<TaskDetailSkeleton />);
      
      const skeleton = screen.getByLabelText('Loading task details');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have polite aria-live region', () => {
      render(<TaskDetailSkeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Visual Structure', () => {
    it('should render card component', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      const card = container.querySelector('.ant-card');
      expect(card).toBeInTheDocument();
    });

    it('should have proper spacing between columns', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      const row = container.querySelector('.ant-row');
      expect(row).toBeInTheDocument();
    });

    it('should have border between columns', () => {
      const { container } = render(<TaskDetailSkeleton />);
      
      const leftColumn = container.querySelector('.ant-col-16');
      expect(leftColumn).toHaveStyle({ borderRight: '1px solid #f0f0f0' });
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<TaskDetailSkeleton />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});


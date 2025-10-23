/**
 * StateIndicator Component Tests
 * Tests for visual state indicator component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StateIndicator } from './StateIndicator';

describe('StateIndicator', () => {
  describe('Default Type', () => {
    it('should render with active state (green badge)', () => {
      const { container } = render(<StateIndicator state={true} />);

      const badge = container.querySelector('.ant-badge-status-success');
      expect(badge).toBeInTheDocument();
    });

    it('should render with inactive state (gray badge)', () => {
      const { container } = render(<StateIndicator state={false} />);

      const badge = container.querySelector('.ant-badge-status-default');
      expect(badge).toBeInTheDocument();
    });

    it('should not show text by default', () => {
      const { container } = render(<StateIndicator state={true} />);

      expect(container.textContent).toBe('');
    });

    it('should show "Yes" text when showText is true and state is active', () => {
      render(<StateIndicator state={true} showText={true} />);

      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should show "No" text when showText is true and state is inactive', () => {
      render(<StateIndicator state={false} showText={true} />);

      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(<StateIndicator state={true} />);

      const indicator = container.querySelector('.state-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Automated Type', () => {
    it('should render automated indicator with active state', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge.active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('A');
    });

    it('should render automated indicator with inactive state', () => {
      const { container } = render(<StateIndicator state={false} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge.inactive');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('A');
    });

    it('should have green background when active', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge.active');
      expect(badge).toHaveClass('active');
    });

    it('should have gray background when inactive', () => {
      const { container } = render(<StateIndicator state={false} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge.inactive');
      expect(badge).toHaveClass('inactive');
    });

    it('should always show "A" letter', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge');
      expect(badge).toHaveTextContent('A');
    });

    it('should have correct CSS class', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);

      const indicator = container.querySelector('.state-indicator-automated');
      expect(indicator).toBeInTheDocument();
    });

    it('should ignore showText prop for automated type', () => {
      const { container } = render(
        <StateIndicator state={true} type="automated" showText={true} />
      );

      // Should only show "A", not "Yes"
      expect(container.textContent).toBe('A');
      expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('should handle state=true, type=default, showText=false', () => {
      const { container } = render(
        <StateIndicator state={true} type="default" showText={false} />
      );

      const badge = container.querySelector('.ant-badge-status-success');
      expect(badge).toBeInTheDocument();
      expect(container.textContent).toBe('');
    });

    it('should handle state=false, type=default, showText=true', () => {
      render(<StateIndicator state={false} type="default" showText={true} />);

      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should handle state=true, type=automated', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge.active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('A');
    });

    it('should handle state=false, type=automated', () => {
      const { container } = render(<StateIndicator state={false} type="automated" />);

      const badge = container.querySelector('.state-indicator-automated-badge.inactive');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('A');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with default type', () => {
      const { container } = render(<StateIndicator state={true} />);

      const indicator = container.querySelector('.state-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should be accessible with automated type', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);

      const indicator = container.querySelector('.state-indicator-automated');
      expect(indicator).toBeInTheDocument();
    });

    it('should have readable text when showText is enabled', () => {
      render(<StateIndicator state={true} showText={true} />);

      const text = screen.getByText('Yes');
      expect(text).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined type (defaults to default)', () => {
      const { container } = render(<StateIndicator state={true} type={undefined} />);

      const badge = container.querySelector('.ant-badge-status-success');
      expect(badge).toBeInTheDocument();
    });

    it('should handle undefined showText (defaults to false)', () => {
      const { container } = render(<StateIndicator state={true} showText={undefined} />);

      expect(container.textContent).toBe('');
    });

    it('should render correctly when state changes from true to false', () => {
      const { container, rerender } = render(<StateIndicator state={true} />);

      let badge = container.querySelector('.ant-badge-status-success');
      expect(badge).toBeInTheDocument();

      rerender(<StateIndicator state={false} />);

      badge = container.querySelector('.ant-badge-status-default');
      expect(badge).toBeInTheDocument();
    });

    it('should render correctly when type changes from default to automated', () => {
      const { container, rerender } = render(<StateIndicator state={true} type="default" />);

      let badge = container.querySelector('.ant-badge-status-success');
      expect(badge).toBeInTheDocument();

      rerender(<StateIndicator state={true} type="automated" />);

      badge = container.querySelector('.state-indicator-automated-badge.active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('A');
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for active default state', () => {
      const { container } = render(<StateIndicator state={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for inactive default state', () => {
      const { container } = render(<StateIndicator state={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for active automated state', () => {
      const { container } = render(<StateIndicator state={true} type="automated" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for inactive automated state', () => {
      const { container } = render(<StateIndicator state={false} type="automated" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with text shown', () => {
      const { container } = render(<StateIndicator state={true} showText={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});


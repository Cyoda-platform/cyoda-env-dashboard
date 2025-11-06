/**
 * GrafanaChartResetButton Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GrafanaChartResetButton from '../GrafanaChartResetButton';

describe('GrafanaChartResetButton', () => {
  it('should render reset button', () => {
    render(<GrafanaChartResetButton />);

    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toBeInTheDocument();
  });

  it('should have sync icon', () => {
    const { container } = render(<GrafanaChartResetButton />);

    const icon = container.querySelector('.anticon-sync');
    expect(icon).toBeInTheDocument();
  });

  it('should dispatch reset event on click', async () => {
    const user = userEvent.setup();
    const eventListener = vi.fn();
    window.addEventListener('grafana:chart:reset', eventListener);

    render(<GrafanaChartResetButton />);

    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);

    expect(eventListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('grafana:chart:reset', eventListener);
  });

  it('should show loading state after click', async () => {
    const user = userEvent.setup();
    render(<GrafanaChartResetButton />);

    const button = screen.getByRole('button', { name: /reset/i });
    await user.click(button);

    // Button should have loading class
    expect(button).toHaveClass('ant-btn-loading');
  });

  it('should have correct button type', () => {
    render(<GrafanaChartResetButton />);

    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toHaveClass('ant-btn-primary');
  });

  it('should render inside actions div', () => {
    const { container } = render(<GrafanaChartResetButton />);

    const actionsDiv = container.querySelector('.actions');
    expect(actionsDiv).toBeInTheDocument();
    expect(actionsDiv?.querySelector('button')).toBeInTheDocument();
  });
});


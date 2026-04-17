import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { DeleteWorkflowDialog } from './DeleteWorkflowDialog';

function renderWithApp(node: React.ReactNode) {
  return render(<App>{node}</App>);
}

const baseProps = {
  open: true,
  targetName: 'DeleteMe',
  keptNames: ['Premium', 'Standard'],
  snapshotAt: new Date('2026-04-16T15:30:45.000Z'),
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  onRefresh: vi.fn(),
};

describe('DeleteWorkflowDialog', () => {
  beforeEach(() => {
    baseProps.onConfirm = vi.fn();
    baseProps.onCancel = vi.fn();
    baseProps.onRefresh = vi.fn();
  });

  it('does not render when closed', () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} open={false} />);
    expect(screen.queryByText(/delete workflow/i)).not.toBeInTheDocument();
  });

  it('renders the target name, the kept list, and the snapshot timestamp when open', () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} />);

    // Title or body mentions the target.
    expect(screen.getAllByText(/DeleteMe/).length).toBeGreaterThan(0);

    // Kept-list shows both kept workflows.
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();

    // Snapshot timestamp is rendered (HH:MM:SS format).
    expect(screen.getByText(/15:30:45/)).toBeInTheDocument();
  });
});

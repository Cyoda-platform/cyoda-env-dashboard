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

  it('disables the destructive button until the user types the exact target name', async () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} />);

    const button = screen.getByRole('button', { name: /^Delete DeleteMe$/ });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/confirm name/i), 'DeleteMe');

    expect(button).toBeEnabled();
  });

  it('keeps the destructive button disabled if the typed name is wrong', async () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} />);
    const button = screen.getByRole('button', { name: /^Delete DeleteMe$/ });

    await userEvent.type(screen.getByLabelText(/confirm name/i), 'Wrong');

    expect(button).toBeDisabled();
  });

  it('invokes onConfirm when the button is clicked after correct name is typed', async () => {
    const onConfirm = vi.fn();
    renderWithApp(<DeleteWorkflowDialog {...baseProps} onConfirm={onConfirm} />);

    await userEvent.type(screen.getByLabelText(/confirm name/i), 'DeleteMe');
    await userEvent.click(screen.getByRole('button', { name: /^Delete DeleteMe$/ }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('invokes onRefresh when the Refresh button is clicked', async () => {
    const onRefresh = vi.fn();
    renderWithApp(<DeleteWorkflowDialog {...baseProps} onRefresh={onRefresh} />);

    await userEvent.click(screen.getByRole('button', { name: /refresh snapshot/i }));

    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('invokes onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    renderWithApp(<DeleteWorkflowDialog {...baseProps} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('resets the typed name when reopened', async () => {
    const { rerender } = renderWithApp(<DeleteWorkflowDialog {...baseProps} />);
    await userEvent.type(screen.getByLabelText(/confirm name/i), 'DeleteMe');

    rerender(<App><DeleteWorkflowDialog {...baseProps} open={false} /></App>);
    rerender(<App><DeleteWorkflowDialog {...baseProps} open={true} /></App>);

    expect(screen.getByLabelText(/confirm name/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /^Delete DeleteMe$/ })).toBeDisabled();
  });
});

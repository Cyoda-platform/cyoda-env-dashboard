import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { WorkflowsTable } from './WorkflowsTable';
import type { WorkflowSummary } from '../../gateways';

function renderWithApp(node: React.ReactNode) {
  return render(<App>{node}</App>);
}

const sampleSummaries: WorkflowSummary[] = [
  { name: 'Premium', desc: 'Premium customers', active: true, initialState: 'draft' },
  { name: 'Standard', desc: undefined, active: false, initialState: 'pending' },
];

const baseProps = {
  workflows: sampleSummaries,
  loading: false,
  onEdit: vi.fn(),
  onDuplicate: vi.fn(),
  onRename: vi.fn(),
  onDeactivate: vi.fn(),
  onActivate: vi.fn(),
  onDelete: vi.fn(),
};

describe('WorkflowsTable', () => {
  beforeEach(() => {
    baseProps.onEdit = vi.fn();
    baseProps.onDuplicate = vi.fn();
    baseProps.onRename = vi.fn();
    baseProps.onDeactivate = vi.fn();
    baseProps.onActivate = vi.fn();
    baseProps.onDelete = vi.fn();
  });

  it('renders one row per workflow with name, description, active status, initial state', () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Premium customers')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders an empty placeholder when workflows is empty', () => {
    renderWithApp(<WorkflowsTable {...baseProps} workflows={[]} />);
    expect(screen.getByText(/no workflows/i)).toBeInTheDocument();
  });

  it('Edit button click invokes onEdit with the row name', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const editButtons = screen.getAllByRole('button', { name: /^Edit$/ });
    await userEvent.click(editButtons[0]);

    expect(baseProps.onEdit).toHaveBeenCalledWith('Premium');
  });

  it('Duplicate button click invokes onDuplicate', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const buttons = screen.getAllByRole('button', { name: /^Duplicate$/ });
    await userEvent.click(buttons[1]); // Standard's Duplicate

    expect(baseProps.onDuplicate).toHaveBeenCalledWith('Standard');
  });

  it('Rename button click invokes onRename', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const buttons = screen.getAllByRole('button', { name: /^Rename$/ });
    await userEvent.click(buttons[0]);

    expect(baseProps.onRename).toHaveBeenCalledWith('Premium');
  });

  it('shows Deactivate for active workflow and Activate for inactive', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    // Premium is active → has Deactivate
    expect(screen.getAllByRole('button', { name: /^Deactivate$/ })).toHaveLength(1);
    // Standard is inactive → has Activate
    expect(screen.getAllByRole('button', { name: /^Activate$/ })).toHaveLength(1);
  });

  it('Deactivate button invokes onDeactivate; Activate invokes onActivate', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    await userEvent.click(screen.getByRole('button', { name: /^Deactivate$/ }));
    expect(baseProps.onDeactivate).toHaveBeenCalledWith('Premium');

    await userEvent.click(screen.getByRole('button', { name: /^Activate$/ }));
    expect(baseProps.onActivate).toHaveBeenCalledWith('Standard');
  });

  it('Delete button is disabled when there is only one workflow (>=1 invariant)', () => {
    const onlyOne = sampleSummaries.slice(0, 1);
    renderWithApp(<WorkflowsTable {...baseProps} workflows={onlyOne} />);

    const deleteBtn = screen.getByRole('button', { name: /^Delete$/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('Delete button is enabled when there are >=2 workflows; click invokes onDelete', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    expect(deleteButtons[0]).toBeEnabled();
    await userEvent.click(deleteButtons[0]);

    expect(baseProps.onDelete).toHaveBeenCalledWith('Premium');
  });

  it('does not show the empty placeholder while loading=true with no data', () => {
    renderWithApp(<WorkflowsTable {...baseProps} workflows={[]} loading />);
    // The Empty placeholder must NOT short-circuit while data is in flight,
    // so the user sees the loading state instead of "No workflows" flashing.
    expect(screen.queryByText(/no workflows in this model/i)).not.toBeInTheDocument();
  });
});

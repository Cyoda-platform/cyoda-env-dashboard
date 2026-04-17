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
    // Use a fixture where Premium can be safely deactivated (a second active workflow exists).
    const fixture: WorkflowSummary[] = [
      { name: 'Premium', desc: 'Premium customers', active: true, initialState: 'draft' },
      { name: 'AnotherActive', desc: undefined, active: true, initialState: 'pending' },
    ];
    renderWithApp(<WorkflowsTable {...baseProps} workflows={fixture} />);

    // Both rows are active; both have Deactivate.
    const deactivateButtons = screen.getAllByRole('button', { name: /^Deactivate$/ });
    expect(deactivateButtons).toHaveLength(2);
    await userEvent.click(deactivateButtons[0]);
    expect(baseProps.onDeactivate).toHaveBeenCalledWith('Premium');
  });

  it('Activate button invokes onActivate on an inactive workflow', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    // Standard is inactive in the default sampleSummaries. Activate is always enabled.
    await userEvent.click(screen.getByRole('button', { name: /^Activate$/ }));
    expect(baseProps.onActivate).toHaveBeenCalledWith('Standard');
  });

  it('Delete button is disabled when this is the only active workflow', () => {
    const onlyOneActive = sampleSummaries.slice(0, 1); // Premium, active: true
    renderWithApp(<WorkflowsTable {...baseProps} workflows={onlyOneActive} />);

    const deleteBtn = screen.getByRole('button', { name: /^Delete$/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('Deactivate button is disabled when this is the only active workflow', () => {
    // Premium is active; nothing else is. Deactivating Premium would leave 0 active.
    const onlyPremiumActive: WorkflowSummary[] = [
      { name: 'Premium', desc: 'Premium customers', active: true, initialState: 'draft' },
      { name: 'AlreadyOff', desc: undefined, active: false, initialState: 'pending' },
    ];
    renderWithApp(<WorkflowsTable {...baseProps} workflows={onlyPremiumActive} />);

    const deactivateBtn = screen.getByRole('button', { name: /^Deactivate$/ });
    expect(deactivateBtn).toBeDisabled();
  });

  it('Delete is enabled on an inactive workflow when an active one remains', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    // Premium (active) is index 0; deleting it would leave 0 active → disabled.
    expect(deleteButtons[0]).toBeDisabled();
    // Standard (inactive) is index 1; deleting it leaves Premium (active) → enabled.
    expect(deleteButtons[1]).toBeEnabled();
    await userEvent.click(deleteButtons[1]);
    expect(baseProps.onDelete).toHaveBeenCalledWith('Standard');
  });

  it('Delete is blocked on the only active workflow even when inactive workflows exist', () => {
    // Premium (active, target of delete) + AlreadyOff (inactive). Deleting Premium → 0 active.
    const onlyPremiumActive: WorkflowSummary[] = [
      { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
      { name: 'AlreadyOff', desc: undefined, active: false, initialState: 'pending' },
    ];
    renderWithApp(<WorkflowsTable {...baseProps} workflows={onlyPremiumActive} />);

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    // First row (Premium, active) — disabled (deleting it leaves 0 active).
    expect(deleteButtons[0]).toBeDisabled();
    // Second row (AlreadyOff, inactive) — enabled (deleting it leaves Premium active).
    expect(deleteButtons[1]).toBeEnabled();
  });

  it('does not show the empty placeholder while loading=true with no data', () => {
    renderWithApp(<WorkflowsTable {...baseProps} workflows={[]} loading />);
    // The Empty placeholder must NOT short-circuit while data is in flight,
    // so the user sees the loading state instead of "No workflows" flashing.
    expect(screen.queryByText(/no workflows in this model/i)).not.toBeInTheDocument();
  });

  it('disables the Activate/Deactivate button for rows in pendingActiveNames', () => {
    renderWithApp(
      <WorkflowsTable
        {...baseProps}
        pendingActiveNames={new Set(['Premium'])}
      />
    );

    // Premium is active → Deactivate button. With AntD's loading prop the
    // button's accessible name becomes "loadingDeactivate" (spinner aria-label
    // concatenated with the label). Match either form so this test isn't
    // brittle to that concatenation detail.
    const deactivateBtn = screen.getByRole('button', { name: /Deactivate$/ });
    expect(deactivateBtn).toBeDisabled();
  });
});

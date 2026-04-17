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
});

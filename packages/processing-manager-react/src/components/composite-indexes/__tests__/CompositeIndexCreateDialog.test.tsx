import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { CompositeIndexCreateDialog } from '../CompositeIndexCreateDialog';

// Mock ModellingRangeDefs and ModellingColDefs from tableau-react
vi.mock('@cyoda/tableau-react', () => ({
  ModellingRangeDefs: ({ onChange }: any) => (
    <div data-testid="modelling-range-defs">
      <button onClick={() => onChange([{ fullPath: 'test.range' }])}>
        Select Range
      </button>
    </div>
  ),
  ModellingColDefs: ({ onChange }: any) => (
    <div data-testid="modelling-col-defs">
      <button onClick={() => onChange({ colDefs: [{ fullPath: 'test.col1' }, { fullPath: 'test.col2' }] })}>
        Select Columns
      </button>
    </div>
  ),
}));

// Wrapper component with App provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <App>{children}</App>
);

describe('CompositeIndexCreateDialog', () => {
  const mockOnCancel = vi.fn();
  const mockOnCreate = vi.fn();

  const defaultProps = {
    open: true,
    entityClass: 'com.cyoda.test.Entity',
    onCancel: mockOnCancel,
    onCreate: mockOnCreate,
    loading: false,
  };

  it('should render the dialog when open', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText('Create New Composite Indexes')).toBeInTheDocument();
  });

  it('should not render the dialog when closed', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} open={false} />, { wrapper: TestWrapper });
    expect(screen.queryByText('Create New Composite Indexes')).not.toBeInTheDocument();
  });

  it('should render all three steps', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    // Check that all three step titles are present
    expect(screen.getByText('Range Field')).toBeInTheDocument();
    expect(screen.getByText('None Range Fields')).toBeInTheDocument();
    // Name appears twice (in steps and in form label), so we just check it exists
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
  });

  it('should render step 1 (Name) by default', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByPlaceholderText('Enter composite index name')).toBeInTheDocument();
  });

  it('should render Cancel button', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should render Previous step button (disabled on first step)', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    const prevButton = screen.getByText('Previous step').closest('button');
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
  });

  it('should render Next step button', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText('Next step')).toBeInTheDocument();
  });

  it('should render Add button (disabled initially)', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} />, { wrapper: TestWrapper });
    const addButton = screen.getByText('Add').closest('button');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it('should show loading state on Add button', () => {
    render(<CompositeIndexCreateDialog {...defaultProps} loading={true} />, { wrapper: TestWrapper });
    const addButton = screen.getByText('Add');
    expect(addButton.closest('button')).toHaveClass('ant-btn-loading');
  });
});


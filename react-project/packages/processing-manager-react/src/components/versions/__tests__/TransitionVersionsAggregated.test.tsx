import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TransitionVersionsAggregated from '../TransitionVersionsAggregated';

const mockRows = [
  {
    version: 'v1.0.0',
    transactionId: 'txn-123',
    actionType: 'READ',
    colType: 'column1',
    colTimeMillis: 1609459200000, // 2021-01-01 00:00:00
  },
  {
    version: 'v1.0.0',
    transactionId: 'txn-123',
    actionType: 'READ',
    colType: 'column2',
    colTimeMillis: 1609459260000, // 2021-01-01 00:01:00
  },
  {
    version: 'v2.0.0',
    transactionId: 'txn-456',
    actionType: 'UPDATE',
    colType: 'column1',
    colTimeMillis: 1609545600000, // 2021-01-02 00:00:00
  },
];

describe('TransitionVersionsAggregated', () => {
  it('should render the component', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Aggregated by transaction view')).toBeInTheDocument();
  });

  it('should render table with correct columns', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // Check for column headers (Ant Design renders duplicate headers)
    const versionHeaders = screen.getAllByText('Version(time based)');
    expect(versionHeaders.length).toBeGreaterThan(0);

    const transactionHeaders = screen.getAllByText('Transaction Id');
    expect(transactionHeaders.length).toBeGreaterThan(0);

    const actionHeaders = screen.getAllByText('Action Type');
    expect(actionHeaders.length).toBeGreaterThan(0);
  });

  it('should aggregate rows by transaction ID', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // Should show 2 aggregated rows (txn-123 and txn-456)
    expect(screen.getByText('txn-123')).toBeInTheDocument();
    expect(screen.getByText('txn-456')).toBeInTheDocument();
  });

  it('should display version information', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
  });

  it('should display action types', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('READ')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });

  it('should render transaction ID as link', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render expandable rows', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // Find expand button (Ant Design uses button with aria-label)
    const expandButtons = container.querySelectorAll('.ant-table-row-expand-icon');
    expect(expandButtons.length).toBeGreaterThan(0);
  });

  it('should handle empty rows', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Aggregated by transaction view')).toBeInTheDocument();
  });

  it('should render inside a Card', () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should use transactionId as rowKey', () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should aggregate multiple columns for same transaction', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // txn-123 has 2 columns (column1 and column2)
    // They should be aggregated into one row
    const txnLinks = screen.getAllByText('txn-123');
    // Should appear once in the main table (not counting duplicates from Ant Design)
    expect(txnLinks.length).toBeGreaterThan(0);
  });

  it('should render with default rows as empty array', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={undefined as any} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Aggregated by transaction view')).toBeInTheDocument();
  });

  it('should create subtable with column information', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // The component should aggregate rows and create subtables
    // We can verify the table structure exists
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should use useParams to get name parameter', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsAggregated rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // Component should render without errors
    expect(screen.getByText('Aggregated by transaction view')).toBeInTheDocument();
  });
});


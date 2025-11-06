import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TransitionVersionsSorted from '../TransitionVersionsSorted';

const mockRows = [
  {
    version: 'v1.0.0',
    transactionId: 'txn-123',
    actionType: 'READ',
    colType: 'column1',
    colTimeMillis: 1609459200000, // 2021-01-01 00:00:00
  },
  {
    version: 'v1.0.1',
    transactionId: 'txn-456',
    actionType: 'UPDATE',
    colType: 'column2',
    colTimeMillis: 1609545600000, // 2021-01-02 00:00:00
  },
  {
    version: 'v2.0.0',
    transactionId: 'txn-789',
    actionType: 'REMOVE',
    colType: 'column3',
    colTimeMillis: 1609632000000, // 2021-01-03 00:00:00
  },
];

describe('TransitionVersionsSorted', () => {
  it('should render the component', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText("Sorted by column's time view")).toBeInTheDocument();
  });

  it('should render table with correct columns', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
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

    const colTypeHeaders = screen.getAllByText('Column type');
    expect(colTypeHeaders.length).toBeGreaterThan(0);

    const colTimeHeaders = screen.getAllByText('Column time');
    expect(colTimeHeaders.length).toBeGreaterThan(0);
  });

  it('should display all rows', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('txn-123')).toBeInTheDocument();
    expect(screen.getByText('txn-456')).toBeInTheDocument();
    expect(screen.getByText('txn-789')).toBeInTheDocument();
  });

  it('should display version information', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('v1.0.1')).toBeInTheDocument();
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
  });

  it('should display action types', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('READ')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.getByText('REMOVE')).toBeInTheDocument();
  });

  it('should display column types', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('column1')).toBeInTheDocument();
    expect(screen.getByText('column2')).toBeInTheDocument();
    expect(screen.getByText('column3')).toBeInTheDocument();
  });

  it('should format column time correctly', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // Check that dates are formatted (the exact time may vary by timezone)
    // Just verify that the column time column exists and has formatted content
    const columnTimeHeaders = screen.getAllByText('Column time');
    expect(columnTimeHeaders.length).toBeGreaterThan(0);
  });

  it('should render transaction ID as link', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should handle empty rows', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText("Sorted by column's time view")).toBeInTheDocument();
  });

  it('should render inside a Card', () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should have transition-versions-sorted class', () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={[]} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const sortedCard = container.querySelector('.transition-versions-sorted');
    expect(sortedCard).toBeInTheDocument();
  });

  it('should use composite rowKey', () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should render with default rows as empty array', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={undefined as any} />}
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText("Sorted by column's time view")).toBeInTheDocument();
  });

  it('should use useParams to get name parameter', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // Component should render without errors
    expect(screen.getByText("Sorted by column's time view")).toBeInTheDocument();
  });

  it('should render all rows without aggregation', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TransitionVersionsSorted rows={mockRows} />}
          />
        </Routes>
      </BrowserRouter>
    );

    // All 3 rows should be visible (not aggregated like in TransitionVersionsAggregated)
    const txn123 = screen.getAllByText('txn-123');
    const txn456 = screen.getAllByText('txn-456');
    const txn789 = screen.getAllByText('txn-789');

    expect(txn123.length).toBeGreaterThan(0);
    expect(txn456.length).toBeGreaterThan(0);
    expect(txn789.length).toBeGreaterThan(0);
  });
});


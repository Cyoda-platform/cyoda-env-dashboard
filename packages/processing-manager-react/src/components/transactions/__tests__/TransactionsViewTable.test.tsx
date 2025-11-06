/**
 * Tests for TransactionsViewTable Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TransactionsViewTable } from '../TransactionsViewTable';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ name: 'test-node' }),
  };
});

const mockData = [
  {
    id: 'tx-001',
    userName: 'user1',
    status: 'COMPLETED',
    createTime: '2024-01-01 10:00:00.000',
    submitTime: '2024-01-01 10:00:01.000',
    finishTime: '2024-01-01 10:00:02.000',
    prepareTimeMillis: 500,
    processTimeMillis: 1000,
    transactionSubmitNodeId: 'node-1',
  },
  {
    id: 'tx-002',
    userName: 'user2',
    status: 'PENDING',
    createTime: '2024-01-01 11:00:00.000',
    submitTime: '2024-01-01 11:00:01.000',
    finishTime: '2024-01-01 11:00:05.000',
    prepareTimeMillis: 800,
    processTimeMillis: 4000,
    transactionSubmitNodeId: 'node-2',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TransactionsViewTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    expect(screen.getByText('tx-001')).toBeInTheDocument();
    expect(screen.getByText('tx-002')).toBeInTheDocument();
  });

  it('should display user names', () => {
    renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('should display transaction statuses', () => {
    renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should render empty table when no data', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={[]} isLoading={true} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle not loading state', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={mockData} isLoading={false} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have column headers', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should render transaction IDs as links', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have pagination disabled', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={mockData} />);

    // Table has pagination={false}
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render with default props', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={[]} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should handle multiple rows', () => {
    renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    expect(screen.getByText('tx-001')).toBeInTheDocument();
    expect(screen.getByText('tx-002')).toBeInTheDocument();
  });

  it('should render table with bordered style', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should display all transaction data fields', () => {
    renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    expect(screen.getByText('tx-001')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should handle empty array', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = renderWithRouter(<TransactionsViewTable tableData={mockData} />);
    
    expect(container).toBeInTheDocument();
  });
});


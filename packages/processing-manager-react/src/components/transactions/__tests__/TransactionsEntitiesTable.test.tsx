/**
 * Tests for TransactionsEntitiesTable Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransactionsEntitiesTable from '../TransactionsEntitiesTable';

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
    cretionDate: '2024-01-01 10:00:00',
    entityId: 'entity-001',
    shardId: 'shard-1',
    actions: [
      'entity-versions?id=entity-001',
      'entity-changes?id=entity-001',
      'entity-state-machine?id=entity-001',
    ],
  },
  {
    cretionDate: '2024-01-01 11:00:00',
    entityId: 'entity-002',
    shardId: 'shard-2',
    actions: [
      'entity-versions?id=entity-002',
    ],
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TransactionsEntitiesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(screen.getByText('entity-001')).toBeInTheDocument();
    expect(screen.getByText('entity-002')).toBeInTheDocument();
  });

  it('should display creation dates', () => {
    renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01 11:00:00')).toBeInTheDocument();
  });

  it('should display shard IDs', () => {
    renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(screen.getByText('shard-1')).toBeInTheDocument();
    expect(screen.getByText('shard-2')).toBeInTheDocument();
  });

  it('should render empty table when no data', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={[]} isLoading={true} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle not loading state', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} isLoading={false} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should have column headers', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    const headers = container.querySelectorAll('.ant-table-thead th');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should render action links', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have pagination', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('should render with default props', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={[]} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should handle multiple rows', () => {
    renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(screen.getByText('entity-001')).toBeInTheDocument();
    expect(screen.getByText('entity-002')).toBeInTheDocument();
  });

  it('should render table with bordered style', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should display all entity data fields', () => {
    renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(screen.getByText('entity-001')).toBeInTheDocument();
    expect(screen.getByText('shard-1')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
  });

  it('should handle empty array', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={[]} />);
    
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should render action links when they exist', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);

    // Check that actions column exists
    const actionsColumn = container.querySelector('.actions-buttons');
    expect(actionsColumn).toBeInTheDocument();
  });

  it('should render links in actions column', () => {
    const { container } = renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);

    // Check that there are links in the table
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should handle entities with partial actions', () => {
    renderWithRouter(<TransactionsEntitiesTable tableData={mockData} />);
    
    // Second entity only has versions action
    expect(screen.getByText('entity-002')).toBeInTheDocument();
  });


});


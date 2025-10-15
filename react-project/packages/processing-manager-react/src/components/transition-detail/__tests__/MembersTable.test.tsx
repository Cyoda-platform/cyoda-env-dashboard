/**
 * Tests for MembersTable Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MembersTable } from '../MembersTable';

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ name: 'test-node' })),
  };
});

const mockMemberData = [
  {
    entityType: 'TestEntity',
    entityId: 'entity-123',
    actionType: 'UPDATE',
    versionCheckTimeMillis: 1704110400000, // 2024-01-01 10:00:00
    versionCheckResult: true,
  },
  {
    entityType: 'AnotherEntity',
    entityId: 'entity-456',
    actionType: 'READ',
    versionCheckTimeMillis: 1704114000000, // 2024-01-01 11:00:00
    versionCheckResult: false,
  },
];

describe('MembersTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Transaction members with version check results')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    // Check that data is rendered
    expect(screen.getByText('TestEntity')).toBeInTheDocument();
    expect(screen.getByText('AnotherEntity')).toBeInTheDocument();
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('entity-456')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.getByText('READ')).toBeInTheDocument();
  });

  it('should render all column headers', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    // Ant Design renders duplicate headers (one in thead, one in measurement row)
    expect(screen.getAllByText('Entity Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entity Id').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Action Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Version Check Time').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Version Check Result').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operations').length).toBeGreaterThan(0);
  });

  it('should render "Yes" for versionCheckResult true', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const yesTexts = screen.getAllByText('Yes');
    expect(yesTexts.length).toBeGreaterThan(0);
  });

  it('should render "No" for versionCheckResult false', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const noTexts = screen.getAllByText('No');
    expect(noTexts.length).toBeGreaterThan(0);
  });

  it('should render Versions link for each row', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const versionsLinks = screen.getAllByRole('link', { name: /versions/i });
    expect(versionsLinks.length).toBe(2);
    expect(versionsLinks[0]).toHaveAttribute(
      'href',
      '/nodes/test-node/versions?entityId=entity-123&type=TestEntity'
    );
  });

  it('should render Changes link for each row', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const changesLinks = screen.getAllByRole('link', { name: /changes/i });
    expect(changesLinks.length).toBe(2);
    expect(changesLinks[0]).toHaveAttribute(
      'href',
      '/nodes/test-node/changes?entityId=entity-123&type=TestEntity'
    );
  });

  it('should render State Machine link for each row', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const stateMachineLinks = screen.getAllByRole('link', { name: /state machine/i });
    expect(stateMachineLinks.length).toBe(2);
    expect(stateMachineLinks[0]).toHaveAttribute(
      'href',
      '/nodes/test-node/entity-state-machine?entityId=entity-123&type=TestEntity'
    );
  });

  it('should format version check time correctly', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    // Check that time is formatted (format: YYYY-MM-DD HH:mm:ss.SSS)
    const timeElements = screen.getAllByText(/2024-01-01/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should show loading spinner when isLoading is true', () => {
    const { container } = render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} isLoading={true} />
      </BrowserRouter>
    );
    
    // Ant Design Spin adds a spinning class
    const spinElement = container.querySelector('.ant-spin-spinning');
    expect(spinElement).toBeInTheDocument();
  });

  it('should not show loading spinner when isLoading is false', () => {
    const { container } = render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} isLoading={false} />
      </BrowserRouter>
    );
    
    const spinElement = container.querySelector('.ant-spin-spinning');
    expect(spinElement).not.toBeInTheDocument();
  });

  it('should render empty table when no data provided', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={[]} />
      </BrowserRouter>
    );
    
    // Ant Design shows "No data" text when table is empty (appears in SVG title and description)
    const noDataElements = screen.getAllByText(/no data/i);
    expect(noDataElements.length).toBeGreaterThan(0);
  });

  it('should render table with bordered prop', () => {
    const { container } = render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const table = container.querySelector('.ant-table-bordered');
    expect(table).toBeInTheDocument();
  });

  it('should render Card with correct title', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const cardTitle = screen.getByText('Transaction members with version check results');
    expect(cardTitle).toBeInTheDocument();
  });

  it('should render all entity types', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('TestEntity')).toBeInTheDocument();
    expect(screen.getByText('AnotherEntity')).toBeInTheDocument();
  });

  it('should render all entity IDs', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('entity-123')).toBeInTheDocument();
    expect(screen.getByText('entity-456')).toBeInTheDocument();
  });

  it('should render all action types', () => {
    render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.getByText('READ')).toBeInTheDocument();
  });

  it('should render operations column with action buttons class', () => {
    const { container } = render(
      <BrowserRouter>
        <MembersTable tableData={mockMemberData} />
      </BrowserRouter>
    );
    
    const actionsColumn = container.querySelector('.actions-buttons');
    expect(actionsColumn).toBeInTheDocument();
  });
});


/**
 * Tests for MembersFilter Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembersFilter, MembersFilterRef } from '../MembersFilter';
import React from 'react';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useEntitiesListPossible: vi.fn(),
}));

import { useEntitiesListPossible } from '../../../hooks';

describe('MembersFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useEntitiesListPossible
    (useEntitiesListPossible as any).mockReturnValue({
      data: ['EntityClass1', 'EntityClass2', 'EntityClass3'],
      isLoading: false,
    });
  });

  it('should render the component', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Entity type')).toBeInTheDocument();
    expect(screen.getByText('Action Type')).toBeInTheDocument();
    expect(screen.getByText('Version check result')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('should render Load button', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeInTheDocument();
  });

  it('should call onChange when Load button is clicked', async () => {
    const user = userEvent.setup();
    render(<MembersFilter onChange={mockOnChange} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      entityType: '',
      actionType: 'ALL',
      versionCheckResult: null,
      sort: 'ASC',
    });
  });

  it('should render entity type select with options', async () => {
    const user = userEvent.setup();
    render(<MembersFilter onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[0]);
    
    // Verify entity type options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('EntityClass1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('EntityClass2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('EntityClass3').length).toBeGreaterThan(0);
    });
  });

  it('should render action type select with options', async () => {
    const user = userEvent.setup();
    render(<MembersFilter onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[1]);
    
    // Verify action type options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('ALL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('READ').length).toBeGreaterThan(0);
      expect(screen.getAllByText('UPDATE').length).toBeGreaterThan(0);
      expect(screen.getAllByText('REMOVE').length).toBeGreaterThan(0);
    });
  });

  it('should render version check result select with options', async () => {
    const user = userEvent.setup();
    render(<MembersFilter onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[2]);
    
    // Verify version check result options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('True').length).toBeGreaterThan(0);
      expect(screen.getAllByText('False').length).toBeGreaterThan(0);
    });
  });

  it('should render sort select with options', async () => {
    const user = userEvent.setup();
    render(<MembersFilter onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    await user.click(selects[3]);
    
    // Verify sort options are rendered
    await waitFor(() => {
      expect(screen.getAllByText('Asc').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Desc').length).toBeGreaterThan(0);
    });
  });

  it('should show loading state on button', () => {
    render(<MembersFilter onChange={mockOnChange} isLoading={true} />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toHaveClass('ant-btn-loading');
  });

  it('should expose form values via ref', () => {
    const ref = React.createRef<MembersFilterRef>();
    render(<MembersFilter ref={ref} onChange={mockOnChange} />);
    
    expect(ref.current?.form).toEqual({
      entityType: '',
      actionType: 'ALL',
      versionCheckResult: null,
      sort: 'ASC',
    });
  });

  it('should handle empty entity classes data', () => {
    (useEntitiesListPossible as any).mockReturnValue({
      data: null,
      isLoading: false,
    });
    
    render(<MembersFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Entity type')).toBeInTheDocument();
  });

  it('should have showSearch on entity type select', () => {
    const { container } = render(<MembersFilter onChange={mockOnChange} />);
    
    const selects = container.querySelectorAll('.ant-select-show-search');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should have allowClear on entity type select', () => {
    const { container } = render(<MembersFilter onChange={mockOnChange} />);
    
    const selects = container.querySelectorAll('.ant-select-allow-clear');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should render with correct className', () => {
    const { container } = render(<MembersFilter onChange={mockOnChange} />);
    
    const form = container.querySelector('.members-filter');
    expect(form).toBeInTheDocument();
  });

  it('should render Card with title', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    const cardTitle = screen.getByText('Filter');
    expect(cardTitle).toBeInTheDocument();
  });

  it('should handle onChange not provided', async () => {
    const user = userEvent.setup();
    render(<MembersFilter />);
    
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    // Should not throw error
    expect(loadButton).toBeInTheDocument();
  });

  it('should have default values', () => {
    const ref = React.createRef<MembersFilterRef>();
    render(<MembersFilter ref={ref} onChange={mockOnChange} />);
    
    expect(ref.current?.form.entityType).toBe('');
    expect(ref.current?.form.actionType).toBe('ALL');
    expect(ref.current?.form.versionCheckResult).toBe(null);
    expect(ref.current?.form.sort).toBe('ASC');
  });

  it('should render action type placeholder', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    const placeholders = screen.getAllByText('Action Type');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('should render version check result placeholder', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    expect(screen.getByText('Please select')).toBeInTheDocument();
  });

  it('should render sort placeholder', () => {
    render(<MembersFilter onChange={mockOnChange} />);
    
    const placeholders = screen.getAllByText('Sort');
    expect(placeholders.length).toBeGreaterThan(0);
  });
});


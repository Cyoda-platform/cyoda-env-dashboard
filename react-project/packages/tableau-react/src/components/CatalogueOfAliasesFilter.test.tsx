/**
 * Unit tests for CatalogueOfAliasesFilter component
 */

import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CatalogueOfAliasesFilter from './CatalogueOfAliasesFilter';

const mockUsersOptions = [
  { value: 'user1', label: 'user1' },
  { value: 'user2', label: 'user2' },
];

const mockEntityOptions = [
  { value: 'Entity1', label: 'Entity1' },
  { value: 'Entity2', label: 'Entity2' },
];

const mockStateOptions = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'DRAFT', label: 'DRAFT' },
];

describe('CatalogueOfAliasesFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render filter title', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should render all filter fields', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    expect(screen.getByText('Filter by state:')).toBeInTheDocument();
    expect(screen.getByText('Entity:')).toBeInTheDocument();
    expect(screen.getByText('Author or Group:')).toBeInTheDocument();
    expect(screen.getByText('By date and time:')).toBeInTheDocument();
    expect(screen.getByText('Search:')).toBeInTheDocument();
  });

  it('should handle search input change', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search Report name and description here...');
    await user.type(searchInput, 'test search');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test search',
        })
      );
    });
  });

  it('should handle state filter change', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Find the state select by its label
    const stateLabel = screen.getByText('Filter by state:');
    const stateSelect = stateLabel.parentElement?.querySelector('.ant-select') as HTMLElement;
    
    await user.click(stateSelect);

    // Wait for dropdown to appear and select an option
    await waitFor(() => {
      const activeOption = screen.getByText('ACTIVE');
      expect(activeOption).toBeInTheDocument();
    });
  });

  it('should handle entity filter change', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const entityLabel = screen.getByText('Entity:');
    const entitySelect = entityLabel.parentElement?.querySelector('.ant-select') as HTMLElement;
    
    await user.click(entitySelect);

    await waitFor(() => {
      const entity1Option = screen.getByText('Entity1');
      expect(entity1Option).toBeInTheDocument();
    });
  });

  it('should handle author filter change', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const authorLabel = screen.getByText('Author or Group:');
    const authorSelect = authorLabel.parentElement?.querySelector('.ant-select') as HTMLElement;
    
    await user.click(authorSelect);

    await waitFor(() => {
      const user1Option = screen.getByText('user1');
      expect(user1Option).toBeInTheDocument();
    });
  });

  it('should display current filter values', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{
          states: ['ACTIVE'],
          entities: ['Entity1'],
          authors: ['user1'],
          search: 'test',
        }}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search Report name and description here...');
    expect(searchInput).toHaveValue('test');
  });

  it('should handle date picker change', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const dateLabel = screen.getByText('By date and time:');
    const datePicker = dateLabel.parentElement?.querySelector('.ant-picker') as HTMLElement;
    
    await user.click(datePicker);

    // DatePicker dropdown should appear
    await waitFor(() => {
      expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument();
    });
  });

  it('should clear search input', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{ search: 'test' }}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search Report name and description here...');
    await user.clear(searchInput);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '',
        })
      );
    });
  });

  it('should render with empty options', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={[]}
        entityOptions={[]}
        stateOptions={[]}
      />
    );

    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('should handle multiple state selections', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const stateLabel = screen.getByText('Filter by state:');
    const stateSelect = stateLabel.parentElement?.querySelector('.ant-select') as HTMLElement;
    
    await user.click(stateSelect);

    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });
  });

  it('should handle multiple entity selections', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const entityLabel = screen.getByText('Entity:');
    const entitySelect = entityLabel.parentElement?.querySelector('.ant-select') as HTMLElement;
    
    await user.click(entitySelect);

    await waitFor(() => {
      expect(screen.getByText('Entity1')).toBeInTheDocument();
      expect(screen.getByText('Entity2')).toBeInTheDocument();
    });
  });

  it('should handle multiple author selections', async () => {
    const user = userEvent.setup();
    render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    const authorLabel = screen.getByText('Author or Group:');
    const authorSelect = authorLabel.parentElement?.querySelector('.ant-select') as HTMLElement;
    
    await user.click(authorSelect);

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });
});


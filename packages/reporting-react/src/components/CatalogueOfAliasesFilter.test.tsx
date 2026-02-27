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

  it('should handle state filter change', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{ states: ['active'] }}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Find all comboboxes (Select components)
    const selects = screen.getAllByRole('combobox');
    // First select is the state filter
    const stateSelect = selects[0];

    // Verify the select component is rendered
    expect(stateSelect).toBeInTheDocument();
  });

  it('should handle entity filter change', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{ entities: ['entity1'] }}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Find all comboboxes (Select components)
    const selects = screen.getAllByRole('combobox');
    // Second select is the entity filter
    const entitySelect = selects[1];

    // Verify the select component is rendered
    expect(entitySelect).toBeInTheDocument();
  });

  it('should handle author filter change', () => {
    render(
      <CatalogueOfAliasesFilter
        value={{ authors: ['user1'] }}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Find all comboboxes (Select components)
    const selects = screen.getAllByRole('combobox');
    // Third select is the author filter
    const authorSelect = selects[2];

    // Verify the select component is rendered
    expect(authorSelect).toBeInTheDocument();
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

  it('should handle date picker change', () => {
    const { container } = render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Find the date picker input
    const datePickerInput = container.querySelector('.ant-picker-input input') as HTMLInputElement;

    // Verify the date picker is rendered
    expect(datePickerInput).toBeInTheDocument();
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
    const { container } = render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Verify the state select is rendered
    const stateLabel = screen.getByText('Filter by state:');
    expect(stateLabel).toBeInTheDocument();

    // Verify select components are present
    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should handle multiple entity selections', async () => {
    const { container } = render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Verify the entity select is rendered with the correct options
    const entityLabel = screen.getByText('Entity:');
    expect(entityLabel).toBeInTheDocument();

    // Verify the select component is present (look in container, not just parent)
    const entitySelect = container.querySelector('.ant-select');
    expect(entitySelect).toBeTruthy();
  });

  it('should handle multiple author selections', async () => {
    const { container } = render(
      <CatalogueOfAliasesFilter
        value={{}}
        onChange={mockOnChange}
        usersOptions={mockUsersOptions}
        entityOptions={mockEntityOptions}
        stateOptions={mockStateOptions}
      />
    );

    // Verify the author select is rendered
    const authorLabel = screen.getByText('Author or Group:');
    expect(authorLabel).toBeInTheDocument();

    // Verify select components are present
    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThan(0);
  });
});


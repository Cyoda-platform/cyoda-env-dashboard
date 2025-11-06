import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DeleteRelationsDialog from '../DeleteRelationsDialog';

describe('DeleteRelationsDialog', () => {
  const mockOnDelete = vi.fn();
  const mockOnDeleteList = vi.fn();

  const mockRelations = [
    {
      column: {
        srcColumnPath: 'data/name',
        dstColumnPath: 'name',
      },
      type: 'columnMapping' as const,
    },
    {
      column: {
        srcColumnPath: 'data/age',
        dstColumnPath: 'age',
      },
      type: 'columnMapping' as const,
    },
  ];

  beforeEach(() => {
    mockOnDelete.mockClear();
    mockOnDeleteList.mockClear();
  });

  it('should render dialog when opened', () => {
    const ref = React.createRef<any>();
    render(
      <DeleteRelationsDialog
        ref={ref}
        selectedDataRelations={mockRelations}
        onDelete={mockOnDelete}
        onDeleteList={mockOnDeleteList}
      />
    );

    ref.current?.open();

    expect(screen.getByText('Delete Relations')).toBeInTheDocument();
  });

  it('should display relations in table', () => {
    const ref = React.createRef<any>();
    render(
      <DeleteRelationsDialog
        ref={ref}
        selectedDataRelations={mockRelations}
        onDelete={mockOnDelete}
        onDeleteList={mockOnDeleteList}
      />
    );

    ref.current?.open();

    expect(screen.getByText('data/name')).toBeInTheDocument();
    expect(screen.getByText('data/age')).toBeInTheDocument();
  });

  it('should have delete all button', () => {
    const ref = React.createRef<any>();
    render(
      <DeleteRelationsDialog
        ref={ref}
        selectedDataRelations={mockRelations}
        onDelete={mockOnDelete}
        onDeleteList={mockOnDeleteList}
      />
    );

    ref.current?.open();

    expect(screen.getByText('Delete All')).toBeInTheDocument();
  });
});


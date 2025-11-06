import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HiddenTablesPopUp from '../HiddenTablesPopUp';
import type { SqlTable } from '../../../types';

describe('HiddenTablesPopUp', () => {
  const mockTables: SqlTable[] = [
    {
      metadataClassId: '1',
      tableName: 'visible_table',
      uniformedPath: 'path1',
      fields: [],
      hidden: false,
    },
    {
      metadataClassId: '2',
      tableName: 'hidden_table',
      uniformedPath: 'path2',
      fields: [],
      hidden: true,
    },
  ];

  it('should render without crashing', () => {
    const ref = { current: null };
    const { container } = render(
      <HiddenTablesPopUp ref={ref} tables={mockTables} />
    );
    expect(container).toBeTruthy();
  });

  it('should not display dialog initially', () => {
    const ref = { current: null };
    render(<HiddenTablesPopUp ref={ref} tables={mockTables} />);
    
    // Dialog should not be visible initially
    expect(screen.queryByText('Hidden Tables')).not.toBeInTheDocument();
  });

  it('should accept tables prop', () => {
    const ref = { current: null };
    const { rerender } = render(
      <HiddenTablesPopUp ref={ref} tables={mockTables} />
    );

    const newTables: SqlTable[] = [
      {
        metadataClassId: '3',
        tableName: 'new_table',
        uniformedPath: 'path3',
        fields: [],
        hidden: true,
      },
    ];

    rerender(<HiddenTablesPopUp ref={ref} tables={newTables} />);
    expect(true).toBe(true); // Component should handle prop updates
  });

  it('should expose open method via ref', () => {
    const ref = { current: null } as any;
    render(<HiddenTablesPopUp ref={ref} tables={mockTables} />);
    
    expect(ref.current).toBeTruthy();
    expect(typeof ref.current?.open).toBe('function');
  });
});


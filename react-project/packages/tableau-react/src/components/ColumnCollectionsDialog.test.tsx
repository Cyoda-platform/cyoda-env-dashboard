/**
 * Tests for ColumnCollectionsDialog Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import ColumnCollectionsDialog from './ColumnCollectionsDialog';
import { createRef } from 'react';
import type { ColumnCollectionsDialogRef, ColumnData } from './ColumnCollectionsDialog';

describe('ColumnCollectionsDialog', () => {
  const mockColumnData: ColumnData = {
    headerName: 'testColumn',
    data: {
      field1: 'value1',
      field2: 'value2',
      field3: 123,
      field4: true,
    },
  };

  describe('Rendering', () => {
    it('should not render dialog initially', () => {
      renderWithProviders(<ColumnCollectionsDialog />);

      expect(screen.queryByText(/Column/)).not.toBeInTheDocument();
    });

    it('should render dialog when showDetail is called', () => {
      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      // Show the dialog
      act(() => {
        ref.current?.showDetail(mockColumnData);
      });

      expect(screen.getByText('Column testColumn')).toBeInTheDocument();
    });

    it('should render Close button', () => {
      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(mockColumnData);
      });

      // Get all Close buttons (X button and footer button)
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Column Data Display', () => {
    it('should display all data fields', () => {
      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(mockColumnData);
      });

      expect(screen.getByText('field1')).toBeInTheDocument();
      expect(screen.getByText('value1')).toBeInTheDocument();
      expect(screen.getByText('field2')).toBeInTheDocument();
      expect(screen.getByText('value2')).toBeInTheDocument();
      expect(screen.getByText('field3')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('field4')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
    });

    it('should display object values as JSON string', () => {
      const dataWithObject: ColumnData = {
        headerName: 'complexColumn',
        data: {
          nestedObject: { key: 'value', count: 42 },
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithObject);
      });

      expect(screen.getByText('nestedObject')).toBeInTheDocument();
      expect(screen.getByText('{"key":"value","count":42}')).toBeInTheDocument();
    });

    it('should display array values as JSON string', () => {
      const dataWithArray: ColumnData = {
        headerName: 'arrayColumn',
        data: {
          items: [1, 2, 3, 4, 5],
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithArray);
      });

      expect(screen.getByText('items')).toBeInTheDocument();
      expect(screen.getByText('[1,2,3,4,5]')).toBeInTheDocument();
    });

    it('should handle empty data object', () => {
      const emptyData: ColumnData = {
        headerName: 'emptyColumn',
        data: {},
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(emptyData);
      });

      expect(screen.getByText('Column emptyColumn')).toBeInTheDocument();
      // Should not render any sub-rows
      const subRows = document.querySelectorAll('.sub-row');
      expect(subRows.length).toBe(0);
    });
  });

  describe('Dialog Interaction', () => {
    it('should close dialog when Close button is clicked', async () => {
      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(mockColumnData);
      });

      expect(screen.getByText('Column testColumn')).toBeInTheDocument();

      // Get all Close buttons and click the footer button (last one)
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[closeButtons.length - 1]);

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Column testColumn')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when cancel button is clicked', async () => {
      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(mockColumnData);
      });

      expect(screen.getByText('Column testColumn')).toBeInTheDocument();

      // Get all Close buttons and click the X button (first one)
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[0]);

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Column testColumn')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple showDetail Calls', () => {
    it('should update data when showDetail is called multiple times', () => {
      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      // First call
      act(() => {
        ref.current?.showDetail(mockColumnData);
      });
      expect(screen.getByText('Column testColumn')).toBeInTheDocument();
      expect(screen.getByText('field1')).toBeInTheDocument();

      // Second call with different data
      const newData: ColumnData = {
        headerName: 'newColumn',
        data: {
          newField: 'newValue',
        },
      };

      act(() => {
        ref.current?.showDetail(newData);
      });
      expect(screen.getByText('Column newColumn')).toBeInTheDocument();
      expect(screen.getByText('newField')).toBeInTheDocument();
      expect(screen.getByText('newValue')).toBeInTheDocument();
      expect(screen.queryByText('field1')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const dataWithNull: ColumnData = {
        headerName: 'nullColumn',
        data: {
          nullField: null as any,
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithNull);
      });

      expect(screen.getByText('nullField')).toBeInTheDocument();
      expect(screen.getByText('null')).toBeInTheDocument();
    });

    it('should handle undefined values', () => {
      const dataWithUndefined: ColumnData = {
        headerName: 'undefinedColumn',
        data: {
          undefinedField: undefined as any,
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithUndefined);
      });

      expect(screen.getByText('undefinedField')).toBeInTheDocument();
      expect(screen.getByText('undefined')).toBeInTheDocument();
    });

    it('should handle special characters in field names', () => {
      const dataWithSpecialChars: ColumnData = {
        headerName: 'specialColumn',
        data: {
          'field-with-dash': 'value1',
          'field.with.dot': 'value2',
          'field_with_underscore': 'value3',
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithSpecialChars);
      });

      expect(screen.getByText('field-with-dash')).toBeInTheDocument();
      expect(screen.getByText('field.with.dot')).toBeInTheDocument();
      expect(screen.getByText('field_with_underscore')).toBeInTheDocument();
    });

    it('should handle very long field values', () => {
      const longValue = 'a'.repeat(1000);
      const dataWithLongValue: ColumnData = {
        headerName: 'longColumn',
        data: {
          longField: longValue,
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithLongValue);
      });

      expect(screen.getByText('longField')).toBeInTheDocument();
      expect(screen.getByText(longValue)).toBeInTheDocument();
    });

    it('should handle deeply nested objects', () => {
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };

      const dataWithDeepNesting: ColumnData = {
        headerName: 'deepColumn',
        data: {
          nested: deeplyNested,
        },
      };

      const ref = createRef<ColumnCollectionsDialogRef>();
      renderWithProviders(<ColumnCollectionsDialog ref={ref} />);

      act(() => {
        ref.current?.showDetail(dataWithDeepNesting);
      });

      expect(screen.getByText('nested')).toBeInTheDocument();
      expect(screen.getByText(JSON.stringify(deeplyNested))).toBeInTheDocument();
    });
  });
});


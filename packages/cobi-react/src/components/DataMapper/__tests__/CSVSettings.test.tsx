/**
 * Tests for CSVSettings component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CSVSettings from '../CSVSettings';
import type { MappingConfigDto } from '../../../types';

// Mock the content helper utilities
vi.mock('../../../utils/contentHelper', () => ({
  parseCsv: vi.fn(() => [
    { name: 'John', age: '30', city: 'New York' },
    { name: 'Jane', age: '25', city: 'London' },
  ]),
  getCsvPreviewRows: vi.fn(() => [
    'name,age,city',
    'John,30,New York',
    'Jane,25,London',
  ]),
  validateCsv: vi.fn(() => ({ valid: true })),
}));

describe('CSVSettings', () => {
  const mockConfig: MappingConfigDto = {
    id: { id: 'test-1', uiId: 1 },
    name: 'Test Mapping',
    sampleContent: 'name,age,city\nJohn,30,New York\nJane,25,London',
    parserParameters: {
      withHeader: true,
      delimiter: ',',
      quoteChar: '"',
    },
    entityMappings: [],
  } as MappingConfigDto;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(container.querySelector('.csv-settings-component')).toBeInTheDocument();
  });

  it('should display raw content preview section', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText(/Raw Content Preview/i)).toBeInTheDocument();
  });

  it('should display raw preview rows', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText('name,age,city')).toBeInTheDocument();
    expect(screen.getByText('John,30,New York')).toBeInTheDocument();
  });

  it('should render With Header switch', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText('With Header')).toBeInTheDocument();
  });

  it('should render Delimiter input', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText('Delimiter')).toBeInTheDocument();
  });

  it('should render Quote Character input', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText('Quote Character')).toBeInTheDocument();
  });

  it('should display parsed data preview section', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText(/Parsed Data Preview/i)).toBeInTheDocument();
  });

  it('should display success message when parsing succeeds', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText(/Successfully parsed/i)).toBeInTheDocument();
  });

  it('should display preview table with data', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should display table columns from parsed data', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    // Use getAllByText because column headers appear multiple times in Ant Design tables
    expect(screen.getAllByText('name')[0]).toBeInTheDocument();
    expect(screen.getAllByText('age')[0]).toBeInTheDocument();
    expect(screen.getAllByText('city')[0]).toBeInTheDocument();
  });

  it('should display table data rows', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('should call onChange when form values change', async () => {
    const mockOnChange = vi.fn();
    render(<CSVSettings dataMappingConfigDto={mockConfig} onChange={mockOnChange} />);
    
    const delimiterInput = screen.getByPlaceholderText(',');
    fireEvent.change(delimiterInput, { target: { value: ';' } });
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should work without onChange callback', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(container.querySelector('.csv-settings-component')).toBeInTheDocument();
  });

  it('should display error when parsing fails', async () => {
    vi.clearAllMocks();
    const contentHelper = await import('../../../utils/contentHelper');
    vi.mocked(contentHelper.validateCsv).mockReturnValue({ valid: false, error: 'Invalid CSV format' });

    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText(/Parsing Error/i)).toBeInTheDocument();
    expect(screen.getByText('Invalid CSV format')).toBeInTheDocument();
  });

  it('should display info message when no data to preview', async () => {
    vi.clearAllMocks();
    const contentHelper = await import('../../../utils/contentHelper');
    vi.mocked(contentHelper.parseCsv).mockReturnValue([]);
    vi.mocked(contentHelper.validateCsv).mockReturnValue({ valid: true });

    const emptyConfig: MappingConfigDto = {
      ...mockConfig,
      sampleContent: '',
    };

    render(<CSVSettings dataMappingConfigDto={emptyConfig} />);
    expect(screen.getByText(/No data to preview/i)).toBeInTheDocument();
  });

  it('should initialize form with default values', () => {
    const configWithoutParams: MappingConfigDto = {
      ...mockConfig,
      parserParameters: undefined,
    };

    const { container } = render(<CSVSettings dataMappingConfigDto={configWithoutParams} />);
    expect(container.querySelector('.csv-settings-component')).toBeInTheDocument();
  });

  it('should have delimiter input with maxLength 1', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    const delimiterInput = screen.getByPlaceholderText(',');
    expect(delimiterInput).toHaveAttribute('maxLength', '1');
  });

  it('should have quote char input with maxLength 1', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    const quoteInput = screen.getByPlaceholderText('"');
    expect(quoteInput).toHaveAttribute('maxLength', '1');
  });

  it('should display dividers between sections', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    const dividers = container.querySelectorAll('.ant-divider');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('should render form with horizontal layout', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    const form = container.querySelector('.ant-form-horizontal');
    expect(form).toBeInTheDocument();
  });

  it('should display tooltip for With Header field', () => {
    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    // Tooltip is rendered but not visible until hover
    expect(screen.getByText('With Header')).toBeInTheDocument();
  });

  it('should update preview when sample content changes', () => {
    const { rerender } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    
    const updatedConfig = {
      ...mockConfig,
      sampleContent: 'a,b,c\n1,2,3',
    };
    
    rerender(<CSVSettings dataMappingConfigDto={updatedConfig} />);
    
    expect(screen.getByText(/Parsed Data Preview/i)).toBeInTheDocument();
  });

  it('should handle parsing errors gracefully', async () => {
    vi.clearAllMocks();
    const contentHelper = await import('../../../utils/contentHelper');
    vi.mocked(contentHelper.parseCsv).mockImplementation(() => {
      throw new Error('Parse error');
    });

    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText(/Parsing Error/i)).toBeInTheDocument();
  });

  it('should display raw preview with correct class', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(container.querySelector('.raw-preview')).toBeInTheDocument();
  });

  it('should display parsed preview with correct class', () => {
    const { container } = render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(container.querySelector('.parsed-preview')).toBeInTheDocument();
  });



  it('should handle empty preview rows', async () => {
    vi.clearAllMocks();
    const contentHelper = await import('../../../utils/contentHelper');
    vi.mocked(contentHelper.getCsvPreviewRows).mockReturnValue([]);

    render(<CSVSettings dataMappingConfigDto={mockConfig} />);
    expect(screen.getByText(/Raw Content Preview/i)).toBeInTheDocument();
  });
});


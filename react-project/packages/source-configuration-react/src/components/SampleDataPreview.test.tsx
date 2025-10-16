/**
 * Tests for SampleDataPreview component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SampleDataPreview from './SampleDataPreview';

describe('SampleDataPreview', () => {
  it('should render empty state when no data provided', () => {
    render(<SampleDataPreview data={null} />);
    expect(screen.getByText('No sample data available')).toBeInTheDocument();
  });

  it('should render CSV format data', () => {
    const data = {
      columnNames: ['Name', 'Age', 'City'],
      rows: [
        ['John', '30', 'New York'],
        ['Jane', '25', 'Los Angeles'],
      ],
    };

    render(<SampleDataPreview data={data} />);
    
    expect(screen.getByText('Sample Data Preview')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('should render array of objects format data', () => {
    const data = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Los Angeles' },
    ];

    render(<SampleDataPreview data={data} />);
    
    expect(screen.getByText('Sample Data Preview')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('city')).toBeInTheDocument();
  });

  it('should limit rows to maxRows', () => {
    const data = {
      columnNames: ['Name'],
      rows: Array.from({ length: 20 }, (_, i) => [`Name ${i}`]),
    };

    render(<SampleDataPreview data={data} maxRows={5} />);
    
    expect(screen.getByText('Showing 5 of 20 rows')).toBeInTheDocument();
  });

  it('should show correct row count', () => {
    const data = {
      columnNames: ['Name', 'Age'],
      rows: [
        ['John', '30'],
        ['Jane', '25'],
        ['Bob', '35'],
      ],
    };

    render(<SampleDataPreview data={data} />);
    
    expect(screen.getByText('Showing 3 of 3 rows')).toBeInTheDocument();
  });

  it('should handle empty data array', () => {
    const data: any[] = [];

    render(<SampleDataPreview data={data} />);
    
    expect(screen.getByText('Sample Data Preview')).toBeInTheDocument();
  });

  it('should render table with correct structure', () => {
    const data = {
      columnNames: ['Col1', 'Col2'],
      rows: [['Val1', 'Val2']],
    };

    const { container } = render(<SampleDataPreview data={data} />);
    
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });
});


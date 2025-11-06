/**
 * Tests for BarChartStacked Component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BarChartStacked from '../BarChartStacked';

const mockResources = [
  { name: 'Resource 1', size: 100, available: 50 },
  { name: 'Resource 2', size: 200, available: 75 },
  { name: 'Resource 3', size: 150, available: 100 },
];

describe('BarChartStacked', () => {
  it('should render the chart', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    expect(getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render with default height', () => {
    const { container } = render(<BarChartStacked resources={mockResources} />);
    
    const chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '300px' });
  });

  it('should render with custom height', () => {
    const { container } = render(<BarChartStacked resources={mockResources} height={500} />);
    
    const chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '500px' });
  });

  it('should pass correct data to Bar chart', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toEqual(['Resource 1', 'Resource 2', 'Resource 3']);
    expect(chartData.datasets).toHaveLength(2);
  });

  it('should have Size dataset', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const sizeDataset = chartData.datasets[0];
    
    expect(sizeDataset.label).toBe('Size');
    expect(sizeDataset.backgroundColor).toBe('#3da3e8');
    expect(sizeDataset.data).toEqual([100, 200, 150]);
  });

  it('should have Available dataset', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const availableDataset = chartData.datasets[1];
    
    expect(availableDataset.label).toBe('Available');
    expect(availableDataset.backgroundColor).toBe('#fd6585');
    expect(availableDataset.data).toEqual([50, 75, 100]);
  });

  it('should have stacked scales', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.x.stacked).toBe(true);
    expect(chartOptions.scales.y.stacked).toBe(true);
  });

  it('should be responsive', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.responsive).toBe(true);
  });

  it('should not maintain aspect ratio', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.maintainAspectRatio).toBe(false);
  });

  it('should handle empty resources', () => {
    const { getByTestId } = render(<BarChartStacked resources={[]} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toEqual([]);
    expect(chartData.datasets[0].data).toEqual([]);
    expect(chartData.datasets[1].data).toEqual([]);
  });

  it('should handle undefined resources', () => {
    const { getByTestId } = render(<BarChartStacked />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toEqual([]);
  });

  it('should map resource names to labels', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toEqual(mockResources.map(r => r.name));
  });

  it('should map resource sizes to Size dataset', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual(mockResources.map(r => r.size));
  });

  it('should map resource available to Available dataset', () => {
    const { getByTestId } = render(<BarChartStacked resources={mockResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[1].data).toEqual(mockResources.map(r => r.available));
  });

  it('should handle single resource', () => {
    const singleResource = [{ name: 'Single', size: 100, available: 50 }];
    const { getByTestId } = render(<BarChartStacked resources={singleResource} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toEqual(['Single']);
    expect(chartData.datasets[0].data).toEqual([100]);
    expect(chartData.datasets[1].data).toEqual([50]);
  });

  it('should handle resources with zero values', () => {
    const zeroResources = [{ name: 'Zero', size: 0, available: 0 }];
    const { getByTestId } = render(<BarChartStacked resources={zeroResources} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual([0]);
    expect(chartData.datasets[1].data).toEqual([0]);
  });

  it('should update when resources change', () => {
    const { getByTestId, rerender } = render(<BarChartStacked resources={mockResources} />);
    
    let chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toHaveLength(3);
    
    const newResources = [{ name: 'New', size: 300, available: 150 }];
    rerender(<BarChartStacked resources={newResources} />);
    
    chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.labels).toEqual(['New']);
    expect(chartData.datasets[0].data).toEqual([300]);
  });

  it('should update when height changes', () => {
    const { container, rerender } = render(<BarChartStacked resources={mockResources} height={300} />);
    
    let chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '300px' });
    
    rerender(<BarChartStacked resources={mockResources} height={600} />);
    
    chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '600px' });
  });
});


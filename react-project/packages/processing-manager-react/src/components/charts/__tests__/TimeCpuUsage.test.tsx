/**
 * Tests for TimeCpuUsage Component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TimeCpuUsage from '../TimeCpuUsage';

const mockCpuData = [
  { t: 1609459200000, y: 25.5 },
  { t: 1609459260000, y: 30.2 },
  { t: 1609459320000, y: 28.7 },
];

describe('TimeCpuUsage', () => {
  it('should render the chart', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    expect(getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render with default height', () => {
    const { container } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '300px' });
  });

  it('should render with custom height', () => {
    const { container } = render(<TimeCpuUsage data={mockCpuData} height={500} />);
    
    const chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '500px' });
  });

  it('should pass correct data to Line chart', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets).toHaveLength(1);
    expect(chartData.datasets[0].data).toEqual(mockCpuData);
  });

  it('should have CPU % label', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].label).toBe('CPU %');
  });

  it('should have correct colors', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const dataset = chartData.datasets[0];
    
    expect(dataset.backgroundColor).toBe('rgba(54, 131, 220, .5)');
    expect(dataset.borderColor).toBe('rgba(54, 131, 220, 1)');
  });

  it('should not fill area under line', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].fill).toBe(false);
  });

  it('should have zero tension for straight lines', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].tension).toBe(0);
  });

  it('should be responsive', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.responsive).toBe(true);
  });

  it('should not maintain aspect ratio', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.maintainAspectRatio).toBe(false);
  });

  it('should have time scale on x-axis', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.x.type).toBe('time');
  });

  it('should hide legend', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.plugins.legend.display).toBe(false);
  });

  it('should have zero animation duration', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.animation.duration).toBe(0);
  });

  it('should hide x-axis grid', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.x.grid.display).toBe(false);
  });

  it('should have dashed y-axis grid', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.y.grid.borderDash).toEqual([3, 6]);
  });

  it('should begin y-axis at zero', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.y.ticks.beginAtZero).toBe(true);
  });

  it('should handle empty data', () => {
    const { getByTestId } = render(<TimeCpuUsage data={[]} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual([]);
  });

  it('should handle undefined data', () => {
    const { getByTestId } = render(<TimeCpuUsage />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual([]);
  });

  it('should have custom tooltip styling', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    const tooltip = chartOptions.plugins.tooltip;
    
    expect(tooltip.backgroundColor).toBe('#fbfbfb');
    expect(tooltip.bodyColor).toBe('#32363C');
    expect(tooltip.borderColor).toBe('#999');
    expect(tooltip.displayColors).toBe(false);
  });

  it('should have time display formats', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    const timeFormats = chartOptions.scales.x.time.displayFormats;
    
    expect(timeFormats.hour).toBe('HH:00');
    expect(timeFormats.minute).toBe('HH:00');
  });

  it('should have auto-skip ticks', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    const ticks = chartOptions.scales.x.ticks;
    
    expect(ticks.autoSkip).toBe(true);
    expect(ticks.autoSkipPadding).toBe(75);
  });

  it('should update when data changes', () => {
    const { getByTestId, rerender } = render(<TimeCpuUsage data={mockCpuData} />);
    
    let chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toHaveLength(3);
    
    const newData = [{ t: 1609459200000, y: 50 }];
    rerender(<TimeCpuUsage data={newData} />);
    
    chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual(newData);
  });

  it('should have point hit radius for better interaction', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].pointHitRadius).toBe(10);
  });

  it('should have zero point radius for cleaner look', () => {
    const { getByTestId } = render(<TimeCpuUsage data={mockCpuData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].pointRadius).toBe(0);
  });
});


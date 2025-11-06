/**
 * Tests for TimeDiskIO Component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TimeDiskIO from '../TimeDiskIO';

const mockIOData = [
  { t: 1609459200000, y: 500 },
  { t: 1609459260000, y: 750 },
  { t: 1609459320000, y: 1200 },
];

const mockSwapData = [
  { t: 1609459200000, y: 100 },
  { t: 1609459260000, y: 150 },
  { t: 1609459320000, y: 200 },
];

describe('TimeDiskIO', () => {
  it('should render the chart', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    expect(getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render with default height', () => {
    const { container } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '300px' });
  });

  it('should render with custom height', () => {
    const { container } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} height={500} />);
    
    const chartContainer = container.querySelector('div[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '500px' });
  });

  it('should have two datasets', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets).toHaveLength(2);
  });

  it('should have Disk I/O dataset', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const diskDataset = chartData.datasets[0];
    
    expect(diskDataset.label).toBe('Disk I/O');
    expect(diskDataset.data).toEqual(mockIOData);
  });

  it('should have Swap I/O dataset', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const swapDataset = chartData.datasets[1];
    
    expect(swapDataset.label).toBe('Swap I/O');
    expect(swapDataset.data).toEqual(mockSwapData);
  });

  it('should have correct colors for Disk I/O', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const diskDataset = chartData.datasets[0];
    
    expect(diskDataset.backgroundColor).toBe('rgba(255, 209, 0, .5)');
    expect(diskDataset.borderColor).toBe('rgba(255, 209, 0, 1)');
  });

  it('should have correct colors for Swap I/O', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    const swapDataset = chartData.datasets[1];
    
    expect(swapDataset.backgroundColor).toBe('rgba(204, 1, 153, .5)');
    expect(swapDataset.borderColor).toBe('rgba(204, 1, 153, 1)');
  });

  it('should not fill area under lines', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].fill).toBe(false);
    expect(chartData.datasets[1].fill).toBe(false);
  });

  it('should have zero tension for straight lines', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].tension).toBe(0);
    expect(chartData.datasets[1].tension).toBe(0);
  });

  it('should be responsive', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.responsive).toBe(true);
  });

  it('should not maintain aspect ratio', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.maintainAspectRatio).toBe(false);
  });

  it('should have time scale on x-axis', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.x.type).toBe('time');
  });

  it('should hide legend', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.plugins.legend.display).toBe(false);
  });

  it('should have zero animation duration', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.animation.duration).toBe(0);
  });

  it('should hide x-axis grid', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.x.grid.display).toBe(false);
  });

  it('should have dashed y-axis grid', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.y.grid.borderDash).toEqual([3, 6]);
  });

  it('should begin y-axis at zero', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.y.ticks.beginAtZero).toBe(true);
  });

  it('should have y-axis tick callback for formatting', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);

    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    expect(chartOptions.scales.y.ticks.callback).toBe('__FUNCTION__');
  });

  it('should handle empty ioData', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={[]} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual([]);
  });

  it('should handle empty swapData', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={[]} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[1].data).toEqual([]);
  });

  it('should handle undefined ioData', () => {
    const { getByTestId } = render(<TimeDiskIO swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual([]);
  });

  it('should handle undefined swapData', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[1].data).toEqual([]);
  });

  it('should have custom tooltip styling', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    const tooltip = chartOptions.plugins.tooltip;
    
    expect(tooltip.backgroundColor).toBe('#fbfbfb');
    expect(tooltip.bodyColor).toBe('#32363C');
    expect(tooltip.borderColor).toBe('#999');
    expect(tooltip.displayColors).toBe(false);
  });

  it('should have time display formats', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    const timeFormats = chartOptions.scales.x.time.displayFormats;
    
    expect(timeFormats.hour).toBe('HH:00');
    expect(timeFormats.minute).toBe('HH:00');
  });

  it('should have auto-skip ticks', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartOptions = JSON.parse(getByTestId('chart-options').textContent || '{}');
    const ticks = chartOptions.scales.x.ticks;
    
    expect(ticks.autoSkip).toBe(true);
    expect(ticks.autoSkipPadding).toBe(75);
  });

  it('should update when ioData changes', () => {
    const { getByTestId, rerender } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    let chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toHaveLength(3);
    
    const newIOData = [{ t: 1609459200000, y: 1000 }];
    rerender(<TimeDiskIO ioData={newIOData} swapData={mockSwapData} />);
    
    chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].data).toEqual(newIOData);
  });

  it('should update when swapData changes', () => {
    const { getByTestId, rerender } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    let chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[1].data).toHaveLength(3);
    
    const newSwapData = [{ t: 1609459200000, y: 500 }];
    rerender(<TimeDiskIO ioData={mockIOData} swapData={newSwapData} />);
    
    chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[1].data).toEqual(newSwapData);
  });

  it('should have point hit radius for better interaction', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].pointHitRadius).toBe(10);
    expect(chartData.datasets[1].pointHitRadius).toBe(10);
  });

  it('should have zero point radius for cleaner look', () => {
    const { getByTestId } = render(<TimeDiskIO ioData={mockIOData} swapData={mockSwapData} />);
    
    const chartData = JSON.parse(getByTestId('chart-data').textContent || '{}');
    expect(chartData.datasets[0].pointRadius).toBe(0);
    expect(chartData.datasets[1].pointRadius).toBe(0);
  });
});


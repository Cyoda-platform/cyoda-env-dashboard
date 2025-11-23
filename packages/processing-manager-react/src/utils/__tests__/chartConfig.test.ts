/**
 * Tests for chartConfig utility
 */

import { describe, it, expect } from 'vitest';
import {
  defaultChartOptions,
  barChartOptions,
  chartColors,
  formatChartTimestamp,
  formatChartValue,
  formatBytes,
} from '../chartConfig';

describe('chartConfig', () => {
  describe('defaultChartOptions', () => {
    it('should have responsive set to true', () => {
      expect(defaultChartOptions.responsive).toBe(true);
    });

    it('should have maintainAspectRatio set to false', () => {
      expect(defaultChartOptions.maintainAspectRatio).toBe(false);
    });

    it('should have legend position set to top', () => {
      expect(defaultChartOptions.plugins?.legend?.position).toBe('top');
    });

    it('should have legend labels with usePointStyle', () => {
      expect(defaultChartOptions.plugins?.legend?.labels?.usePointStyle).toBe(true);
    });

    it('should have tooltip mode set to index', () => {
      expect(defaultChartOptions.plugins?.tooltip?.mode).toBe('index');
    });

    it('should have tooltip intersect set to false', () => {
      expect(defaultChartOptions.plugins?.tooltip?.intersect).toBe(false);
    });

    it('should have y-axis beginAtZero set to true', () => {
      expect(defaultChartOptions.scales?.y?.beginAtZero).toBe(true);
    });

    it('should have x-axis grid display set to false', () => {
      expect(defaultChartOptions.scales?.x?.grid?.display).toBe(false);
    });

    it('should have interaction mode set to nearest', () => {
      expect(defaultChartOptions.interaction?.mode).toBe('nearest');
    });
  });

  describe('barChartOptions', () => {
    it('should have responsive set to true', () => {
      expect(barChartOptions.responsive).toBe(true);
    });

    it('should have maintainAspectRatio set to false', () => {
      expect(barChartOptions.maintainAspectRatio).toBe(false);
    });

    it('should have stacked x-axis', () => {
      expect(barChartOptions.scales?.x?.stacked).toBe(true);
    });

    it('should have stacked y-axis', () => {
      expect(barChartOptions.scales?.y?.stacked).toBe(true);
    });

    it('should have y-axis beginAtZero set to true', () => {
      expect(barChartOptions.scales?.y?.beginAtZero).toBe(true);
    });

    it('should have legend position set to top', () => {
      expect(barChartOptions.plugins?.legend?.position).toBe('top');
    });
  });

  describe('chartColors', () => {
    it('should have primary color', () => {
      expect(chartColors.primary).toBe('rgba(24, 144, 255, 1)');
    });

    it('should have primaryLight color', () => {
      expect(chartColors.primaryLight).toBe('rgba(24, 144, 255, 0.2)');
    });

    it('should have success color', () => {
      expect(chartColors.success).toBe('rgba(82, 196, 26, 1)');
    });

    it('should have successLight color', () => {
      expect(chartColors.successLight).toBe('rgba(82, 196, 26, 0.2)');
    });

    it('should have warning color', () => {
      expect(chartColors.warning).toBe('rgba(250, 173, 20, 1)');
    });

    it('should have warningLight color', () => {
      expect(chartColors.warningLight).toBe('rgba(250, 173, 20, 0.2)');
    });

    it('should have error color', () => {
      expect(chartColors.error).toBe('rgba(255, 77, 79, 1)');
    });

    it('should have errorLight color', () => {
      expect(chartColors.errorLight).toBe('rgba(255, 77, 79, 0.2)');
    });

    it('should have purple color', () => {
      expect(chartColors.purple).toBe('rgba(114, 46, 209, 1)');
    });

    it('should have purpleLight color', () => {
      expect(chartColors.purpleLight).toBe('rgba(114, 46, 209, 0.2)');
    });

    it('should have cyan color', () => {
      expect(chartColors.cyan).toBe('rgba(19, 194, 194, 1)');
    });

    it('should have cyanLight color', () => {
      expect(chartColors.cyanLight).toBe('rgba(19, 194, 194, 0.2)');
    });
  });

  describe('formatChartTimestamp', () => {
    it('should format timestamp string to time', () => {
      const timestamp = '2024-01-15T10:30:00Z';
      const result = formatChartTimestamp(timestamp);
      
      // Result will vary based on timezone, so just check format
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it('should format timestamp number to time', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z').getTime();
      const result = formatChartTimestamp(timestamp);
      
      // Result will vary based on timezone, so just check format
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it('should handle different timestamps', () => {
      const timestamp1 = '2024-01-15T08:00:00Z';
      const timestamp2 = '2024-01-15T20:45:00Z';
      
      const result1 = formatChartTimestamp(timestamp1);
      const result2 = formatChartTimestamp(timestamp2);
      
      expect(result1).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
      expect(result2).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });
  });

  describe('formatChartValue', () => {
    it('should format number without unit', () => {
      expect(formatChartValue(123.456)).toBe('123.46');
    });

    it('should format number with 2 decimal places', () => {
      expect(formatChartValue(100)).toBe('100.00');
    });

    it('should format bytes unit', () => {
      expect(formatChartValue(1024, 'bytes')).toBe('1 KB');
    });

    it('should format large bytes value', () => {
      expect(formatChartValue(1048576, 'bytes')).toBe('1 MB');
    });

    it('should format percentage unit', () => {
      expect(formatChartValue(75.5, 'percentage')).toBe('75.50%');
    });

    it('should format percentage with decimals', () => {
      expect(formatChartValue(99.999, 'percentage')).toBe('100.00%');
    });

    it('should handle zero value', () => {
      expect(formatChartValue(0)).toBe('0.00');
    });

    it('should handle negative values', () => {
      expect(formatChartValue(-50.25)).toBe('-50.25');
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes (< 1024)', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format KB', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format KB with decimals', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format MB', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('should format MB with decimals', () => {
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });

    it('should format GB', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should format GB with decimals', () => {
      expect(formatBytes(1610612736)).toBe('1.5 GB');
    });

    it('should format TB', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('should format large values correctly', () => {
      expect(formatBytes(5368709120)).toBe('5 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatBytes(1234567)).toBe('1.18 MB');
    });

    it('should handle very small KB values', () => {
      expect(formatBytes(1100)).toBe('1.07 KB');
    });
  });
});


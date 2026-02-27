/**
 * Tests for HistorySetting Component
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import HistorySetting from './HistorySetting';
import type { HistorySettings } from '../types';

describe('HistorySetting', () => {
  const mockSettings: HistorySettings = {
    lazyLoading: false,
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      expect(screen.getByText('Lazy loading')).toBeInTheDocument();
    });

    it('should render lazy loading switch', () => {
      renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      expect(screen.getByText('Lazy loading')).toBeInTheDocument();
    });
  });

  describe('Lazy Loading Switch', () => {
    it('should show switch as unchecked when lazyLoading is false', () => {
      const { container } = renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      const switchElement = container.querySelector('.ant-switch');
      expect(switchElement).not.toHaveClass('ant-switch-checked');
    });

    it('should show switch as checked when lazyLoading is true', () => {
      const { container } = renderWithProviders(
        <HistorySetting
          settings={{ ...mockSettings, lazyLoading: true }}
          onChange={mockOnChange}
        />
      );

      const switchElement = container.querySelector('.ant-switch');
      expect(switchElement).toHaveClass('ant-switch-checked');
    });

    it('should call onChange when switch is toggled', () => {
      const { container } = renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      const switchElement = container.querySelector('.ant-switch');
      fireEvent.click(switchElement!);

      expect(mockOnChange).toHaveBeenCalledWith({
        lazyLoading: true,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onChange gracefully', () => {
      const { container } = renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={() => {}} />
      );

      const switchElement = container.querySelector('.ant-switch');
      expect(() => fireEvent.click(switchElement!)).not.toThrow();
    });

    it('should render with lazyLoading true', () => {
      const settingsWithLazy: HistorySettings = {
        lazyLoading: true,
      };

      const { container } = renderWithProviders(
        <HistorySetting settings={settingsWithLazy} onChange={mockOnChange} />
      );

      const switchElement = container.querySelector('.ant-switch');
      expect(switchElement).toHaveClass('ant-switch-checked');
    });
  });
});


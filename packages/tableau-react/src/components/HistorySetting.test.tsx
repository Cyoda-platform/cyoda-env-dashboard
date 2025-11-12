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
    displayGroupType: 'in',
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

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render lazy loading switch', () => {
      renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      expect(screen.getByText('Lazy loading')).toBeInTheDocument();
    });

    it('should render group display radio buttons', () => {
      renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      expect(screen.getByText('Group display')).toBeInTheDocument();
      expect(screen.getByText('In Table')).toBeInTheDocument();
      expect(screen.getByText('Out Table')).toBeInTheDocument();
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
        displayGroupType: 'out',
      });
    });
  });

  describe('Group Display Radio Buttons', () => {
    it('should show "In Table" as selected by default', () => {
      renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      const inButton = screen.getByText('In Table').closest('.ant-radio-button-wrapper');
      expect(inButton).toHaveClass('ant-radio-button-wrapper-checked');
    });

    it('should show "Out Table" as selected when displayGroupType is "out"', () => {
      renderWithProviders(
        <HistorySetting
          settings={{ ...mockSettings, displayGroupType: 'out' }}
          onChange={mockOnChange}
        />
      );

      const outButton = screen.getByText('Out Table').closest('.ant-radio-button-wrapper');
      expect(outButton).toHaveClass('ant-radio-button-wrapper-checked');
    });

    it('should call onChange when "In Table" is clicked', () => {
      renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      const inButton = screen.getByText('In Table');
      fireEvent.click(inButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        lazyLoading: false,
        displayGroupType: 'in',
      });
    });

    it('should call onChange when "Out Table" is clicked', () => {
      renderWithProviders(
        <HistorySetting
          settings={{ ...mockSettings, displayGroupType: 'in' }}
          onChange={mockOnChange}
        />
      );

      const outButton = screen.getByText('Out Table');
      fireEvent.click(outButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        lazyLoading: false,
        displayGroupType: 'out',
      });
    });
  });

  describe('Combined Settings Changes', () => {
    it('should handle multiple setting changes', () => {
      const { container, rerender } = renderWithProviders(
        <HistorySetting settings={mockSettings} onChange={mockOnChange} />
      );

      // Toggle lazy loading
      const switchElement = container.querySelector('.ant-switch');
      fireEvent.click(switchElement!);

      expect(mockOnChange).toHaveBeenCalledWith({
        lazyLoading: true,
        displayGroupType: 'out',
      });

      // Update settings
      const newSettings = { lazyLoading: true, displayGroupType: 'out' as const };
      rerender(<HistorySetting settings={newSettings} onChange={mockOnChange} />);

      // Change display group type
      const inButton = screen.getByText('In Table');
      fireEvent.click(inButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        lazyLoading: true,
        displayGroupType: 'in',
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

    it('should render with minimal settings', () => {
      const minimalSettings: HistorySettings = {
        lazyLoading: false,
        displayGroupType: 'out',
      };

      renderWithProviders(
        <HistorySetting settings={minimalSettings} onChange={mockOnChange} />
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});


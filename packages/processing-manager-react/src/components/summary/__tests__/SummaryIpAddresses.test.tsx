/**
 * SummaryIpAddresses Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import { SummaryIpAddresses } from '../SummaryIpAddresses';

// Mock useParams
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('SummaryIpAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ name: '10.233.75.58' });
  });

  describe('Rendering', () => {
    it('should render IP Addresses card', () => {
      render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      expect(screen.getByText('IP Addresses')).toBeInTheDocument();
    });

    it('should render IP address from URL params', () => {
      render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      expect(screen.getByText('10.233.75.58')).toBeInTheDocument();
    });

    it('should render copy icon', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.anticon-copy');
      expect(copyIcon).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      expect(container.querySelector('.summary-ip-card')).toBeInTheDocument();
    });

    it('should render IP addresses list', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      expect(container.querySelector('.ip-addresses-list')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('should copy IP address to clipboard when clicking copy icon', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.anticon-copy');
      fireEvent.click(copyIcon!);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith('10.233.75.58');
      });
    });

    it('should show success message after copying', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.anticon-copy');
      fireEvent.click(copyIcon!);

      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('IP address 10.233.75.58 was copied');
      });
    });

    it('should show error message when copy fails', async () => {
      // Mock clipboard API to fail
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Copy failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.anticon-copy');
      fireEvent.click(copyIcon!);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('IP address 10.233.75.58 NOT was copied');
      });
    });

    it('should handle missing clipboard API gracefully', async () => {
      // Remove clipboard API
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.anticon-copy');
      fireEvent.click(copyIcon!);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalled();
      });

      // Restore clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
      });
    });
  });

  describe('Multiple IP Addresses', () => {
    it('should render single IP address', () => {
      mockUseParams.mockReturnValue({ name: '192.168.1.1' });

      render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });

    it('should handle empty IP address', () => {
      mockUseParams.mockReturnValue({ name: '' });

      render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      // Should still render the card
      expect(screen.getByText('IP Addresses')).toBeInTheDocument();
    });

    it('should handle undefined name param', () => {
      mockUseParams.mockReturnValue({});

      render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      // Should still render the card
      expect(screen.getByText('IP Addresses')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have copy icon with correct class', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.copy-icon');
      expect(copyIcon).toBeInTheDocument();
      expect(copyIcon).toHaveClass('anticon-copy');
    });

    it('should render IP in list item', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const listItems = container.querySelectorAll('.ip-addresses-list li');
      expect(listItems).toHaveLength(1);
    });

    it('should have margin bottom style', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const card = container.querySelector('.summary-ip-card');
      expect(card).toHaveStyle({ marginBottom: '16px' });
    });
  });

  describe('Accessibility', () => {
    it('should have clickable copy icon', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const copyIcon = container.querySelector('.copy-icon');
      expect(copyIcon).toBeInTheDocument();
      
      // Icon should be clickable
      fireEvent.click(copyIcon!);
      // No error should be thrown
    });

    it('should display IP as text', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryIpAddresses />
        </BrowserRouter>
      );

      const text = container.querySelector('.ant-typography');
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toBe('10.233.75.58');
    });
  });
});


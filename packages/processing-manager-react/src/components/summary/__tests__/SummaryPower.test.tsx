/**
 * SummaryPower Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SummaryPower } from '../SummaryPower';
import * as stores from '../../../stores';

// Mock stores
vi.mock('../../../stores', () => ({
  useProcessingStore: vi.fn(),
  useGrafanaStore: vi.fn(),
}));

// Mock useParams
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

describe('SummaryPower', () => {
  const mockLoadUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ name: 'test-node' });
    
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodesProcessing: [] })
    );
    
    (stores.useGrafanaStore as any).mockImplementation((selector: any) =>
      selector({ loadUp: mockLoadUp })
    );
  });

  describe('Rendering', () => {
    it('should render Power card', () => {
      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      expect(screen.getByText('Power')).toBeInTheDocument();
    });

    it('should render with Unknown status by default', () => {
      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      expect(container.querySelector('.summary-power-card')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display Running status when server is up', async () => {
      mockLoadUp.mockResolvedValue(true);

      const mockNodes = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.58:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Running')).toBeInTheDocument();
      });
    });

    it('should display Stop status when server is down', async () => {
      mockLoadUp.mockResolvedValue(false);

      const mockNodes = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.58:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
    });

    it('should display Unknown status when loadUp fails', async () => {
      mockLoadUp.mockRejectedValue(new Error('Failed to load'));

      const mockNodes = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.58:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Unknown')).toBeInTheDocument();
      });
    });

    it('should display Unknown status when node has no grafana config', async () => {
      const mockNodes = [
        {
          hostname: 'test-node',
          // No grafana property
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Unknown')).toBeInTheDocument();
      });

      expect(mockLoadUp).not.toHaveBeenCalled();
    });

    it('should display Unknown status when node is not found', async () => {
      const mockNodes = [
        {
          hostname: 'other-node',
          grafana: {
            instance: '10.233.75.59:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Unknown')).toBeInTheDocument();
      });

      expect(mockLoadUp).not.toHaveBeenCalled();
    });
  });

  describe('Grafana Integration', () => {
    it('should call loadUp with correct grafana config', async () => {
      mockLoadUp.mockResolvedValue(true);

      const mockGrafanaConfig = {
        instance: '10.233.75.58:9100',
        job: 'node',
      };

      const mockNodes = [
        {
          hostname: 'test-node',
          grafana: mockGrafanaConfig,
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockLoadUp).toHaveBeenCalledWith(mockGrafanaConfig);
      });
    });

    it('should reload status when nodes change', async () => {
      mockLoadUp.mockResolvedValue(true);

      const mockNodes1 = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.58:9100',
            job: 'node',
          },
        },
      ];

      // Setup initial nodes
      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes1 })
      );

      const { rerender } = render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockLoadUp).toHaveBeenCalledTimes(1);
      });

      // Change nodes
      const mockNodes2 = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.59:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes2 })
      );

      rerender(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockLoadUp).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Tag Colors', () => {
    it('should render Running tag with success color', async () => {
      mockLoadUp.mockResolvedValue(true);

      const mockNodes = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.58:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      const { container } = render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        const tag = container.querySelector('.ant-tag-success');
        expect(tag).toBeInTheDocument();
        expect(tag?.textContent).toBe('Running');
      });
    });

    it('should render Stop tag with error color', async () => {
      mockLoadUp.mockResolvedValue(false);

      const mockNodes = [
        {
          hostname: 'test-node',
          grafana: {
            instance: '10.233.75.58:9100',
            job: 'node',
          },
        },
      ];

      (stores.useProcessingStore as any).mockImplementation((selector: any) =>
        selector({ nodesProcessing: mockNodes })
      );

      const { container } = render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      await waitFor(() => {
        const tag = container.querySelector('.ant-tag-error');
        expect(tag).toBeInTheDocument();
        expect(tag?.textContent).toBe('Stop');
      });
    });

    it('should render Unknown tag with default color', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryPower />
        </BrowserRouter>
      );

      const tag = container.querySelector('.ant-tag-default');
      expect(tag).toBeInTheDocument();
      expect(tag?.textContent).toBe('Unknown');
    });
  });
});


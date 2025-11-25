/**
 * Tests for ShardsDetailTabCachesList Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShardsDetailTabCachesList from '../ShardsDetailTabCachesList';
import type { ReactNode } from 'react';
import * as hooks from '../../../hooks/usePlatformCommon';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useCachesList: vi.fn(),
  useInvalidateCache: vi.fn(),
}));

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

// Mock fetch
global.fetch = vi.fn();

const mockCachesData = [
  {
    cache: 'COMPOSITE-INDEX-CACHE',
    cacheServiceClass: 'com.cyoda.service.services.index.CompositeIndexCacheService',
    size: 16,
    lastInvalidateAllTime: '2025-11-12T06:41:58.000Z',
    lastInvalidateKeyTime: '2025-11-21T09:20:14.000Z',
  },
  {
    cache: 'LEGAL_ENTITY',
    cacheServiceClass: 'com.cyoda.service.services.cache.LegalEntityCacheService',
    size: 1,
    lastInvalidateAllTime: '2025-11-12T06:41:58.000Z',
    lastInvalidateKeyTime: null,
  },
];

const mockCacheKeys = ['key1', 'key2', 'key3'];

describe('ShardsDetailTabCachesList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create fresh query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
        },
      },
    });

    // Mock useCachesList hook
    vi.mocked(hooks.useCachesList).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // Mock useInvalidateCache hook
    vi.mocked(hooks.useInvalidateCache).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    // Mock fetch
    (global.fetch as any).mockResolvedValue({
      json: async () => mockCacheKeys,
    });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  // Wrapper component
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Basic Rendering', () => {
    it('should render the component', () => {
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      expect(container.querySelector('.shards-detail-tab-caches-list')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<ShardsDetailTabCachesList />, { wrapper });

      expect(screen.getByText('Caches List')).toBeInTheDocument();
    });

    it('should render table', () => {
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      expect(container.querySelector('.ant-table')).toBeInTheDocument();
    });

    it('should not render card component', () => {
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const card = container.querySelector('.ant-card');
      expect(card).not.toBeInTheDocument();
    });

    it('should render without errors', () => {
      expect(() => render(<ShardsDetailTabCachesList />, { wrapper })).not.toThrow();
    });
  });

  describe('Data Loading and Display', () => {
    it('should show loading state', () => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      } as any);

      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    });

    it('should display cache data when loaded', () => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<ShardsDetailTabCachesList />, { wrapper });

      expect(screen.getByText('COMPOSITE-INDEX-CACHE')).toBeInTheDocument();
      expect(screen.getByText('LEGAL_ENTITY')).toBeInTheDocument();
    });

    it('should display cache service class', () => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<ShardsDetailTabCachesList />, { wrapper });

      expect(screen.getByText('com.cyoda.service.services.index.CompositeIndexCacheService')).toBeInTheDocument();
    });

    it('should display cache size', () => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      // Check for size values in table cells
      const tableCells = container.querySelectorAll('.ant-table-cell');
      const sizeValues = Array.from(tableCells).map(cell => cell.textContent);

      expect(sizeValues).toContain('16');
      expect(sizeValues).toContain('1');
    });

    it('should show error alert when API fails', () => {
      const mockError = new Error('API Error');
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: [],
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      } as any);

      render(<ShardsDetailTabCachesList />, { wrapper });

      expect(screen.getByText(/Failed to load caches list/i)).toBeInTheDocument();
    });
  });

  describe('Table Features', () => {
    beforeEach(() => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);
    });

    it('should render table with correct columns', () => {
      render(<ShardsDetailTabCachesList />, { wrapper });

      expect(screen.getByText('Cache')).toBeInTheDocument();
      expect(screen.getByText('Cache Service Class')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Last Invalidate All Time')).toBeInTheDocument();
      expect(screen.getByText('Last Invalidate Key Time')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render expand icons', () => {
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const expandIcons = container.querySelectorAll('.anticon-right');
      expect(expandIcons.length).toBeGreaterThan(0);
    });

    it('should have pagination', () => {
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      expect(container.querySelector('.ant-pagination')).toBeInTheDocument();
    });

    it('should display total count in pagination', () => {
      render(<ShardsDetailTabCachesList />, { wrapper });

      expect(screen.getByText(/Total 2/i)).toBeInTheDocument();
    });
  });

  describe('Invalidate Cache Functionality', () => {
    it('should render invalidate buttons', () => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const invalidateButtons = container.querySelectorAll('.anticon-sync');
      expect(invalidateButtons.length).toBe(2);
    });

    it('should call invalidate mutation when button clicked', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      const mockRefetch = vi.fn();

      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      vi.mocked(hooks.useInvalidateCache).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as any);

      const user = userEvent.setup();
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const invalidateButtons = container.querySelectorAll('.anticon-sync');
      await user.click(invalidateButtons[0].closest('button')!);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith('COMPOSITE-INDEX-CACHE');
      });
    });

    it('should show tooltip on invalidate button hover', async () => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const user = userEvent.setup();
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const invalidateButton = container.querySelector('.anticon-sync')?.closest('button');
      if (invalidateButton) {
        await user.hover(invalidateButton);

        await waitFor(() => {
          const tooltip = document.querySelector('.ant-tooltip');
          expect(tooltip).toBeInTheDocument();
        });
      }
    });
  });

  describe('Expand Functionality', () => {
    beforeEach(() => {
      vi.mocked(hooks.useCachesList).mockReturnValue({
        data: mockCachesData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);
    });

    it('should fetch cache keys when row is expanded', async () => {
      const user = userEvent.setup();
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const expandIcons = container.querySelectorAll('.anticon-right');
      await user.click(expandIcons[0] as HTMLElement);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/platform-common/cache-info/cache-keys?cacheType=COMPOSITE-INDEX-CACHE')
        );
      });
    });

    it('should display cache keys after expansion', async () => {
      const user = userEvent.setup();
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const expandIcons = container.querySelectorAll('.anticon-right');
      await user.click(expandIcons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('key1')).toBeInTheDocument();
        expect(screen.getByText('key2')).toBeInTheDocument();
        expect(screen.getByText('key3')).toBeInTheDocument();
      });
    });

    it('should change icon to down when expanded', async () => {
      const user = userEvent.setup();
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const expandIcon = container.querySelector('.anticon-right') as HTMLElement;
      await user.click(expandIcon);

      await waitFor(() => {
        expect(container.querySelector('.anticon-down')).toBeInTheDocument();
      });
    });

    it('should not fetch keys again if already loaded', async () => {
      const user = userEvent.setup();
      const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

      const expandIcon = container.querySelector('.anticon-right') as HTMLElement;

      // First expand
      await user.click(expandIcon);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Collapse
      const collapseIcon = container.querySelector('.anticon-down') as HTMLElement;
      await user.click(collapseIcon);

      // Expand again
      const expandIconAgain = container.querySelector('.anticon-right') as HTMLElement;
      await user.click(expandIconAgain);

      // Should still be called only once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
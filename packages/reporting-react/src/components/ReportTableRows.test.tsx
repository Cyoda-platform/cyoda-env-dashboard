/**
 * ReportTableRows Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import ReportTableRows from './ReportTableRows';
import type { ConfigDefinition } from '@/types';
import { axios as httpApiAxios } from '@cyoda/http-api-react';

// Mock axios
vi.mock('axios');

// Mock http-api-react with all necessary exports
vi.mock('@cyoda/http-api-react', () => {
  // Create mock axios instance with interceptors inside the mock
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    axios: mockAxiosInstance,
    axiosPlatform: mockAxiosInstance,
    axiosPublic: mockAxiosInstance,
    axiosProcessing: mockAxiosInstance,
    axiosGrafana: mockAxiosInstance,
    axiosAI: mockAxiosInstance,
    useGlobalUiSettingsStore: vi.fn(() => ({
      dateFormat: 'YYYY.MM.DD',
      timeFormat: 'HH:mm:ss',
    })),
    getReportConfig: vi.fn(),
    getReportingFetchTypes: vi.fn(),
    getHistory: vi.fn(),
  };
});

// Get mocked axios instance
const mockedHttpApiAxios = vi.mocked(httpApiAxios);

describe('ReportTableRows', () => {
  const mockConfigDefinition: ConfigDefinition = {
    id: 'config-1',
    description: 'Test Report',
    columns: [
      { name: 'user.name' },
      { name: 'user.email' },
      { name: 'amount' },
    ],
  };

  const mockReportData = {
    _embedded: {
      reportRows: [
        {
          content: {
            user: { name: 'John Doe', email: 'john@example.com' },
            amount: 1000,
          },
        },
        {
          content: {
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            amount: 2000,
          },
        },
      ],
    },
    page: {
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Loading', () => {
    it('should load report data from API', async () => {
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalledWith(
          '/api/report/123/rows?size=100000'
        );
      });
    });

    it('should load with lazy loading enabled', async () => {
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={true}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalledWith(
          '/api/report/123/rows?size=10'
        );
      });
    });

    it('should not load data when tableLinkRows is empty', async () => {
      render(
        <ReportTableRows
          tableLinkRows=""
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).not.toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedHttpApiAxios.get.mockRejectedValueOnce(new Error('API Error'));

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'ReportTableRows: Failed to load report rows:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('Data Transformation', () => {
    it('should flatten nested objects', async () => {
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/123/rows?size=100000');
      });
    });

    it('should handle arrays in data', async () => {
      const dataWithArrays = {
        _embedded: {
          reportRows: [
            {
              content: {
                user: { name: 'John', tags: ['admin', 'user'] },
              },
            },
          ],
        },
        page: { totalElements: 1, totalPages: 1, size: 10, number: 0 },
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: dataWithArrays });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalled());
    });

    it('should extract field names correctly', async () => {
      const configWithComplexNames: ConfigDefinition = {
        id: 'config-1',
        description: 'Test',
        columns: [
          { name: 'user.profile.name' },
          { name: 'data["#value"]' },
          { name: 'items[*].id' },
        ],
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={configWithComplexNames}
        />
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalled());
    });
  });

  describe('Lazy Loading', () => {
    it('should limit rows when lazy loading is enabled', async () => {
      const largeDataset = {
        _embedded: {
          reportRows: Array.from({ length: 100 }, (_, i) => ({
            content: { id: i, name: `Item ${i}` },
          })),
        },
        page: { totalElements: 100, totalPages: 10, size: 10, number: 0 },
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: largeDataset });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={true}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/123/rows?size=10'));
    });

    it('should not limit rows when lazy loading is disabled', async () => {
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/123/rows?size=100000'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle config without columns', async () => {
      const configWithoutColumns: ConfigDefinition = {
        id: 'config-1',
        description: 'Test',
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={configWithoutColumns}
        />
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalled();
      });
    });

    it('should handle null values in data', async () => {
      const dataWithNulls = {
        _embedded: {
          reportRows: [
            {
              content: {
                user: { name: null, email: null },
                amount: null,
              },
            },
          ],
        },
        page: { totalElements: 1, totalPages: 1, size: 10, number: 0 },
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: dataWithNulls });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={mockConfigDefinition}
        />
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalled());
    });

    it('should handle config without description', async () => {
      const configWithoutDescription: ConfigDefinition = {
        id: 'config-1',
        columns: [{ name: 'test' }],
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      render(
        <ReportTableRows
          tableLinkRows="/api/report/123/rows"
          lazyLoading={false}
          configDefinition={configWithoutDescription}
        />
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalled());
    });
  });
});


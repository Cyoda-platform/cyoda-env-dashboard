/**
 * Tests for Reports API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reportsApi from './reports';
import axios from '../config/axios';

// Mock axios
vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Reports API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReportTypes', () => {
    it('should call GET /platform-api/reporting/types', async () => {
      const mockResponse = { data: { _embedded: { types: [] }, page: {} } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportTypes({ params: { size: 20 } });

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/platform-api/reporting/types'));
      expect(result).toEqual(mockResponse);
    });

    it('should use pageUrl when provided', async () => {
      const mockResponse = { data: { _embedded: { types: [] } } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await reportsApi.getReportTypes({ pageUrl: '/custom-url', params: { size: 20 } });

      expect(axios.get).toHaveBeenCalledWith('/custom-url');
    });
  });

  describe('getHistory', () => {
    it('should call GET /platform-api/history', async () => {
      const mockResponse = { data: { _embedded: { reports: [] }, page: {} } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getHistory({ params: { username: 'test' } });

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/platform-api/history'));
      expect(result).toEqual(mockResponse);
    });

    it('should use pageUrl when provided', async () => {
      const mockResponse = { data: { _embedded: { reports: [] } } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await reportsApi.getHistory({ pageUrl: '/custom-history-url', params: {} });

      expect(axios.get).toHaveBeenCalledWith('/custom-history-url');
    });
  });

  describe('getReportStatus', () => {
    it('should call GET /platform-api/report/{reportId}/status', async () => {
      const mockResponse = { data: { status: 'COMPLETED', progress: 100 } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportStatus('report-123');

      expect(axios.get).toHaveBeenCalledWith('platform-api/report/report-123/status');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportStats', () => {
    it('should call GET /platform-api/report/{reportId}/stats', async () => {
      const mockResponse = { data: { totalRows: 1000, totalGroups: 5 } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportStats('report-123');

      expect(axios.get).toHaveBeenCalledWith('platform-api/report/report-123/stats?full=false');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportConfig', () => {
    it('should call GET /platform-api/report/{reportId}/config', async () => {
      const mockResponse = { data: { name: 'Test Report', fields: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportConfig('report-123');

      expect(axios.get).toHaveBeenCalledWith('platform-api/report/report-123/config');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportGroups', () => {
    it('should call GET /platform-api/report/{reportId}/groups', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportGroups('report-123');

      expect(axios.get).toHaveBeenCalledWith('platform-api/report/report-123/groups');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportGroup', () => {
    it('should call GET /platform-api/report/{reportId}/groups/{groupId}', async () => {
      const mockResponse = { data: { id: 'group-1', name: 'Group 1' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportGroup('report-123', 'group-1');

      expect(axios.get).toHaveBeenCalledWith('platform-api/report/report-123/groups/group-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createReport', () => {
    it('should call POST /platform-api/report with config', async () => {
      const mockResponse = { data: { id: 'report-123', status: 'RUNNING' } };
      const config = { name: 'New Report', entityClass: 'TestClass' };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await reportsApi.createReport(config);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/report', config);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateReportConfig', () => {
    it('should call PUT /platform-api/report/{reportId}/config', async () => {
      const mockResponse = { data: { success: true } };
      const config = { name: 'Updated Report' };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await reportsApi.updateReportConfig('report-123', config);

      expect(axios.put).toHaveBeenCalledWith('/platform-api/report/report-123/config', config);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportData', () => {
    it('should call GET /platform-api/report/{reportId}/rows', async () => {
      const mockResponse = { data: { rows: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportData('report-123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/report/report-123/rows');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /platform-api/report/{reportId}/groups/{groupId}/rows when groupId provided', async () => {
      const mockResponse = { data: { rows: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportData('report-123', 'group-1');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/report/report-123/groups/group-1/rows');
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = { data: { rows: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await reportsApi.getReportData('report-123', undefined, { page: 0, size: 20 });

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('?'));
    });
  });

  describe('exportReport', () => {
    it('should call GET /platform-api/report/{reportId}/export with format', async () => {
      const mockResponse = { data: new Blob() };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.exportReport('report-123', 'csv');

      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/report/report-123/export?format=csv',
        { responseType: 'blob' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should default to csv format', async () => {
      const mockResponse = { data: new Blob() };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await reportsApi.exportReport('report-123');

      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/report/report-123/export?format=csv',
        { responseType: 'blob' }
      );
    });
  });

  describe('deleteReport', () => {
    it('should call DELETE /platform-api/report/{reportId}', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await reportsApi.deleteReport('report-123');

      expect(axios.delete).toHaveBeenCalledWith('/platform-api/report/report-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelReport', () => {
    it('should call POST /platform-api/report/{reportId}/cancel', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await reportsApi.cancelReport('report-123');

      expect(axios.post).toHaveBeenCalledWith('/platform-api/report/report-123/cancel');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cloneReport', () => {
    it('should call POST /platform-api/report/{reportId}/clone', async () => {
      const mockResponse = { data: { id: 'report-456', status: 'RUNNING' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await reportsApi.cloneReport('report-123');

      expect(axios.post).toHaveBeenCalledWith('/platform-api/report/report-123/clone');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('regroupReport', () => {
    it('should call POST /platform-api/report/{reportId}/regroup', async () => {
      const mockResponse = { data: { success: true } };
      const groupingColumns = ['field1', 'field2'];
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await reportsApi.regroupReport('report-123', groupingColumns);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/report/report-123/regroup', { groupingColumns });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportSummary', () => {
    it('should call GET /platform-api/report/{reportId}/summary', async () => {
      const mockResponse = { data: { totalRows: 1000, status: 'COMPLETED' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportSummary('report-123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/report/report-123/summary');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportChartData', () => {
    it('should call POST /platform-api/report/{reportId}/chart', async () => {
      const mockResponse = { data: { labels: [], datasets: [] } };
      const chartConfig = { type: 'bar', xAxis: 'date', yAxis: 'value' };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await reportsApi.getReportChartData('report-123', chartConfig);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/report/report-123/chart', chartConfig);
      expect(result).toEqual(mockResponse);
    });
  });

  // Note: Definition management functions (create/update/delete) are in config.ts, not reports.ts
});


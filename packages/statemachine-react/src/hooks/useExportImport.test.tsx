/**
 * Tests for useExportImport hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useExportWorkflows,
  useImportWorkflows,
  validateWorkflowData,
  readFileAsText,
  EXPORT_FORMATS,
} from './useExportImport';

// Mock the @cyoda/http-api-react module
vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { axios } from '@cyoda/http-api-react';

// Mock DOM APIs
const mockRemove = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockAppendChild = vi.fn();
const originalCreateElement = document.createElement.bind(document);
const originalAppendChild = document.body.appendChild.bind(document.body);

describe('useExportImport hooks', () => {
  let queryClient: QueryClient;
  let container: HTMLDivElement;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock createElement only for 'a' elements (download links)
    // Let other elements be created normally for React
    global.document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          setAttribute: vi.fn(),
          click: mockClick,
          remove: mockRemove,
        } as any;
      }
      return originalCreateElement(tagName);
    });

    // Mock appendChild to avoid DOM manipulation errors
    global.document.body.appendChild = vi.fn((node: any) => {
      mockAppendChild(node);
      return node;
    });

    global.window.URL.createObjectURL = mockCreateObjectURL;
    global.window.URL.revokeObjectURL = mockRevokeObjectURL;

    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    // Restore original functions
    global.document.createElement = originalCreateElement;
    global.document.body.appendChild = originalAppendChild;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('EXPORT_FORMATS', () => {
    it('should have correct export formats', () => {
      expect(EXPORT_FORMATS).toHaveLength(2);
      expect(EXPORT_FORMATS[0]).toEqual({
        extension: 'json',
        description: 'JSON format allows users to re-import file in UI',
      });
      expect(EXPORT_FORMATS[1]).toEqual({
        extension: 'zip',
        description: 'ZIP format does not allow users to re-import in UI',
      });
    });
  });

  describe('useExportWorkflows', () => {
    it('should export workflows as JSON', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Test Workflow 1',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
        },
        {
          id: 'workflow-2',
          name: 'Test Workflow 2',
          entityClassName: 'com.example.Task',
          active: true,
          persisted: true,
        },
      ];

      const mockExportData = {
        workflow: mockWorkflows,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockExportData });

      const { result } = renderHook(() => useExportWorkflows(), { wrapper });

      result.current.mutate({
        workflows: mockWorkflows as any,
        format: EXPORT_FORMATS[0], // JSON format
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify API call
      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/statemachine/export?includeIds=workflow-1&includeIds=workflow-2'
      );

      // Verify file download
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should export workflows as ZIP', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Test Workflow 1',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
        },
      ];

      const mockBlob = new Blob(['mock zip data']);
      vi.mocked(axios.get).mockResolvedValue({ data: mockBlob });

      const { result } = renderHook(() => useExportWorkflows(), { wrapper });

      result.current.mutate({
        workflows: mockWorkflows as any,
        format: EXPORT_FORMATS[1], // ZIP format
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify API call
      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/statemachine/export/zip?entityClasses=com.example.Entity&isSingleFile=false',
        { responseType: 'blob' }
      );

      // Verify file download
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle multiple workflows with special characters in entity class names', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Test Workflow',
          entityClassName: 'com.example.Entity With Spaces',
          active: true,
          persisted: true,
        },
      ];

      const mockBlob = new Blob(['mock zip data']);
      vi.mocked(axios.get).mockResolvedValue({ data: mockBlob });

      const { result } = renderHook(() => useExportWorkflows(), { wrapper });

      result.current.mutate({
        workflows: mockWorkflows as any,
        format: EXPORT_FORMATS[1], // ZIP format
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify entity class name is encoded
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('com.example.Entity%20With%20Spaces'),
        expect.any(Object)
      );
    });

    it('should handle export errors', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Test Workflow',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
        },
      ];

      vi.mocked(axios.get).mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useExportWorkflows(), { wrapper });

      result.current.mutate({
        workflows: mockWorkflows as any,
        format: EXPORT_FORMATS[0],
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Export failed'));
    });
  });

  describe('useImportWorkflows', () => {
    it('should import workflows with rewrite enabled', async () => {
      const mockImportData = {
        workflow: [
          {
            id: 'workflow-1',
            name: 'Imported Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      const mockResponse = {
        data: {
          success: true,
          imported: 1,
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImportWorkflows(), { wrapper });

      result.current.mutate({
        data: mockImportData,
        needRewrite: true,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/statemachine/import?needRewrite=true',
        mockImportData
      );

      expect(result.current.data).toEqual(mockResponse.data);
    });

    it('should import workflows with rewrite disabled', async () => {
      const mockImportData = {
        workflow: [
          {
            id: 'workflow-1',
            name: 'Imported Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      const mockResponse = {
        data: {
          success: true,
          imported: 1,
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImportWorkflows(), { wrapper });

      result.current.mutate({
        data: mockImportData,
        needRewrite: false,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/statemachine/import?needRewrite=false',
        mockImportData
      );
    });

    it('should use default needRewrite value (true)', async () => {
      const mockImportData = {
        workflow: [
          {
            id: 'workflow-1',
            name: 'Imported Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      const mockResponse = {
        data: {
          success: true,
          imported: 1,
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImportWorkflows(), { wrapper });

      result.current.mutate({
        data: mockImportData,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/statemachine/import?needRewrite=true',
        mockImportData
      );
    });

    it('should handle import errors', async () => {
      const mockImportData = {
        workflow: [
          {
            id: 'workflow-1',
            name: 'Imported Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      vi.mocked(axios.post).mockRejectedValue(new Error('Import failed'));

      const { result } = renderHook(() => useImportWorkflows(), { wrapper });

      result.current.mutate({
        data: mockImportData,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Import failed'));
    });
  });

  describe('validateWorkflowData', () => {
    it('should return true for valid workflow data', () => {
      const validData = {
        workflow: [
          {
            name: 'Test Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(validData)).toBe(true);
    });

    it('should return true for valid workflow data with multiple workflows', () => {
      const validData = {
        workflow: [
          {
            name: 'Workflow 1',
            entityClassName: 'com.example.Entity1',
            active: true,
            persisted: true,
          },
          {
            name: 'Workflow 2',
            entityClassName: 'com.example.Entity2',
            active: false,
            persisted: false,
          },
        ],
      };

      expect(validateWorkflowData(validData)).toBe(true);
    });

    it('should return true for workflow data with additional properties', () => {
      const validData = {
        workflow: [
          {
            id: 'workflow-1',
            name: 'Test Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
            description: 'Test description',
            documentLink: 'https://example.com',
            criteriaIds: ['criteria-1'],
          },
        ],
      };

      expect(validateWorkflowData(validData)).toBe(true);
    });

    it('should return false for null data', () => {
      expect(validateWorkflowData(null)).toBe(false);
    });

    it('should return false for undefined data', () => {
      expect(validateWorkflowData(undefined)).toBe(false);
    });

    it('should return false for non-object data', () => {
      expect(validateWorkflowData('string')).toBe(false);
      expect(validateWorkflowData(123)).toBe(false);
      expect(validateWorkflowData(true)).toBe(false);
    });

    it('should return false for data without workflow array', () => {
      const invalidData = {
        someOtherProperty: 'value',
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when workflow is not an array', () => {
      const invalidData = {
        workflow: 'not an array',
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when workflow is an object instead of array', () => {
      const invalidData = {
        workflow: {
          name: 'Test Workflow',
          entityClassName: 'com.example.Entity',
        },
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when workflow item is missing name', () => {
      const invalidData = {
        workflow: [
          {
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when workflow item is missing entityClassName', () => {
      const invalidData = {
        workflow: [
          {
            name: 'Test Workflow',
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when workflow item has empty name', () => {
      const invalidData = {
        workflow: [
          {
            name: '',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when workflow item has empty entityClassName', () => {
      const invalidData = {
        workflow: [
          {
            name: 'Test Workflow',
            entityClassName: '',
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return false when one of multiple workflows is invalid', () => {
      const invalidData = {
        workflow: [
          {
            name: 'Valid Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
          {
            name: 'Invalid Workflow',
            // Missing entityClassName
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(invalidData)).toBe(false);
    });

    it('should return true for empty workflow array', () => {
      const validData = {
        workflow: [],
      };

      expect(validateWorkflowData(validData)).toBe(true);
    });

    it('should handle errors gracefully and return false', () => {
      // Create an object that throws an error when accessed
      const problematicData = {
        get workflow() {
          throw new Error('Access error');
        },
      };

      expect(validateWorkflowData(problematicData)).toBe(false);
    });
  });

  describe('readFileAsText', () => {
    let mockFileReader: any;
    let mockFile: File;

    beforeEach(() => {
      // Create a mock FileReader
      mockFileReader = {
        readAsText: vi.fn(),
        onload: null,
        onerror: null,
        result: null,
      };

      // Mock the FileReader constructor
      global.FileReader = vi.fn(() => mockFileReader) as any;

      // Create a mock file
      mockFile = new File(['test content'], 'test.json', { type: 'application/json' });
    });

    it('should successfully read file as text', async () => {
      const fileContent = '{"workflow": [{"name": "Test", "entityClassName": "com.example.Entity"}]}';

      // Set up the promise
      const promise = readFileAsText(mockFile);

      // Simulate successful file read
      mockFileReader.result = fileContent;
      mockFileReader.onload({ target: { result: fileContent } });

      const result = await promise;

      expect(result).toBe(fileContent);
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile);
    });

    it('should reject when file has empty content', async () => {
      const fileContent = '';

      const promise = readFileAsText(mockFile);

      mockFileReader.result = fileContent;
      mockFileReader.onload({ target: { result: fileContent } });

      // Empty string is falsy, so it should reject
      await expect(promise).rejects.toThrow('Failed to read file');
    });

    it('should handle file read with large content', async () => {
      const fileContent = JSON.stringify({
        workflow: Array(100).fill({
          name: 'Test Workflow',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
        }),
      });

      const promise = readFileAsText(mockFile);

      mockFileReader.result = fileContent;
      mockFileReader.onload({ target: { result: fileContent } });

      const result = await promise;

      expect(result).toBe(fileContent);
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should reject when file read fails', async () => {
      const promise = readFileAsText(mockFile);

      // Simulate file read error
      mockFileReader.onerror();

      await expect(promise).rejects.toThrow('Failed to read file');
    });

    it('should reject when result is null', async () => {
      const promise = readFileAsText(mockFile);

      // Simulate onload with null result
      mockFileReader.onload({ target: { result: null } });

      await expect(promise).rejects.toThrow('Failed to read file');
    });

    it('should reject when result is undefined', async () => {
      const promise = readFileAsText(mockFile);

      // Simulate onload with undefined result
      mockFileReader.onload({ target: { result: undefined } });

      await expect(promise).rejects.toThrow('Failed to read file');
    });

    it('should reject when target is missing', async () => {
      const promise = readFileAsText(mockFile);

      // Simulate onload with no target
      mockFileReader.onload({});

      await expect(promise).rejects.toThrow('Failed to read file');
    });

    it('should handle special characters in file content', async () => {
      const fileContent = '{"workflow": [{"name": "Test™ Wörkflöw 中文", "entityClassName": "com.example.Entity"}]}';

      const promise = readFileAsText(mockFile);

      mockFileReader.result = fileContent;
      mockFileReader.onload({ target: { result: fileContent } });

      const result = await promise;

      expect(result).toBe(fileContent);
      expect(result).toContain('™');
      expect(result).toContain('Wörkflöw');
      expect(result).toContain('中文');
    });

    it('should handle file with newlines and whitespace', async () => {
      const fileContent = `{
  "workflow": [
    {
      "name": "Test Workflow",
      "entityClassName": "com.example.Entity"
    }
  ]
}`;

      const promise = readFileAsText(mockFile);

      mockFileReader.result = fileContent;
      mockFileReader.onload({ target: { result: fileContent } });

      const result = await promise;

      expect(result).toBe(fileContent);
      expect(result).toContain('\n');
    });

    it('should call readAsText with the correct file', async () => {
      const customFile = new File(['custom content'], 'custom.json', { type: 'application/json' });
      const fileContent = 'custom content';

      const promise = readFileAsText(customFile);

      mockFileReader.result = fileContent;
      mockFileReader.onload({ target: { result: fileContent } });

      await promise;

      expect(mockFileReader.readAsText).toHaveBeenCalledWith(customFile);
      expect(mockFileReader.readAsText).toHaveBeenCalledTimes(1);
    });
  });

  describe('Technical Entity Workflows', () => {
    it('should validate technical entity workflow data', () => {
      const technicalWorkflowData = {
        workflow: [
          {
            id: 'workflow-004',
            name: 'Data Pipeline Processing',
            entityClassName: 'com.cyoda.technical.DataPipeline',
            description: 'Technical workflow for data ingestion and processing pipeline',
            enabled: true,
            active: true,
            persisted: true,
          },
        ],
      };

      expect(validateWorkflowData(technicalWorkflowData)).toBe(true);
    });

    it('should export technical entity workflow', async () => {
      const technicalWorkflow = {
        id: 'workflow-004',
        name: 'Data Pipeline Processing',
        entityClassName: 'com.cyoda.technical.DataPipeline',
        active: true,
        persisted: true,
      };

      const mockExportData = {
        workflow: [technicalWorkflow],
        state: [
          { id: 'state-015', name: 'QUEUED', workflowId: 'workflow-004', isInitial: true, isFinal: false },
          { id: 'state-016', name: 'VALIDATING', workflowId: 'workflow-004', isInitial: false, isFinal: false },
          { id: 'state-017', name: 'PROCESSING', workflowId: 'workflow-004', isInitial: false, isFinal: false },
          { id: 'state-018', name: 'COMPLETED', workflowId: 'workflow-004', isInitial: false, isFinal: true },
        ],
        transition: [
          {
            id: 'trans-012',
            name: 'Start Validation',
            startStateId: 'state-015',
            endStateId: 'state-016',
            workflowId: 'workflow-004',
          },
        ],
        criteria: [
          { id: 'criteria-004', name: 'Queue Not Empty', entityClassName: 'com.cyoda.technical.DataPipeline' },
        ],
        process: [
          { id: 'process-004', name: 'Initialize Validators', entityClassName: 'com.cyoda.technical.DataPipeline' },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockExportData });

      const { result } = renderHook(() => useExportWorkflows(), { wrapper });

      result.current.mutate({
        workflows: [technicalWorkflow] as any,
        format: EXPORT_FORMATS[0],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/statemachine/export?includeIds=workflow-004'
      );
    });

    it('should import technical entity workflow with all related data', async () => {
      const technicalWorkflowImportData = {
        workflow: [
          {
            id: 'workflow-004',
            name: 'Data Pipeline Processing',
            entityClassName: 'com.cyoda.technical.DataPipeline',
            active: true,
            persisted: true,
          },
        ],
        state: [
          { id: 'state-015', name: 'QUEUED', workflowId: 'workflow-004' },
          { id: 'state-016', name: 'VALIDATING', workflowId: 'workflow-004' },
        ],
        transition: [
          {
            id: 'trans-012',
            name: 'Start Validation',
            startStateId: 'state-015',
            endStateId: 'state-016',
            workflowId: 'workflow-004',
          },
        ],
        criteria: [
          { id: 'criteria-004', name: 'Queue Not Empty', entityClassName: 'com.cyoda.technical.DataPipeline' },
        ],
        process: [
          { id: 'process-004', name: 'Initialize Validators', entityClassName: 'com.cyoda.technical.DataPipeline' },
        ],
      };

      const mockResponse = {
        data: {
          success: true,
          imported: 1,
          workflowIds: ['workflow-004'],
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImportWorkflows(), { wrapper });

      result.current.mutate({
        data: technicalWorkflowImportData,
        needRewrite: true,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/statemachine/import?needRewrite=true',
        technicalWorkflowImportData
      );

      expect(result.current.data).toEqual(mockResponse.data);
    });
  });

  describe('Export/Import Roundtrip', () => {
    it('should successfully export and re-import workflow data', async () => {
      const originalWorkflow = {
        id: 'workflow-001',
        name: 'Order Processing Workflow',
        entityClassName: 'com.example.Order',
        active: true,
        persisted: true,
      };

      const exportData = {
        workflow: [originalWorkflow],
        state: [
          { id: 'state-001', name: 'CREATED', workflowId: 'workflow-001' },
          { id: 'state-002', name: 'PROCESSING', workflowId: 'workflow-001' },
        ],
        transition: [
          {
            id: 'trans-001',
            name: 'Start Processing',
            startStateId: 'state-001',
            endStateId: 'state-002',
            workflowId: 'workflow-001',
          },
        ],
        criteria: [],
        process: [],
      };

      // Mock export
      vi.mocked(axios.get).mockResolvedValue({ data: exportData });

      const { result: exportResult } = renderHook(() => useExportWorkflows(), { wrapper });

      exportResult.current.mutate({
        workflows: [originalWorkflow] as any,
        format: EXPORT_FORMATS[0],
      });

      await waitFor(() => {
        expect(exportResult.current.isSuccess).toBe(true);
      });

      // Verify export data is valid for import
      expect(validateWorkflowData(exportData)).toBe(true);

      // Mock import
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          success: true,
          imported: 1,
          workflowIds: ['workflow-001'],
        },
      });

      const { result: importResult } = renderHook(() => useImportWorkflows(), { wrapper });

      importResult.current.mutate({
        data: exportData,
        needRewrite: true,
      });

      await waitFor(() => {
        expect(importResult.current.isSuccess).toBe(true);
      });

      expect(importResult.current.data?.success).toBe(true);
      expect(importResult.current.data?.imported).toBe(1);
    });

    it('should handle export/import of multiple workflows', async () => {
      const workflows = [
        {
          id: 'workflow-001',
          name: 'Order Processing',
          entityClassName: 'com.example.Order',
          active: true,
          persisted: true,
        },
        {
          id: 'workflow-004',
          name: 'Data Pipeline Processing',
          entityClassName: 'com.cyoda.technical.DataPipeline',
          active: true,
          persisted: true,
        },
      ];

      const exportData = {
        workflow: workflows,
        state: [],
        transition: [],
        criteria: [],
        process: [],
      };

      // Export
      vi.mocked(axios.get).mockResolvedValue({ data: exportData });

      const { result: exportResult } = renderHook(() => useExportWorkflows(), { wrapper });

      exportResult.current.mutate({
        workflows: workflows as any,
        format: EXPORT_FORMATS[0],
      });

      await waitFor(() => {
        expect(exportResult.current.isSuccess).toBe(true);
      });

      // Import
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          success: true,
          imported: 2,
          workflowIds: ['workflow-001', 'workflow-004'],
        },
      });

      const { result: importResult } = renderHook(() => useImportWorkflows(), { wrapper });

      importResult.current.mutate({
        data: exportData,
        needRewrite: false,
      });

      await waitFor(() => {
        expect(importResult.current.isSuccess).toBe(true);
      });

      expect(importResult.current.data?.imported).toBe(2);
    });
  });
});


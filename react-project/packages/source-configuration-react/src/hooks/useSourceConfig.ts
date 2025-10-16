/**
 * React Query hooks for Source Configuration API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { instance as axios } from '@cyoda/http-api-react';
import type {
  UploadConfig,
  CsvUploadConfig,
  XmlUploadConfig,
  JdbcSourceConfig,
  MapperInfo,
  CatalogItem,
  JdbcConnectionTestRequest,
  JdbcConnectionTestResponse,
  CsvSampleData,
} from '../types';

// Query keys
export const sourceConfigKeys = {
  all: ['sourceConfig'] as const,
  lists: () => [...sourceConfigKeys.all, 'list'] as const,
  list: (filters: string) => [...sourceConfigKeys.lists(), { filters }] as const,
  details: () => [...sourceConfigKeys.all, 'detail'] as const,
  detail: (id: string) => [...sourceConfigKeys.details(), id] as const,
  mappers: () => [...sourceConfigKeys.all, 'mappers'] as const,
  aliases: () => [...sourceConfigKeys.all, 'aliases'] as const,
  names: () => [...sourceConfigKeys.all, 'names'] as const,
};

// ============================================================================
// Encompass (CSV/XML) API Hooks
// ============================================================================

/**
 * Get list of all upload configurations (CSV and XML)
 */
export const useEncompassConfigs = () => {
  return useQuery({
    queryKey: sourceConfigKeys.lists(),
    queryFn: async (): Promise<UploadConfig[]> => {
      const { data } = await axios.get('/encompass/upload-config/list-configs');
      return data;
    },
  });
};

/**
 * Get list of configuration names
 */
export const useConfigNames = () => {
  return useQuery({
    queryKey: sourceConfigKeys.names(),
    queryFn: async (): Promise<string[]> => {
      const { data } = await axios.get('/encompass/upload-config/list-names');
      return data;
    },
  });
};

/**
 * Get list of available mappers
 */
export const useMappersList = () => {
  return useQuery({
    queryKey: sourceConfigKeys.mappers(),
    queryFn: async (): Promise<MapperInfo[]> => {
      const { data } = await axios.get('/encompass/upload-config/mappers-list');
      return data;
    },
  });
};

/**
 * Get list of catalog aliases
 */
export const useAliases = () => {
  return useQuery({
    queryKey: sourceConfigKeys.aliases(),
    queryFn: async (): Promise<CatalogItem[]> => {
      const { data } = await axios.get('/platform-api/catalog/item/all');
      return data;
    },
  });
};

/**
 * Save upload configuration (create or update)
 */
export const useSaveConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: CsvUploadConfig | XmlUploadConfig) => {
      const { data } = await axios.post('/encompass/upload-config/save', config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceConfigKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sourceConfigKeys.names() });
      message.success('Configuration saved successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to save configuration');
    },
  });
};

/**
 * Upload sample file for CSV configuration
 */
export const useUploadSample = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<CsvSampleData> => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('/encompass/upload-config/sample-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to upload sample file');
    },
  });
};

/**
 * Upload file for ingestion
 */
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ configId, file }: { configId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('configId', configId);
      const { data } = await axios.post('/encompass/upload-file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      message.success('File uploaded successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to upload file');
    },
  });
};

// ============================================================================
// Wolters Kluwer (JDBC) API Hooks
// ============================================================================

/**
 * Get list of JDBC configurations
 */
export const useJdbcConfigs = () => {
  return useQuery({
    queryKey: [...sourceConfigKeys.all, 'jdbc'],
    queryFn: async (): Promise<JdbcSourceConfig[]> => {
      const { data } = await axios.get('/wk/jdbc-source-config/list-configs');
      return data;
    },
  });
};

/**
 * Get list of JDBC mappers
 */
export const useJdbcMappersList = () => {
  return useQuery({
    queryKey: [...sourceConfigKeys.all, 'jdbc-mappers'],
    queryFn: async (): Promise<MapperInfo[]> => {
      const { data } = await axios.get('/wk/jdbc-source-config/mappers-list');
      return data;
    },
  });
};

/**
 * Test JDBC connection
 */
export const useTestJdbcConnection = () => {
  return useMutation({
    mutationFn: async (
      request: JdbcConnectionTestRequest
    ): Promise<JdbcConnectionTestResponse> => {
      const { data } = await axios.post('/wk/jdbc-source-config/test-connection', request);
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        message.success('Connection successful');
      } else {
        message.error(data.message || 'Connection failed');
      }
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to test connection');
    },
  });
};

/**
 * Save JDBC configuration
 */
export const useSaveJdbcConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: JdbcSourceConfig) => {
      const { data } = await axios.post('/wk/jdbc-source-config/save', config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...sourceConfigKeys.all, 'jdbc'] });
      message.success('JDBC configuration saved successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to save JDBC configuration');
    },
  });
};

/**
 * Run JDBC configuration
 */
export const useRunJdbcConfig = () => {
  return useMutation({
    mutationFn: async (configId: string) => {
      const { data } = await axios.get(`/wk/jdbc-source-operations/run/${configId}`);
      return data;
    },
    onSuccess: () => {
      message.success('Process was run successfully!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to run process');
    },
  });
};

// ============================================================================
// Combined hooks
// ============================================================================

/**
 * Get all configurations (Encompass + JDBC)
 */
export const useAllConfigs = () => {
  const encompassQuery = useEncompassConfigs();
  const jdbcQuery = useJdbcConfigs();

  return {
    data: [...(encompassQuery.data || []), ...(jdbcQuery.data || [])],
    isLoading: encompassQuery.isLoading || jdbcQuery.isLoading,
    isError: encompassQuery.isError || jdbcQuery.isError,
    error: encompassQuery.error || jdbcQuery.error,
  };
};


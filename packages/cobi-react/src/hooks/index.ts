/**
 * Hooks Index
 * Centralized export for all React Query hooks
 */

// Data Mapping hooks
export {
  useDataTypes,
  useTransformers,
  useDictionaries,
  useFunctions,
  useFunctionExamples,
  useDataMappings,
  useDataMapping,
  useEntityClasses,
  useEntityInfo,
  useEntitySchema,
  useReportingInfo,
  useCobiMetaParams,
  useMappingHistory,
  useSaveDataMapping,
  useDryRunDataMapping,
  useDeleteDataMapping,
  useParseSampleContent,
  useExportAllCobi,
  useImportCobiConfig,
} from './useDataMapping';

// Data Source Config hooks - use aliases for conflicting names
export {
  useDataSourceConfigs,
  useDataSourceConfig,
  useAvailableAuthTypes,
  useAuthTypeConfig,
  useProxyConfig,
  useDataSources,
  usePluginsSetup,
  useAuthServiceConfigs,
  useAuthRespParserConfigs,
  useConfigHistory,
  useSaveDataSourceConfig,
  useDeleteDataSourceConfig,
  useCheckEndpointConnection,
  useVerifyTemplateCalc,
  useDataSourceRequest,
  useRequestResult,
  useRequestState,
  useStatisticsForRoot,
  useStatisticsForChild,
  useExportAllCobi as useExportAllCobiDataSource,
  useImportCobiConfig as useImportCobiConfigDataSource,
} from './useDataSourceConfig';

// Chaining Config hooks - use aliases for conflicting names
export {
  useChainingConfigs,
  useChainingConfig,
  useChainingConfigHistory,
  useSaveChainingConfig,
  useDeleteChainingConfig,
  useExportAllCobi as useExportAllCobiChaining,
  useImportCobiConfig as useImportCobiConfigChaining,
} from './useChainingConfig';

export * from './useProcessing';
export * from './useEntityTypes';


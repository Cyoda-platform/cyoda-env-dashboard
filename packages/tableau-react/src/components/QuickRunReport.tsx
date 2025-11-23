/**
 * QuickRunReport Component
 * Migrated from: .old_project/packages/http-api/src/views/History/HistoryReportQuickRun.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Button, Dropdown, Tooltip, message, Modal } from 'antd';
import { PlayCircleOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axios, useGlobalUiSettingsStore, getReportingFetchTypes } from '@cyoda/http-api-react';
import ReportResultDialog from './ReportResultDialog';
import './QuickRunReport.scss';

interface QuickRunReportProps {
  value?: ReportConfig | null;
  onChange?: (config: ReportConfig | null) => void;
  onRunReport?: (configId: string, showResult: boolean) => void;
  onCancelReport?: (reportId: string) => void;
  runningReports?: RunningReport[];
}

interface ReportConfig {
  id: string;
  groupingVersion?: string;
  name: string;
  entity: string;
}

interface RunningReport {
  configName: string;
  reportId: string;
  status: string;
  groupingVersion?: string;
}

interface ReportDefinition {
  gridConfigFields: {
    id: string;
    name?: string;
    description: string;
    type: string;
    groupingVersion?: string;
    creationDate?: string;
  };
}

const QuickRunReport: React.FC<QuickRunReportProps> = ({
  value,
  onChange,
  onRunReport,
  onCancelReport,
  runningReports = [],
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedConfig, setSelectedConfig] = useState<ReportConfig | null>(value || null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Get global entity type from store
  const { entityType } = useGlobalUiSettingsStore();

  // Load entity types data for filtering
  const { data: entityTypesData = [] } = useQuery({
    queryKey: ['reportingFetchTypes'],
    queryFn: async () => {
      try {
        const response = await getReportingFetchTypes();
        return response.data || [];
      } catch (error) {
        console.error('Failed to load entity types:', error);
        return [];
      }
    },
  });

  // Load report definitions
  const { data: definitions = [] } = useQuery({
    queryKey: ['reportDefinitions', 'quickRun'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/platform-api/reporting/definitions', {
          params: {
            fields: ['id', 'description', 'type', 'userId', 'creationDate'],
            size: 999,
          },
        });
        return (data._embedded?.gridConfigFieldsViews || []) as ReportDefinition[];
      } catch (error) {
        console.error('Failed to load report definitions:', error);
        return [];
      }
    },
  });

  // Convert definitions to options with entity type filtering
  const configOptions = useMemo(() => {
    let options = definitions.map((report) => {
      // Extract name from ID by removing "CYODA-{EntityType}-" prefix
      // Example: "CYODA-EntityModel-dist rep (Copy)" -> "dist rep (Copy)"
      const name = report.gridConfigFields.id.split('-').slice(2).join('-');

      // Find entity type info
      const entityClass = report.gridConfigFields.type;
      const entityTypeInfo = entityTypesData.find((et: any) => {
        if (typeof et === 'object') {
          // Extract short class name from full class name
          // e.g., 'com.cyoda.tdb.model.search.SearchUsageEntity' -> 'SearchUsageEntity'
          const shortName = et.name.split('.').pop();
          return shortName === entityClass;
        }
        return et === entityClass;
      });
      const entityTypeValue = typeof entityTypeInfo === 'object' ? entityTypeInfo.type : null;

      return {
        id: report.gridConfigFields.id,
        groupingVersion: report.gridConfigFields.groupingVersion,
        name: name,
        entity: report.gridConfigFields.type,
        entityType: entityTypeValue,
      };
    });

    // Filter by entity type from global toggle
    if (entityTypesData.length > 0 && entityTypesData.some((et: any) => typeof et === 'object' && et.type)) {
      options = options.filter((item: any) => {
        // If entity has type info, filter by it
        if (item.entityType) {
          return item.entityType === entityType;
        }
        // If no type info, show in both modes (backward compatibility)
        return true;
      });
    }

    return options;
  }, [definitions, entityTypesData, entityType]);

  // Check if current config is running
  const isRunningReport = useMemo(() => {
    if (!selectedConfig) return null;
    return runningReports.find((el) => el.configName === selectedConfig.id);
  }, [selectedConfig, runningReports]);

  // Update parent when selection changes
  useEffect(() => {
    onChange?.(selectedConfig);
  }, [selectedConfig, onChange]);

  // Validate selected config still exists
  useEffect(() => {
    if (selectedConfig && configOptions.length > 0) {
      const exists = configOptions.some((el) => el.id === selectedConfig.id);
      if (!exists) {
        setSelectedConfig(null);
      }
    }
  }, [configOptions, selectedConfig]);

  // Handle run report
  const handleRunReport = useCallback(
    async (showResult: boolean = false) => {
      if (!selectedConfig) return;

      try {
        if (onRunReport) {
          onRunReport(selectedConfig.id, showResult);
        } else {
          // Default implementation - use the correct endpoint
          const { data } = await axios.post(`/platform-api/reporting/pre?gridConfig=${encodeURIComponent(selectedConfig.id)}`);
          message.success('Report execution started');

          console.log('Report started:', data);

          // Refetch to update running status - invalidate both query keys
          queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
          queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
        }

        // If showResult is true, we'll need to poll for completion
        if (showResult) {
          // This would be handled by a polling mechanism or websocket
          message.info('Report is running. Results will be shown when complete.');
        }
      } catch (error: any) {
        console.error('Failed to run report:', error);
        message.error(error.response?.data?.error || error.message || 'Failed to run report');
      }
    },
    [selectedConfig, onRunReport, queryClient]
  );

  // Handle cancel report
  const handleCancelReport = useCallback(() => {
    if (!isRunningReport) return;

    Modal.confirm({
      title: 'Cancel Report',
      content: 'Are you sure you want to cancel this running report?',
      onOk: async () => {
        try {
          if (onCancelReport) {
            onCancelReport(isRunningReport.reportId);
          } else {
            // Default implementation
            await axios.post(`/platform-api/reporting/report/${encodeURIComponent(isRunningReport.reportId)}/cancel`);
            message.success('Report cancelled');
            queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
          }
        } catch (error: any) {
          console.error('Failed to cancel report:', error);
          message.error(error.message || 'Failed to cancel report');
        }
      },
    });
  }, [isRunningReport, onCancelReport, queryClient]);

  // Handle edit report
  const handleEditReport = useCallback(() => {
    if (!selectedConfig) return;
    navigate(`/tableau/report-editor/${encodeURIComponent(selectedConfig.id)}`);
  }, [selectedConfig, navigate]);

  // Dropdown menu items
  const menuItems: MenuProps['items'] = [
    {
      key: 'run-show',
      label: 'Run and show Result',
      onClick: () => handleRunReport(true),
    },
  ];

  return (
    <div className="quick-run-report">
      <h2>Run Report</h2>
      <div className="inner">
        <div className="select">
          <Select
            value={selectedConfig?.id}
            onChange={(value) => {
              const config = configOptions.find((c) => c.id === value);
              setSelectedConfig(config || null);
            }}
            placeholder="Select report configuration"
            showSearch
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={configOptions.map((config) => ({
              value: config.id,
              label: config.name,
            }))}
            style={{ width: '100%' }}
            classNames={{ popup: { root: 'quick-run-report-dropdown' } }}
            styles={{ popup: { root: { minWidth: '400px' } } }}
          />
        </div>

        <div className="actions">
          {!isRunningReport ? (
            <Tooltip title="Run configuration">
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  disabled={!selectedConfig}
                  onClick={() => handleRunReport(false)}
                >
                  Run
                </Button>
              </Dropdown>
            </Tooltip>
          ) : null}

          <Tooltip title="Edit configuration">
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={!selectedConfig || !!isRunningReport}
              onClick={handleEditReport}
            />
          </Tooltip>

          {isRunningReport && (
            <Tooltip title="Cancel report creation">
              <Button
                type="primary"
                danger
                icon={<StopOutlined />}
                onClick={handleCancelReport}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <ReportResultDialog
        visible={showResultDialog}
        reportData={resultData}
        onClose={() => {
          setShowResultDialog(false);
          setResultData(null);
        }}
      />
    </div>
  );
};

export default QuickRunReport;


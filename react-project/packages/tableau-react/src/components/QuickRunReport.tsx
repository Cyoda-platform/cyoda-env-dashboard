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
import axios from 'axios';
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

  // Convert definitions to options
  const configOptions = useMemo(() => {
    return definitions.map((report) => {
      const name = report.gridConfigFields.id.split('-').slice(2).join('-');
      return {
        id: report.gridConfigFields.id,
        groupingVersion: report.gridConfigFields.groupingVersion,
        name: name,
        entity: report.gridConfigFields.type,
      };
    });
  }, [definitions]);

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
          // Default implementation
          await axios.post(`/platform-api/reporting/report/${selectedConfig.id}/run`);
          message.success('Report execution started');
          
          // Refetch to update running status
          queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
        }

        // If showResult is true, we'll need to poll for completion
        if (showResult) {
          // This would be handled by a polling mechanism or websocket
          message.info('Report is running. Results will be shown when complete.');
        }
      } catch (error: any) {
        console.error('Failed to run report:', error);
        message.error(error.message || 'Failed to run report');
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
            await axios.post(`/platform-api/reporting/report/${isRunningReport.reportId}/cancel`);
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


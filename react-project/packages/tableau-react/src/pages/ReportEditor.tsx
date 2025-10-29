/**
 * ReportEditor Page
 * Main report editor with 7 tabs for configuring reports
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditorSimple.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Button, message, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@cyoda/http-api-react';
import HelperReportDefinition from '../utils/HelperReportDefinition';
import type { ReportDefinition } from '../types';
import './ReportEditor.scss';

// Tab components (to be created)
import ReportEditorTabModel from '../components/ReportEditorTabModel';
import ReportEditorTabColumns from '../components/ReportEditorTabColumns';
import ReportEditorTabFilterBuilder from '../components/ReportEditorTabFilterBuilder';
import ReportEditorTabSorting from '../components/ReportEditorTabSorting';
import ReportEditorTabGrouping from '../components/ReportEditorTabGrouping';
import ReportEditorTabSummary from '../components/ReportEditorTabSummary';
import ReportEditorTabJson from '../components/ReportEditorTabJson';
import QueryPlanButton from '../components/QueryPlanButton';
import ReportScheduling from '../components/ReportScheduling';

const ReportEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isNew = searchParams.get('isNew') === 'true';

  const [configDefinition, setConfigDefinition] = useState<ReportDefinition>(
    HelperReportDefinition.reportDefinition()
  );
  const [showErrors, setShowErrors] = useState(false);
  const [runningReportId, setRunningReportId] = useState<string | null>(null);
  const [reportExecutionTime, setReportExecutionTime] = useState(0);
  const [showScheduling, setShowScheduling] = useState(false);

  // Load report definition
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reportDefinition', id],
    queryFn: async () => {
      const { data } = await axios.get(`/platform-api/reporting/definitions/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // Update local state when data loads
  useEffect(() => {
    if (reportData) {
      // Handle both wrapped (reportData.content) and unwrapped responses
      const definition = reportData.content || reportData;
      setConfigDefinition(definition);
    }
  }, [reportData]);

  // Compute columns from config definition
  const cols = useMemo(() => {
    return HelperReportDefinition.buildCols(configDefinition);
  }, [configDefinition]);

  // Page title
  const pageTitle = useMemo(() => {
    if (!id) return 'New Report';
    const nameParts = id.split('-').slice(2);
    return `Edit Distributed Report: ${nameParts.join('-')}`;
  }, [id]);

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: async (definition: ReportDefinition) => {
      const { data } = await axios.put(`/platform-api/reporting/definitions/${id}`, definition);
      return data;
    },
    onSuccess: () => {
      message.success('Report configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reportDefinition', id] });
      queryClient.invalidateQueries({ queryKey: ['reportDefinitions'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update report');
    },
  });

  // Run report mutation
  const runReportMutation = useMutation({
    mutationFn: async (definition: ReportDefinition) => {
      // First update the report
      await axios.put(`/platform-api/reporting/definitions/${id}`, definition);
      
      // Then run it
      const { data } = await axios.post(`/platform-api/reporting/report/${id}/run`);
      return data;
    },
    onSuccess: (data) => {
      message.success('Report started successfully');
      setRunningReportId(data.id);
      
      // Navigate to reports page to see results
      setTimeout(() => {
        navigate('/tableau/reports');
      }, 1000);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to run report');
    },
  });

  // Cancel report mutation
  const cancelReportMutation = useMutation({
    mutationFn: async () => {
      if (!runningReportId) return;
      const { data } = await axios.post(`/platform-api/reporting/report/${runningReportId}/cancel`);
      return data;
    },
    onSuccess: () => {
      message.success('Report cancelled');
      setRunningReportId(null);
      setReportExecutionTime(0);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to cancel report');
    },
  });

  // Timer for execution time
  useEffect(() => {
    if (!runningReportId) return;

    const interval = setInterval(() => {
      setReportExecutionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [runningReportId]);

  // Handlers
  const handleBack = useCallback(() => {
    navigate('/tableau/reports');
  }, [navigate]);

  const handleUpdate = useCallback(() => {
    setShowErrors(false);
    updateReportMutation.mutate(configDefinition);
  }, [configDefinition, updateReportMutation]);

  const handleUpdateAndRun = useCallback(() => {
    setShowErrors(false);
    runReportMutation.mutate(configDefinition);
  }, [configDefinition, runReportMutation]);

  const handleCancel = useCallback(() => {
    cancelReportMutation.mutate();
  }, [cancelReportMutation]);

  const handleConfigChange = useCallback((newConfig: Partial<ReportDefinition>) => {
    setConfigDefinition((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Check for duplicate alias names
  const hasDuplicateAliases = useMemo(() => {
    const aliases = configDefinition.colDefs?.map((col: any) => col.alias) || [];
    return new Set(aliases).size !== aliases.length;
  }, [configDefinition]);

  if (isLoading) {
    return (
      <div className="report-editor-loading">
        <Spin size="large" tip="Loading report configuration..." />
      </div>
    );
  }

  return (
    <div className="report-editor">
      <h2 className="report-editor__title">{pageTitle}</h2>

      {hasDuplicateAliases && (
        <Alert
          message="Warning: Duplicate Alias Names"
          description="Some columns have the same alias name. This may cause issues with the report."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs
        type="card"
        className="report-editor__tabs"
        items={[
          {
            key: 'model',
            label: 'Model',
            children: (
              <ReportEditorTabModel
                configDefinition={configDefinition}
                onChange={handleConfigChange}
              />
            ),
          },
          {
            key: 'columns',
            label: 'Columns',
            children: (
              <ReportEditorTabColumns
                cols={cols}
                configDefinition={configDefinition}
                onChange={handleConfigChange}
              />
            ),
          },
          {
            key: 'filterBuilder',
            label: (
              <span className={showErrors ? 'has-error' : ''}>FilterBuilder</span>
            ),
            children: (
              <ReportEditorTabFilterBuilder
                cols={cols}
                configDefinition={configDefinition}
                showErrors={showErrors}
                onChange={handleConfigChange}
                isNew={isNew}
              />
            ),
          },
          {
            key: 'sorting',
            label: 'Sorting',
            children: (
              <ReportEditorTabSorting
                cols={cols}
                configDefinition={configDefinition}
                onChange={handleConfigChange}
              />
            ),
          },
          {
            key: 'grouping',
            label: 'Grouping',
            children: (
              <ReportEditorTabGrouping
                cols={cols}
                configDefinition={configDefinition}
                onChange={handleConfigChange}
              />
            ),
          },
          {
            key: 'summary',
            label: 'Summary',
            children: (
              <ReportEditorTabSummary
                cols={cols}
                configDefinition={configDefinition}
                onChange={handleConfigChange}
              />
            ),
          },
          {
            key: 'json',
            label: 'JSON',
            children: (
              <ReportEditorTabJson
                configDefinition={configDefinition}
                onChange={setConfigDefinition}
              />
            ),
          },
        ]}
      />

      <div className="report-editor__actions">
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Back
        </Button>

        <Button
          type="default"
          onClick={() => setShowScheduling(true)}
        >
          Schedule
        </Button>

        {!configDefinition.singletonReport && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateReportMutation.isPending}
            onClick={handleUpdate}
          >
            Update
          </Button>
        )}

        {configDefinition.singletonReport && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={runReportMutation.isPending || !!runningReportId}
            onClick={handleUpdateAndRun}
          >
            Update and Run
          </Button>
        )}

        {runningReportId && reportExecutionTime > 1 && (
          <Button
            danger
            icon={<StopOutlined />}
            loading={cancelReportMutation.isPending}
            onClick={handleCancel}
          >
            Stop
          </Button>
        )}

        <QueryPlanButton configDefinition={configDefinition} />
      </div>

      {/* Report Scheduling Modal */}
      <ReportScheduling
        visible={showScheduling}
        reportId={id}
        onClose={() => setShowScheduling(false)}
      />
    </div>
  );
};

export default ReportEditor;


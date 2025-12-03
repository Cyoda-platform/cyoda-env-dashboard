/**
 * ReportEditor Page
 * Main report editor with 7 tabs for configuring reports
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditorSimple.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Button, Dropdown, Spin, Alert, App, Modal, Input } from 'antd';
import type { MenuProps } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, StopOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
  const { message } = App.useApp();
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
  
  // State for "Existing report" dialog (when 422 error occurs)
  const [showExistingReportDialog, setShowExistingReportDialog] = useState(false);
  const [isDeleteAndSaveLoading, setIsDeleteAndSaveLoading] = useState(false);
  const [isCreateNewLoading, setIsCreateNewLoading] = useState(false);
  const [showCreateNewDialog, setShowCreateNewDialog] = useState(false);
  const [newReportName, setNewReportName] = useState('');

  // Load report definition
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reportDefinition', id],
    queryFn: async () => {
      const { data } = await axios.get(`/platform-api/reporting/definitions/${encodeURIComponent(id!)}`);
      return data;
    },
    enabled: !!id,
  });

  // Update local state when data loads
  useEffect(() => {
    if (reportData) {
      // Handle both wrapped (reportData.content) and unwrapped responses
      const definition = reportData.content || reportData;

      // Expand short column names to full bean names (like Vue project does)
      const expandedDefinition = HelperReportDefinition.expandColumnNames(definition);

      setConfigDefinition(expandedDefinition);
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

  // Helper function to perform the actual update
  const performUpdate = useCallback(async (definition: ReportDefinition) => {
    const { data } = await axios.put(`/platform-api/reporting/definitions/${encodeURIComponent(id!)}`, definition);
    return data;
  }, [id]);

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: performUpdate,
    onSuccess: () => {
      message.success('Report configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reportDefinition', id] });
      queryClient.invalidateQueries({ queryKey: ['reportDefinitions'] });
    },
    onError: (error: any) => {
      // Handle 422 error - show "Existing report" dialog
      if (error.response?.status === 422) {
        setShowExistingReportDialog(true);
      } else {
        message.error(error.response?.data?.message || 'Failed to update report');
      }
    },
  });

  // Run report mutation
  const runReportMutation = useMutation({
    mutationFn: async (definition: ReportDefinition) => {
      // First update the report
      await axios.put(`/platform-api/reporting/definitions/${encodeURIComponent(id!)}`, definition);

      // Then run it
      const { data } = await axios.post(`/platform-api/reporting/report/${encodeURIComponent(id!)}/run`);
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
      const { data } = await axios.post(`/platform-api/reporting/report/${encodeURIComponent(runningReportId)}/cancel`);
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

    // Create a deep copy to avoid mutating the original
    const copyConfigDefinition = JSON.parse(JSON.stringify(configDefinition));

    // Log the data being sent for debugging
    console.log('=== SAVING REPORT ===');
    console.log('Full config:', copyConfigDefinition);
    console.log('colDefs:', copyConfigDefinition.colDefs);
    console.log('Sample colDef:', copyConfigDefinition.colDefs?.[0]);
    console.log('condition:', copyConfigDefinition.condition);
    console.log('condition @bean:', copyConfigDefinition.condition?.['@bean']);
    console.log('condition.conditions:', copyConfigDefinition.condition?.conditions);

    // Validate the configuration
    const validate = HelperReportDefinition.validateConfigDefinition(
      copyConfigDefinition.condition?.conditions || []
    );

    if (validate) {
      updateReportMutation.mutate(copyConfigDefinition);
    } else {
      message.error('Report contains errors. Please check the configuration.');
      setShowErrors(true);
    }
  }, [configDefinition, updateReportMutation, message]);

  // Handler for "Delete existing reports and save" button
  const handleDeleteExistingAndSave = useCallback(async () => {
    setIsDeleteAndSaveLoading(true);
    try {
      // Delete existing reports for this definition
      await axios.delete(`/platform-api/reporting/definitions/${encodeURIComponent(id!)}?mode=reports`);
      
      // Now perform the update
      const copyConfigDefinition = JSON.parse(JSON.stringify(configDefinition));
      await performUpdate(copyConfigDefinition);
      
      message.success('Report configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reportDefinition', id] });
      queryClient.invalidateQueries({ queryKey: ['reportDefinitions'] });
      setShowExistingReportDialog(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete reports and save');
    } finally {
      setIsDeleteAndSaveLoading(false);
    }
  }, [id, configDefinition, performUpdate, message, queryClient]);

  // Handler for "Create new report definition" button
  const handleCreateNewDefinition = useCallback(() => {
    // Generate default name based on current definition id
    const defaultName = id ? id.split('-').pop() + '_copy' : 'new_report';
    setNewReportName(defaultName);
    setShowCreateNewDialog(true);
  }, [id]);

  // Handler for confirming new report creation
  const handleConfirmCreateNew = useCallback(async () => {
    if (!newReportName.trim()) {
      message.error('Please enter a name for the new report');
      return;
    }

    setIsCreateNewLoading(true);
    try {
      const copyConfigDefinition = JSON.parse(JSON.stringify(configDefinition));
      const { data } = await axios.post(
        `/platform-api/reporting/definitions?name=${encodeURIComponent(newReportName)}`,
        copyConfigDefinition
      );
      
      message.success('New report definition created successfully');
      setShowExistingReportDialog(false);
      setShowCreateNewDialog(false);
      
      // Navigate to the new report
      if (data.content) {
        navigate(`/tableau/report-editor/${encodeURIComponent(data.content)}`);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create new report definition');
    } finally {
      setIsCreateNewLoading(false);
    }
  }, [newReportName, configDefinition, message, navigate]);

  const handleUpdateAndRun = useCallback((showResult: boolean = false) => {
    setShowErrors(false);

    // Create a deep copy to avoid mutating the original
    const copyConfigDefinition = JSON.parse(JSON.stringify(configDefinition));

    // Validate the configuration
    const validate = HelperReportDefinition.validateConfigDefinition(
      copyConfigDefinition.condition?.conditions || []
    );

    if (validate) {
      runReportMutation.mutate(copyConfigDefinition);

      // If showResult is true, we could navigate to results page after a delay
      if (showResult) {
        // This would be implemented when we have the results page ready
        message.info('Report is running. Results will be shown when complete.');
      }
    } else {
      message.error('Report contains errors. Please check the configuration.');
      setShowErrors(true);
    }
  }, [configDefinition, runReportMutation, message]);

  const handleCancel = useCallback(() => {
    cancelReportMutation.mutate();
  }, [cancelReportMutation]);

  const handleConfigChange = useCallback((newConfig: Partial<ReportDefinition>) => {
    setConfigDefinition((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Dropdown menu items for "Update and Run" button
  const runMenuItems: MenuProps['items'] = [
    {
      key: 'run-show',
      label: 'Run and show Result',
      onClick: () => handleUpdateAndRun(true),
    },
  ];

  // Check for duplicate alias names (same logic as Vue ConfigEditorAlertAliasSameName.vue)
  const duplicateAliasNames = useMemo(() => {
    const columns = (configDefinition.colDefs || []).map((el: any) => el.fullPath);
    const aliasDefs = configDefinition.aliasDefs || [];
    return aliasDefs.filter((el: any) => columns.includes(el.name)).map((el: any) => el.name);
  }, [configDefinition]);

  const hasDuplicateAliases = duplicateAliasNames.length > 0;

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
          description={`Alias name same with column names: ${duplicateAliasNames.join(', ')}`}
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
          <Dropdown.Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={runReportMutation.isPending || !!runningReportId}
            onClick={() => handleUpdateAndRun(false)}
            menu={{ items: runMenuItems }}
          >
            Update and Run
          </Dropdown.Button>
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

      {/* Existing Report Dialog - shown when 422 error occurs */}
      <Modal
        title="Existing report"
        open={showExistingReportDialog}
        onCancel={() => setShowExistingReportDialog(false)}
        footer={null}
        width={750}
      >
        <p>You have configuration with existing reports.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={isDeleteAndSaveLoading}
            onClick={handleDeleteExistingAndSave}
          >
            Delete existing reports and save
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={isCreateNewLoading}
            onClick={handleCreateNewDefinition}
          >
            Create new report definition
          </Button>
          <Button onClick={() => setShowExistingReportDialog(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Create New Report Name Dialog */}
      <Modal
        title="Create new"
        open={showCreateNewDialog}
        onOk={handleConfirmCreateNew}
        onCancel={() => setShowCreateNewDialog(false)}
        confirmLoading={isCreateNewLoading}
        okText="OK"
        cancelText="Cancel"
      >
        <p>Please input new name</p>
        <Input
          value={newReportName}
          onChange={(e) => setNewReportName(e.target.value)}
          placeholder="Enter report name"
        />
      </Modal>
    </div>
  );
};

export default ReportEditor;

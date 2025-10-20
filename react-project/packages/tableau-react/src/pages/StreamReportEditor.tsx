/**
 * StreamReportEditor Page
 * Editor for stream report configurations with tabs
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditorStream.vue
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Button, Space, Spin, Alert, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ReportEditorTabColumns from '../components/ReportEditorTabColumns';
import ReportEditorTabSorting from '../components/ReportEditorTabSorting';
import ReportEditorTabGrouping from '../components/ReportEditorTabGrouping';
import ReportEditorTabSummary from '../components/ReportEditorTabSummary';
import ReportEditorTabFilterBuilder from '../components/ReportEditorTabFilterBuilder';
import ReportEditorTabJson from '../components/ReportEditorTabJson';
import StreamReportEditorTabRange from '../components/StreamReportEditorTabRange';
import HelperReportDefinition from '../utils/HelperReportDefinition';
import type { ReportDefinition } from '../types';
import './StreamReportEditor.scss';

interface StreamReportDefinition {
  '@bean': string;
  id?: string;
  name?: string;
  description?: string;
  owner?: string;
  createDate?: string;
  streamDataDef: ReportDefinition & {
    rangeCondition: any;
    rangeOrder: 'ASC' | 'DESC';
  };
}

const StreamReportEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('isNew') === 'true';

  const [streamDefinition, setStreamDefinition] = useState<StreamReportDefinition>({
    '@bean': 'com.cyoda.core.streamdata.StreamDataConfigDef',
    streamDataDef: {
      ...HelperReportDefinition.reportDefinition(),
      rangeCondition: {
        '@bean': '',
        fieldName: '',
        operation: '',
        value: { '@type': '', value: '' },
      },
      rangeOrder: 'ASC',
    },
  });

  const [activeTab, setActiveTab] = useState('columns');

  // Fetch stream report definition
  const { isLoading } = useQuery({
    queryKey: ['streamReportDefinition', id],
    queryFn: async () => {
      const { data } = await axios.get(`/platform-api/streamdata/definitions/${id}`);
      setStreamDefinition(data);
      return data;
    },
    enabled: !!id,
  });

  // Build cols from colDefs and aliasDefs
  const cols = useMemo(() => {
    return HelperReportDefinition.buildCols(streamDefinition.streamDataDef);
  }, [streamDefinition.streamDataDef]);

  // Page title
  const pageTitle = useMemo(() => {
    if (isNew) return 'New Stream Report';
    return streamDefinition.name || 'Stream Report Editor';
  }, [isNew, streamDefinition.name]);

  // Check for duplicate alias names
  const hasDuplicateAliases = useMemo(() => {
    const aliases = streamDefinition.streamDataDef.aliasDefs?.map((a: any) => a.name) || [];
    return aliases.length !== new Set(aliases).size;
  }, [streamDefinition.streamDataDef.aliasDefs]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (definition: StreamReportDefinition) => {
      const { data } = await axios.put(`/platform-api/streamdata/definitions/${id}`, definition);
      return data;
    },
    onSuccess: () => {
      message.success('Stream report updated successfully');
      queryClient.invalidateQueries({ queryKey: ['streamReportDefinition', id] });
    },
    onError: () => {
      message.error('Failed to update stream report');
    },
  });

  // Run mutation
  const runMutation = useMutation({
    mutationFn: async () => {
      const request = {
        '@bean': 'com.cyoda.core.streamdata.StreamDataRequest',
        sdDef: streamDefinition.streamDataDef,
        offset: 0,
        length: 100,
        pointTime: null,
      };
      const { data } = await axios.post('/platform-api/streamdata/data', request);
      return data;
    },
    onSuccess: () => {
      message.success('Stream report executed successfully');
    },
    onError: () => {
      message.error('Failed to run stream report');
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate(streamDefinition);
  };

  const handleUpdateAndRun = async () => {
    try {
      await updateMutation.mutateAsync(streamDefinition);
      await runMutation.mutateAsync();
    } catch (error) {
      // Error messages handled by mutations
    }
  };

  const handleBack = () => {
    navigate('/tableau/stream-reports');
  };

  const handleStreamDataDefChange = (updates: Partial<ReportDefinition>) => {
    setStreamDefinition((prev) => ({
      ...prev,
      streamDataDef: {
        ...prev.streamDataDef,
        ...updates,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="stream-report-editor-loading">
        <Spin size="large" tip="Loading stream report..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'columns',
      label: 'Columns',
      children: (
        <ReportEditorTabColumns
          configDefinition={streamDefinition.streamDataDef}
          cols={cols}
          onChange={handleStreamDataDefChange}
        />
      ),
    },
    {
      key: 'filterBuilder',
      label: 'Filter Builder',
      children: (
        <ReportEditorTabFilterBuilder
          configDefinition={streamDefinition.streamDataDef}
          cols={cols}
          showErrors={false}
          onChange={handleStreamDataDefChange}
          isNew={isNew}
        />
      ),
    },
    {
      key: 'range',
      label: 'Range',
      children: (
        <StreamReportEditorTabRange
          streamDefinition={streamDefinition}
          cols={cols}
          onChange={(updates) => setStreamDefinition((prev) => ({ ...prev, ...updates }))}
        />
      ),
    },
    {
      key: 'sorting',
      label: 'Sorting',
      children: (
        <ReportEditorTabSorting
          configDefinition={streamDefinition.streamDataDef}
          cols={cols}
          onChange={handleStreamDataDefChange}
        />
      ),
    },
    {
      key: 'grouping',
      label: 'Grouping',
      children: (
        <ReportEditorTabGrouping
          configDefinition={streamDefinition.streamDataDef}
          cols={cols}
          onChange={handleStreamDataDefChange}
        />
      ),
    },
    {
      key: 'summary',
      label: 'Summary',
      children: (
        <ReportEditorTabSummary
          configDefinition={streamDefinition.streamDataDef}
          cols={cols}
          onChange={handleStreamDataDefChange}
        />
      ),
    },
    {
      key: 'json',
      label: 'JSON',
      children: (
        <ReportEditorTabJson
          configDefinition={streamDefinition.streamDataDef}
          onChange={handleStreamDataDefChange}
        />
      ),
    },
  ];

  return (
    <div className="stream-report-editor-page">
      <div className="page-header">
        <div className="header-left">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginRight: 16 }}
          >
            Back
          </Button>
          <h1>{pageTitle}</h1>
        </div>
        <Space>
          <Button
            type="default"
            icon={<SaveOutlined />}
            onClick={handleUpdate}
            loading={updateMutation.isPending}
          >
            Update
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleUpdateAndRun}
            loading={updateMutation.isPending || runMutation.isPending}
          >
            Update and Run
          </Button>
        </Space>
      </div>

      {hasDuplicateAliases && (
        <Alert
          message="Duplicate Alias Names"
          description="Some alias names are duplicated. Please ensure all alias names are unique."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="stream-report-editor-tabs"
      />
    </div>
  );
};

export default StreamReportEditor;


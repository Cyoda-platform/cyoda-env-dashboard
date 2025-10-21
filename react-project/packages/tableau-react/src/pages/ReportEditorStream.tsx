/**
 * ReportEditorStream Component
 * Stream report editor with range definitions and time-series support
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditorStream.vue
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Button, Spin, message, Tooltip, Form, Select, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ReportEditorTabModel from '../components/ReportEditorTabModel';
import ReportEditorTabColumns from '../components/ReportEditorTabColumns';
import ReportEditorTabJson from '../components/ReportEditorTabJson';
import ModellingRangeDefs from '../components/Modelling/ModellingRangeDefs';
import { FilterBuilderGroup, FilterBuilderCondition } from '@cyoda/cobi-react/src/components/DataMapper/FilterBuilder';
import QueryPlanButton from '../components/QueryPlanButton';
import { ConfigEditorStreamGrid, ConfigEditorStreamGridRef } from '@cyoda/ui-lib-react';
import { HelperReportDefinition } from '../utils/HelperReportDefinition';
import type { ReportDefinition, ColDef, ReportColumn } from '../types';
import './ReportEditorStream.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

interface StreamReportDefinition extends ReportDefinition {
  rangeColDefs?: ColDef[];
  rangeCondition?: any;
  rangeOrder?: 'ASC' | 'DESC';
}

export const ReportEditorStream: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('isNew') === 'true';
  const queryClient = useQueryClient();

  const [configDefinition, setConfigDefinition] = useState<StreamReportDefinition>({
    requestClass: '',
    colDefs: [],
    aliasDefs: [],
    columns: [],
    sorting: [],
    grouping: [],
    summary: [],
    condition: {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'OR',
      conditions: [],
    },
    rangeColDefs: [],
    rangeCondition: {
      '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
      fieldName: 'creationDate',
      operation: 'GREATER_THAN',
      value: {
        '@type': 'java.util.Date',
        value: new Date().toISOString(),
      },
    },
    rangeOrder: 'ASC',
  });

  const [showErrors, setShowErrors] = useState(false);
  const [showErrorsRange, setShowErrorsRange] = useState(false);
  const [indexList, setIndexList] = useState<any[]>([]);
  const streamGridRef = useRef<ConfigEditorStreamGridRef>(null);

  // Fetch stream report definition
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['streamReport', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/platform-api/reporting/stream-definitions/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (definition: StreamReportDefinition) => {
      const { data } = await axios.put(
        `${API_BASE}/platform-api/reporting/stream-definitions/${id}`,
        definition
      );
      return data;
    },
    onSuccess: () => {
      message.success('Stream report updated successfully');
      queryClient.invalidateQueries({ queryKey: ['streamReport', id] });
    },
    onError: () => {
      message.error('Failed to update stream report');
    },
  });

  useEffect(() => {
    if (reportData) {
      setConfigDefinition(reportData.streamDataDef || reportData);
    }
  }, [reportData]);

  const cols = useMemo(() => {
    return HelperReportDefinition.buildCols(configDefinition);
  }, [configDefinition]);

  const colsRange = useMemo(() => {
    return (configDefinition.rangeColDefs || []).map((el) => ({
      colType: 'colDef',
      alias: el.fullPath,
      typeShort: el.colType?.split('.').pop() || '',
      type: el.colType,
      '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
    }));
  }, [configDefinition.rangeColDefs]);

  const indexSpeed = useMemo(() => {
    // Simplified index speed calculation
    const allRangeFields = indexList.map((el) => el.rangeField?.columnPath);
    const rangeFieldName = configDefinition.rangeCondition?.fieldName;
    const hasConditions = configDefinition.condition?.conditions?.length > 0;

    if (allRangeFields.includes(rangeFieldName) && !hasConditions) {
      return {
        speed: 'success',
        description: `You select range index "${rangeFieldName}" and condition is empty. Query will be fast`,
      };
    }

    if (rangeFieldName && hasConditions) {
      return {
        speed: 'warning',
        description: 'Query may be slow with additional conditions',
      };
    }

    return {
      speed: 'default',
      description: 'No range index selected',
    };
  }, [indexList, configDefinition.rangeCondition, configDefinition.condition]);

  const pageTitle = useMemo(() => {
    return reportData?.name || 'Stream Report Editor';
  }, [reportData]);

  const conditionTypesKeysAvailable = useMemo(() => {
    return ['GREATER_THAN', 'LESS_THAN', 'EQUALS', 'NOT_EQUALS', 'BETWEEN'];
  }, []);

  const handleConfigChange = useCallback((updates: Partial<StreamReportDefinition>) => {
    setConfigDefinition((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleRangeColDefsChange = useCallback((ranges: ColDef[]) => {
    setConfigDefinition((prev) => ({ ...prev, rangeColDefs: ranges }));
  }, []);

  const handleBack = () => {
    navigate('/tableau/reports/stream');
  };

  const handleUpdate = async () => {
    await updateMutation.mutateAsync(configDefinition);
  };

  const handleUpdateAndRun = async () => {
    await updateMutation.mutateAsync(configDefinition);
    streamGridRef.current?.open();
  };

  if (isLoading) {
    return (
      <div className="report-editor-stream__loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="report-editor-stream">
      <div className="report-editor-stream__header">
        <h1 className="report-editor-stream__title">{pageTitle}</h1>
        <Tooltip title={indexSpeed.description}>
          <span className={`speed-exec speed-exec--${indexSpeed.speed}`}>
            Execution <i className={`speed-indicator speed-indicator--${indexSpeed.speed}`} />
          </span>
        </Tooltip>
      </div>

      <Tabs
        type="card"
        className="report-editor-stream__tabs"
        items={[
          {
            key: 'model',
            label: 'Model',
            children: (
              <div>
                <ModellingRangeDefs
                  configDefinition={configDefinition}
                  configDefinitionColRanges={configDefinition.rangeColDefs || []}
                  onChange={handleRangeColDefsChange}
                />
                <hr style={{ margin: '40px 0 20px' }} />
                <ReportEditorTabModel
                  configDefinition={configDefinition}
                  onChange={handleConfigChange}
                  showAliases={true}
                />
              </div>
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
              <span className={showErrors || showErrorsRange ? 'has-error' : ''}>
                FilterBuilder
              </span>
            ),
            children: (
              <div>
                <h2>Settings</h2>
                <FilterBuilderGroup
                  showErrors={showErrors}
                  level={0}
                  cols={cols}
                  condition={configDefinition.condition}
                  onChange={(condition) => handleConfigChange({ condition })}
                />

                <Divider />

                <h2>Range Settings</h2>
                <Form layout="inline">
                  <Form.Item label="Range Order">
                    <Select
                      value={configDefinition.rangeOrder}
                      onChange={(value) => handleConfigChange({ rangeOrder: value })}
                      style={{ width: 120 }}
                    >
                      <Select.Option value="ASC">ASC</Select.Option>
                      <Select.Option value="DESC">DESC</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>

                {configDefinition.rangeCondition &&
                  Object.keys(configDefinition.rangeCondition).length > 0 && (
                    <div className="filter-builder-condition">
                      <FilterBuilderCondition
                        disableRemove={true}
                        conditionTypesKeysAvailable={conditionTypesKeysAvailable}
                        condition={configDefinition.rangeCondition}
                        builderId="RangeCondition"
                        disableColumn={true}
                        showErrors={showErrorsRange}
                        cols={colsRange}
                        onChange={(rangeCondition) => handleConfigChange({ rangeCondition })}
                      />
                    </div>
                  )}
              </div>
            ),
          },
          {
            key: 'json',
            label: 'JSON',
            children: (
              <ReportEditorTabJson
                configDefinition={configDefinition}
                onChange={handleConfigChange}
              />
            ),
          },
        ]}
      />

      <div className="report-editor-stream__actions">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back
        </Button>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleUpdate}
          loading={updateMutation.isPending}
        >
          Update
        </Button>

        <Button
          type="default"
          icon={<PlayCircleOutlined />}
          onClick={handleUpdateAndRun}
        >
          Update and Run
        </Button>

        <QueryPlanButton configDefinition={configDefinition} />
      </div>

      <ConfigEditorStreamGrid ref={streamGridRef} isDeleteAvailable={true} />
    </div>
  );
};

export default ReportEditorStream;


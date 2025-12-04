/**
 * ReportEditorStream Component
 * Stream report editor with range definitions and time-series support
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditorStream.vue
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Button, Spin, message, Tooltip, Form, Select, Divider, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@cyoda/http-api-react';
import ReportEditorTabModel from '../components/ReportEditorTabModel';
import ReportEditorTabColumns from '../components/ReportEditorTabColumns';
import ReportEditorTabJson from '../components/ReportEditorTabJson';
import ModellingRangeDefs from '../components/Modelling/ModellingRangeDefs';
import { FilterBuilderGroup, FilterBuilderCondition } from '@cyoda/cobi-react';
import QueryPlanButton from '../components/QueryPlanButton';
import { ConfigEditorStreamGrid, ConfigEditorStreamGridRef } from '@cyoda/ui-lib-react';
import HelperReportDefinition from '../utils/HelperReportDefinition';
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

  // Keep a copy of the full report definition (with @bean, id, name, etc.)
  const [fullReportData, setFullReportData] = useState<any>(null);

  const [showErrors, setShowErrors] = useState(false);
  const [showErrorsRange, setShowErrorsRange] = useState(false);
  const [indexList, setIndexList] = useState<any[]>([]);
  const streamGridRef = useRef<ConfigEditorStreamGridRef>(null);

  // Fetch stream report definition
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['streamReport', id],
    queryFn: async () => {
      console.log('Fetching stream report definition for ID:', id);
      const url = `${API_BASE}/platform-api/stream-data/config?configId=${encodeURIComponent(id!)}`;
      console.log('Fetch URL:', url);
      const { data } = await axios.get(url);
      console.log('=== FETCHED DATA ===');
      console.log('Full fetched data:', JSON.stringify(data, null, 2));
      console.log('data.@bean:', data['@bean']);
      console.log('data.streamDataDef:', data.streamDataDef);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching stream report:', error);
      message.error('Failed to load stream report');
    }
  }, [error]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      // Send the full object with updated streamDataDef (like Vue project does)
      // Vue line 250-251: creates copy of full data and sets streamDataDef to current configDefinition
      const saveData = JSON.parse(JSON.stringify(fullReportData));

      // Remove rangeColDefs from configDefinition before sending
      // rangeColDefs is only for UI, not part of the server model
      const { rangeColDefs: _, ...streamDataDefToSave } = configDefinition;
      saveData.streamDataDef = streamDataDefToSave;

      console.log('=== MUTATION SAVING ===');
      console.log('Full saveData:', JSON.stringify(saveData, null, 2));
      console.log('saveData.streamDataDef:', JSON.stringify(saveData.streamDataDef, null, 2));
      console.log('saveData.@bean:', saveData['@bean']);
      console.log('saveData.id:', saveData.id);
      console.log('saveData.name:', saveData.name);

      const { data } = await axios.put(
        `${API_BASE}/platform-api/stream-data/config?configId=${encodeURIComponent(id!)}`,
        saveData
      );
      return data;
    },
    onSuccess: () => {
      message.success('Stream report updated successfully');
      queryClient.invalidateQueries({ queryKey: ['streamReport', id] });
    },
    onError: (error) => {
      console.error('Failed to update stream report:', error);
      message.error('Failed to update stream report');
    },
  });

  useEffect(() => {
    if (reportData) {
      // Store the full report data (with @bean, id, name, etc.)
      setFullReportData(reportData);

      // Work with just the streamDataDef part
      const streamDataDef = reportData.streamDataDef || reportData;

      // Ensure condition has a default value if not present
      if (!streamDataDef.condition) {
        streamDataDef.condition = {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: [],
        };
      }

      // Ensure rangeCondition has a default value if not present
      if (!streamDataDef.rangeCondition) {
        streamDataDef.rangeCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
          fieldName: 'creationDate',
          operation: 'GREATER_THAN',
          value: {
            '@type': 'java.util.Date',
            value: new Date().toISOString(),
          },
        };
      }

      // Initialize rangeColDefs from rangeCondition if it exists (Vue lines 221-227)
      // This is for existing reports that have been saved with a range condition
      if (streamDataDef.rangeCondition && streamDataDef.rangeCondition.fieldName) {
        // Only create rangeColDefs if:
        // 1. There are already columns selected (existing report with data), OR
        // 2. The fieldName is not the default 'creationDate' (user has customized it)
        const hasColumns = streamDataDef.columns && streamDataDef.columns.length > 0;
        const isNotDefaultField = streamDataDef.rangeCondition.fieldName !== 'creationDate';

        if (hasColumns || isNotDefaultField) {
          streamDataDef.rangeColDefs = [
            {
              fullPath: streamDataDef.rangeCondition.fieldName,
              colType: (typeof streamDataDef.rangeCondition.value === 'object' &&
                       streamDataDef.rangeCondition.value['@type']) || '',
            },
          ];
        } else {
          // New report with default values - don't show range column
          streamDataDef.rangeColDefs = [];
        }
      } else {
        streamDataDef.rangeColDefs = [];
      }

      setConfigDefinition(streamDataDef);
    }
  }, [reportData]);

  const cols = useMemo(() => {
    return HelperReportDefinition.buildCols(configDefinition);
  }, [configDefinition]);

  const colsRange = useMemo(() => {
    return (configDefinition.rangeColDefs || []).map((el) => {
      // Handle colType - it might be a simple string like 'LEAF' or a Java class name
      const colTypeStr = el.colType || '';
      const typeShort = colTypeStr.includes('.') ? colTypeStr.split('.').pop() || '' : colTypeStr;

      return {
        colType: 'colDef',
        alias: el.fullPath,
        typeShort,
        type: colTypeStr,
        '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      };
    });
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

  // Check for duplicate alias names (same logic as Vue ConfigEditorAlertAliasSameName.vue)
  const duplicateAliasNames = useMemo(() => {
    const columns = (configDefinition.colDefs || []).map((el: any) => el.fullPath);
    const aliasDefs = configDefinition.aliasDefs || [];
    return aliasDefs.filter((el: any) => columns.includes(el.name)).map((el: any) => el.name);
  }, [configDefinition]);

  const hasDuplicateAliases = duplicateAliasNames.length > 0;

  const handleConfigChange = useCallback((updates: Partial<StreamReportDefinition>) => {
    setConfigDefinition((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleConditionChange = useCallback(() => {
    // FilterBuilderGroup mutates the condition object directly
    // We just need to notify the parent that it changed
    setConfigDefinition((prev) => ({ ...prev, condition: prev.condition }));
  }, []);

  const handleRangeColDefsChange = useCallback((ranges: ColDef[]) => {
    setConfigDefinition((prev) => {
      const updated = { ...prev, rangeColDefs: ranges };

      // Update rangeCondition.fieldName based on the first range column
      // This matches the Vue implementation (lines 289-296 in ConfigEditorStream.vue)
      if (ranges && ranges.length > 0) {
        updated.rangeCondition = {
          ...prev.rangeCondition,
          fieldName: ranges[0].fullPath,
        };
      } else {
        // Reset to default condition if no ranges
        updated.rangeCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
          fieldName: 'creationDate',
          operation: 'GREATER_THAN',
          value: {
            '@type': 'java.util.Date',
            value: new Date().toISOString(),
          },
        };
      }

      return updated;
    });
  }, []);

  const handleBack = () => {
    navigate('/tableau/reports/stream');
  };

  const handleUpdate = useCallback(() => {
    setShowErrors(false);
    setShowErrorsRange(false);

    // Create a copy for validation (like Vue does at line 244)
    const configDefinitionLocal = JSON.parse(JSON.stringify(configDefinition));

    // Log the data being sent for debugging
    console.log('=== VALIDATING STREAM REPORT ===');
    console.log('Config definition:', configDefinitionLocal);

    // Validate the configuration (Vue line 245)
    const validate = HelperReportDefinition.validateConfigDefinition(
      configDefinitionLocal.condition?.conditions || []
    );

    // Validate range condition has @bean (Vue line 247)
    const validateRange = !!configDefinitionLocal.rangeCondition?.['@bean'];

    if (validate && validateRange) {
      // Mutation will use current configDefinition state (Vue line 251)
      updateMutation.mutate();
    } else {
      message.error('Stream report contains errors. Please check the configuration.');
      setShowErrors(!validate);
      setShowErrorsRange(!validateRange);
    }
  }, [configDefinition, updateMutation]);

  const handleUpdateAndRun = useCallback(() => {
    setShowErrors(false);
    setShowErrorsRange(false);

    // Create a copy for validation
    const configDefinitionLocal = JSON.parse(JSON.stringify(configDefinition));

    // Validate the configuration
    const validate = HelperReportDefinition.validateConfigDefinition(
      configDefinitionLocal.condition?.conditions || []
    );

    // Validate range condition has @bean
    const validateRange = !!configDefinitionLocal.rangeCondition?.['@bean'];

    if (validate && validateRange) {
      // Mutation will use current configDefinition state
      updateMutation.mutate();
      if (streamGridRef.current && id) {
        // Set the definition ID and open the dialog
        streamGridRef.current.setDefinitionId(id);
        streamGridRef.current.setDialogVisible(true);
      }
    } else {
      message.error('Stream report contains errors. Please check the configuration.');
      setShowErrors(!validate);
      setShowErrorsRange(!validateRange);
    }
  }, [configDefinition, updateMutation, id]);

  // Fetch stream definition
  const handleFetchDefinition = async (definitionId: string) => {
    try {
      console.log('Fetching stream definition:', definitionId);
      const { data: definition } = await axios.get(
        `${API_BASE}/platform-api/stream-data/config?configId=${encodeURIComponent(definitionId)}`
      );
      console.log('Fetched stream definition:', definition);
      return definition;
    } catch (error) {
      console.error('Failed to fetch stream definition:', error);
      message.error('Failed to fetch stream definition');
      throw error;
    }
  };

  // Load stream data for the grid
  const handleLoadStreamData = async (request: any) => {
    try {
      console.log('Loading stream data with request:', request);

      const { data: streamData } = await axios.post(
        `${API_BASE}/platform-api/stream-data/get`,
        request
      );

      console.log('Stream data response:', streamData);
      return streamData;
    } catch (error) {
      console.error('Failed to load stream data:', error);
      message.error('Failed to load stream data');
      return { rows: [] };
    }
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
                  onChange={handleConditionChange}
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
                        onChange={() => handleConfigChange({ rangeCondition: configDefinition.rangeCondition })}
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

      <ConfigEditorStreamGrid
        ref={streamGridRef}
        isDeleteAvailable={true}
        onFetchDefinition={handleFetchDefinition}
        onLoadData={handleLoadStreamData}
      />
    </div>
  );
};

export default ReportEditorStream;


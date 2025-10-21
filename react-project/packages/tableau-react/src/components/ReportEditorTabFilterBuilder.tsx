/**
 * ReportEditorTabFilterBuilder Component
 * Tab for building complex filters for reports
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabFilterBuilder.vue
 */

import React, { useEffect } from 'react';
import { Form, Switch, Divider } from 'antd';
import { FilterBuilderGroup } from '@cyoda/cobi-react/src/components/DataMapper/FilterBuilder';
import { DateTimePicker } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';
import './ReportEditorTabFilterBuilder.scss';

interface ReportEditorTabFilterBuilderProps {
  cols: any[];
  configDefinition: ReportDefinition;
  showErrors: boolean;
  onChange: (config: Partial<ReportDefinition>) => void;
  isNew?: boolean;
}

const ReportEditorTabFilterBuilder: React.FC<ReportEditorTabFilterBuilderProps> = ({
  cols,
  configDefinition,
  showErrors,
  onChange,
  isNew,
}) => {
  // Initialize condition if new report and empty
  useEffect(() => {
    if (isNew && (!configDefinition.condition || !configDefinition.condition.conditions || configDefinition.condition.conditions.length === 0)) {
      onChange({
        condition: {
          '@bean': 'com.cyoda.core.conditions.queryable.Group',
          operator: 'AND',
          conditions: [],
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  const handleSingletonChange = (checked: boolean) => {
    onChange({ singletonReport: checked });
  };

  const handlePointTimeChange = (value: string | null) => {
    onChange({ pointTime: value || undefined });
  };

  const handleConditionChange = () => {
    // FilterBuilderGroup mutates the condition object directly
    // We just need to notify the parent that it changed
    onChange({ condition: configDefinition.condition });
  };

  return (
    <div className="report-editor-tab-filter-builder">
      <h2>Settings</h2>
      <Form layout="vertical">
        <Form.Item label="Singleton Report">
          <Switch
            checked={configDefinition.singletonReport || false}
            onChange={handleSingletonChange}
          />
        </Form.Item>
        <Form.Item label="As at">
          <DateTimePicker
            value={configDefinition.pointTime}
            onChange={handlePointTimeChange}
          />
        </Form.Item>
      </Form>

      <Divider />

      <FilterBuilderGroup
        level={0}
        cols={cols}
        condition={configDefinition.condition}
        showErrors={showErrors}
        onChange={handleConditionChange}
      />
    </div>
  );
};

export default ReportEditorTabFilterBuilder;


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
import FilterBuilderQueryPlan from './FilterBuilderQueryPlan';
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
          <div className="form-item-help">
            Enable this to create a report that returns a single aggregated result instead of multiple rows
          </div>
        </Form.Item>
        <Form.Item label="As at">
          <DateTimePicker
            value={configDefinition.pointTime}
            onChange={handlePointTimeChange}
          />
          <div className="form-item-help">
            Set the point in time for the report data. Leave empty for current time.
          </div>
        </Form.Item>
      </Form>

      <Divider />

      <div className="filter-builder-header">
        <h2>Filter Conditions</h2>
        <FilterBuilderQueryPlan
          configDefinition={configDefinition}
          disabled={!configDefinition.condition || configDefinition.condition.conditions?.length === 0}
        />
      </div>

      <div className="filter-builder-description">
        <p>
          Build filter conditions to limit which entities are included in the report.
          Use groups to combine multiple conditions with AND/OR logic.
        </p>
        <ul>
          <li><strong>Match All (AND)</strong> - All conditions in the group must be true</li>
          <li><strong>Match Any (OR)</strong> - At least one condition in the group must be true</li>
          <li>Click the <strong>+</strong> button to add new conditions or nested groups</li>
          <li>Use nested groups to create complex filter logic</li>
          <li>Click <strong>Query Plan</strong> to see if your filter will use indexes (fast) or full table scan (slow)</li>
        </ul>
      </div>

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


/**
 * StreamReportEditorTabRange Component
 * Tab for configuring stream report range conditions
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditorStream.vue (Range tab)
 */

import React, { useMemo } from 'react';
import { Form, Select, Radio } from 'antd';
import './StreamReportEditorTabRange.scss';

interface RangeCondition {
  '@bean': string;
  fieldName: string;
  operation: string;
  value: {
    '@type': string;
    value: string;
  };
}

interface StreamDefinition {
  streamDataDef: {
    rangeCondition: RangeCondition;
    rangeOrder: 'ASC' | 'DESC';
  };
}

interface StreamReportEditorTabRangeProps {
  streamDefinition: StreamDefinition;
  cols: any[];
  onChange: (updates: Partial<StreamDefinition>) => void;
}

const CONDITION_TYPES = [
  { value: 'com.cyoda.core.conditions.EqualsCondition', label: 'Equals' },
  { value: 'com.cyoda.core.conditions.NotEqualsCondition', label: 'Not Equals' },
  { value: 'com.cyoda.core.conditions.GreaterThanCondition', label: 'Greater Than' },
  { value: 'com.cyoda.core.conditions.GreaterThanOrEqualsCondition', label: 'Greater Than or Equals' },
  { value: 'com.cyoda.core.conditions.LessThanCondition', label: 'Less Than' },
  { value: 'com.cyoda.core.conditions.LessThanOrEqualsCondition', label: 'Less Than or Equals' },
];

const StreamReportEditorTabRange: React.FC<StreamReportEditorTabRangeProps> = ({
  streamDefinition,
  cols,
  onChange,
}) => {
  const rangeCondition = streamDefinition.streamDataDef.rangeCondition;
  const rangeOrder = streamDefinition.streamDataDef.rangeOrder;

  // Column options for field selection
  const columnOptions = useMemo(() => {
    return cols.map((col) => ({
      value: col.name || col.alias,
      label: col.alias || col.name,
    }));
  }, [cols]);

  const handleFieldChange = (fieldName: string) => {
    onChange({
      streamDataDef: {
        ...streamDefinition.streamDataDef,
        rangeCondition: {
          ...rangeCondition,
          fieldName,
        },
      },
    });
  };

  const handleOperationChange = (operation: string) => {
    onChange({
      streamDataDef: {
        ...streamDefinition.streamDataDef,
        rangeCondition: {
          ...rangeCondition,
          '@bean': operation,
          operation: operation.split('.').pop() || '',
        },
      },
    });
  };

  const handleValueChange = (value: string) => {
    onChange({
      streamDataDef: {
        ...streamDefinition.streamDataDef,
        rangeCondition: {
          ...rangeCondition,
          value: {
            '@type': 'string',
            value,
          },
        },
      },
    });
  };

  const handleOrderChange = (order: 'ASC' | 'DESC') => {
    onChange({
      streamDataDef: {
        ...streamDefinition.streamDataDef,
        rangeOrder: order,
      },
    });
  };

  return (
    <div className="stream-report-editor-tab-range">
      <Form layout="vertical">
        <Form.Item label="Range Field">
          <Select
            placeholder="Select field"
            value={rangeCondition.fieldName || undefined}
            onChange={handleFieldChange}
            options={columnOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            classNames={{ popup: { root: 'stream-report-range-dropdown' } }}
            styles={{ popup: { root: { minWidth: '400px' } } }}
          />
        </Form.Item>

        <Form.Item label="Condition Type">
          <Select
            placeholder="Select condition"
            value={rangeCondition['@bean'] || undefined}
            onChange={handleOperationChange}
            options={CONDITION_TYPES}
            classNames={{ popup: { root: 'stream-report-range-dropdown' } }}
            styles={{ popup: { root: { minWidth: '300px' } } }}
          />
        </Form.Item>

        <Form.Item label="Value">
          <Select
            mode="tags"
            placeholder="Enter value"
            value={rangeCondition.value?.value ? [rangeCondition.value.value] : []}
            onChange={(values) => handleValueChange(values[0] || '')}
            style={{ width: '100%' }}
            classNames={{ popup: { root: 'stream-report-range-dropdown' } }}
            styles={{ popup: { root: { minWidth: '300px' } } }}
          />
        </Form.Item>

        <Form.Item label="Range Order">
          <Radio.Group value={rangeOrder} onChange={(e) => handleOrderChange(e.target.value)}>
            <Radio value="ASC">Ascending</Radio>
            <Radio value="DESC">Descending</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>

      <div className="range-info">
        <p>
          <strong>Range Condition:</strong> Defines the field and condition used to determine the range of data to stream.
        </p>
        <p>
          <strong>Range Order:</strong> Determines whether data is streamed in ascending or descending order based on the range field.
        </p>
      </div>
    </div>
  );
};

export default StreamReportEditorTabRange;


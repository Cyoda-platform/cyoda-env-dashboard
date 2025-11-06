/**
 * Range Condition Component
 * Advanced filtering component for instances with range conditions
 * Migrated from: .old_project/packages/statemachine/src/components/RangeCondition.vue
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Row, Col, Button, Form, Select, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModellingPopUp, ModellingPopUpRef } from '@cyoda/tableau-react';
import { FilterBuilderCondition } from '@cyoda/cobi-react';
import type { FilterCondition, ColumnInfo } from '@cyoda/cobi-react';
import './RangeCondition.css';
import './RangeCondition.scss';

export interface RangeConditionForm {
  entityClassName: string;
  rangeOrder: 'ASC' | 'DESC';
  rangeCondition: FilterCondition;
}

interface RangeConditionProps {
  form: RangeConditionForm;
  onChange: (form: RangeConditionForm) => void;
  disabled?: boolean;
}

// Range condition types (from HelperReportDefinition.rangeConditionTypes)
const RANGE_CONDITION_TYPES = [
  { key: 'EQUALS', label: 'Equals', '@bean': 'com.cyoda.core.conditions.EqualsCondition' },
  { key: 'NOT_EQUALS', label: 'Not Equals', '@bean': 'com.cyoda.core.conditions.NotEqualsCondition' },
  { key: 'GREATER_THAN', label: 'Greater Than', '@bean': 'com.cyoda.core.conditions.GreaterThanCondition' },
  { key: 'GREATER_THAN_OR_EQUALS', label: 'Greater Than Or Equals', '@bean': 'com.cyoda.core.conditions.GreaterThanOrEqualsCondition' },
  { key: 'LESS_THAN', label: 'Less Than', '@bean': 'com.cyoda.core.conditions.LessThanCondition' },
  { key: 'LESS_THAN_OR_EQUALS', label: 'Less Than Or Equals', '@bean': 'com.cyoda.core.conditions.LessThanOrEqualsCondition' },
  { key: 'IN', label: 'In', '@bean': 'com.cyoda.core.conditions.InCondition' },
  { key: 'NOT_IN', label: 'Not In', '@bean': 'com.cyoda.core.conditions.NotInCondition' },
  { key: 'BETWEEN', label: 'Between', '@bean': 'com.cyoda.core.conditions.BetweenCondition', isRange: true },
  { key: 'IS_NULL', label: 'Is Null', '@bean': 'com.cyoda.core.conditions.IsNullCondition', disableValueField: true },
  { key: 'IS_NOT_NULL', label: 'Is Not Null', '@bean': 'com.cyoda.core.conditions.IsNotNullCondition', disableValueField: true },
];

export const RangeCondition: React.FC<RangeConditionProps> = ({
  form,
  onChange,
  disabled = false,
}) => {
  const modellingPopUpRef = useRef<ModellingPopUpRef>(null);
  const [configDefinitionColRanges, setConfigDefinitionColRanges] = useState<any[]>([]);

  // Initialize colsRange from existing condition
  React.useEffect(() => {
    if (form.rangeCondition?.fieldName && configDefinitionColRanges.length === 0) {
      // Extract type from the condition if available
      const colType = form.rangeCondition.value?.['@type'] || 'java.lang.String';
      setConfigDefinitionColRanges([{
        fullPath: form.rangeCondition.fieldName,
        colType: colType,
      }]);
    }
  }, [form.rangeCondition?.fieldName]);

  // Convert selected columns to ColumnInfo format for FilterBuilderCondition
  const colsRange = useMemo<ColumnInfo[]>(() => {
    return configDefinitionColRanges.map((el) => ({
      alias: el.fullPath,
      typeShort: el.colType?.split('.').pop() || 'String',
      type: el.colType || 'java.lang.String',
      label: el.fullPath,
    }));
  }, [configDefinitionColRanges]);

  const handleOpenDialog = () => {
    if (modellingPopUpRef.current) {
      modellingPopUpRef.current.open();
    }
  };

  const handleChangeModellingPopUp = useCallback((data: any[]) => {
    setConfigDefinitionColRanges(data);
    
    if (data && data.length > 0) {
      // Update the rangeCondition with the selected field
      const updatedForm = {
        ...form,
        rangeCondition: {
          ...form.rangeCondition,
          '@bean': 'com.cyoda.core.conditions.EqualsCondition',
          fieldName: data[0].fullPath,
        },
      };
      onChange(updatedForm);
    } else {
      // Clear the rangeCondition
      const updatedForm = {
        ...form,
        rangeCondition: {
          '@bean': '',
          fieldName: '',
          operation: '',
          value: {
            '@type': '',
            value: '',
          },
        },
      };
      onChange(updatedForm);
    }
  }, [form, onChange]);

  const handleRangeOrderChange = (value: 'ASC' | 'DESC') => {
    const updatedForm = {
      ...form,
      rangeOrder: value,
    };
    onChange(updatedForm);
  };

  const handleConditionChange = () => {
    // Trigger onChange to notify parent of condition changes
    onChange({ ...form });
  };

  const handleConditionRemove = () => {
    // Clear the condition
    setConfigDefinitionColRanges([]);
    const updatedForm = {
      ...form,
      rangeCondition: {
        '@bean': '',
        fieldName: '',
        operation: '',
        value: {
          '@type': '',
          value: '',
        },
      },
    };
    onChange(updatedForm);
  };

  const hasRangeCondition = form.rangeCondition && form.rangeCondition['@bean'];

  return (
    <div className="range-condition">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenDialog}
            disabled={disabled || !form.entityClassName}
          >
            Add New Range Column Definition
          </Button>

          {!form.entityClassName && (
            <Alert
              message="Please select an entity class first"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          <ModellingPopUp
            ref={modellingPopUpRef}
            requestClass={form.entityClassName}
            checked={configDefinitionColRanges}
            onChange={handleChangeModellingPopUp}
            onlyRange={true}
            limit={1}
          />
        </Col>

        <Col span={24}>
          <h3>Range Settings</h3>
          <Form layout="inline">
            <Form.Item label="Range Order">
              <Select
                value={form.rangeOrder}
                onChange={handleRangeOrderChange}
                style={{ width: 100 }}
                disabled={disabled}
                popupClassName="range-condition-dropdown"
                dropdownStyle={{ minWidth: '150px' }}
              >
                <Select.Option value="ASC">ASC</Select.Option>
                <Select.Option value="DESC">DESC</Select.Option>
              </Select>
            </Form.Item>
          </Form>

          {hasRangeCondition && colsRange.length > 0 && (
            <div className="filter-builder-condition" style={{ marginTop: 16 }}>
              <FilterBuilderCondition
                condition={form.rangeCondition}
                cols={colsRange}
                showErrors={false}
                disableRemove={false}
                disableColumn={true}
                readOnly={disabled}
                onRemove={handleConditionRemove}
                onChange={handleConditionChange}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default RangeCondition;


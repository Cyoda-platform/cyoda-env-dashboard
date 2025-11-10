import React, { useMemo, useEffect } from 'react';
import { Row, Col, Select, Input, InputNumber, DatePicker, Button, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { FilterCondition, ColumnInfo, CONDITION_TYPES, ConditionType, FilterConditionValue } from './types';
import { shortLabel } from './helpers';
import './FilterBuilderCondition.css';

interface FilterBuilderConditionProps {
  condition: FilterCondition;
  cols: ColumnInfo[];
  showErrors?: boolean;
  disableRemove?: boolean;
  disableColumn?: boolean;
  readOnly?: boolean;
  className?: string;
  isLast?: boolean;
  onRemove: () => void;
  onChange: () => void;
}

const FilterBuilderCondition: React.FC<FilterBuilderConditionProps> = ({
  condition,
  cols,
  showErrors = false,
  disableRemove = false,
  disableColumn = false,
  readOnly = false,
  className = '',
  isLast = false,
  onRemove,
  onChange,
}) => {
  // Get selected column
  const selectedCol = useMemo(() => {
    if (condition.fieldName) {
      return cols.find((col) => col.alias === condition.fieldName);
    }
    return undefined;
  }, [condition.fieldName, cols]);

  // Get selected type
  const selectedType = useMemo(() => {
    return selectedCol?.typeShort || 'String';
  }, [selectedCol]);

  // Filter condition types based on selected field type
  const conditionTypesFiltered = useMemo(() => {
    const filtered = CONDITION_TYPES.filter((ct) => {
      if (ct.types && ct.types.indexOf(selectedType) !== -1) {
        return true;
      }
      return false;
    });
    return filtered.length > 0 ? filtered : CONDITION_TYPES;
  }, [selectedType]);

  // Get selected condition type
  const selectedConditionType = useMemo(() => {
    return CONDITION_TYPES.find((ct) => ct.key === condition.operation) || ({} as ConditionType);
  }, [condition.operation]);

  // Check if it's a changed type condition
  const isChangedTypeCondition = useMemo(() => {
    return ['IS_UNCHANGED', 'IS_CHANGED'].includes(selectedConditionType.key || '');
  }, [selectedConditionType]);

  // Validation errors
  const isExistErrorFieldName = !condition.fieldName;
  const isExistErrorOperation = !condition.operation;

  // Default value factory
  const defaultValue = (): FilterConditionValue => {
    return {
      '@type': selectedCol?.type || '',
      value: '',
    };
  };

  // Reset values when operation changes
  const resetValues = () => {
    delete condition.value;
    delete condition.from;
    delete condition.to;
    delete condition.lookback;

    if (selectedConditionType.isRange) {
      condition.from = defaultValue();
      condition.to = defaultValue();
    } else if (selectedConditionType.disableValueField) {
      delete condition.value;
    } else if (isChangedTypeCondition) {
      condition.lookback = '0';
      condition.rangeField = 'false';
    } else {
      condition.value = defaultValue();
    }
  };

  // Handle field name change
  const handleFieldNameChange = (value: string) => {
    condition.fieldName = value;
    condition.operation = '';
    resetValues();
    onChange();
  };

  // Handle operation change
  const handleOperationChange = (value: string) => {
    condition.operation = value;
    const conditionType = CONDITION_TYPES.find((ct) => ct.key === value);
    condition['@bean'] = conditionType?.['@bean'] || '';

    if (value === 'EQUALS') {
      condition.queryable = true;
    } else {
      delete condition.queryable;
    }

    resetValues();
    onChange();
  };

  // Handle value change
  const handleValueChange = (value: any, field: 'value' | 'from' | 'to' | 'lookback') => {
    if (field === 'lookback') {
      condition.lookback = String(value);
    } else {
      if (!condition[field]) {
        condition[field] = defaultValue();
      }
      condition[field]!.value = value;
    }
    onChange();
  };

  // Handle remove
  const handleRemove = () => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to delete row?',
      onOk: onRemove,
    });
  };

  // Render value input based on type
  const renderValueInput = (field: 'value' | 'from' | 'to') => {
    const value = condition[field]?.value;

    if (isChangedTypeCondition && field === 'value') {
      return (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Please input"
          value={condition.lookback ? Number(condition.lookback) : 0}
          onChange={(val) => handleValueChange(val, 'lookback')}
          disabled={readOnly}
          step={1}
        />
      );
    }

    if (['Integer', 'Long', 'Double', 'Float'].includes(selectedType)) {
      return (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Please input"
          value={value as number}
          onChange={(val) => handleValueChange(val, field)}
          disabled={readOnly}
          step={selectedType === 'Integer' || selectedType === 'Long' ? 1 : 0.1}
        />
      );
    }

    if (selectedType === 'LocalDate') {
      return (
        <DatePicker
          style={{ width: '100%' }}
          placeholder="Select date"
          format="DD.MM.YYYY"
          value={value ? dayjs(value as string) : null}
          onChange={(date) => handleValueChange(date ? date.format('YYYY-MM-DD') : '', field)}
          disabled={readOnly}
        />
      );
    }

    if (selectedType === 'LocalDateTime' || selectedType.indexOf('Date') !== -1) {
      return (
        <DatePicker
          showTime
          style={{ width: '100%' }}
          placeholder="Select date and time"
          format="DD.MM.YYYY HH:mm:ss"
          value={value ? dayjs(value as string) : null}
          onChange={(date) => handleValueChange(date ? date.toISOString() : '', field)}
          disabled={readOnly}
        />
      );
    }

    if (selectedType === 'Boolean') {
      return (
        <Select
          style={{ width: '100%' }}
          placeholder="Select"
          value={value as boolean}
          onChange={(val) => handleValueChange(val, field)}
          disabled={readOnly}
          options={[
            { label: 'True', value: true },
            { label: 'False', value: false },
          ]}
        />
      );
    }

    return (
      <Input
        placeholder="Please input"
        value={value as string}
        onChange={(e) => handleValueChange(e.target.value, field)}
        disabled={readOnly}
      />
    );
  };

  return (
    <div className={`builder-condition-row ${isLast ? 'last' : ''} ${className}`}>
      <Row gutter={16}>
        <Col span={5} className={isExistErrorFieldName && showErrors ? 'col-err' : ''}>
          <Select
            showSearch
            placeholder="Select field"
            value={condition.fieldName}
            onChange={handleFieldNameChange}
            disabled={disableColumn || readOnly}
            style={{ width: '100%' }}
            options={cols.map((col) => ({
              label: shortLabel(col.alias),
              value: col.alias,
            }))}
          />
        </Col>

        <Col span={6} className={isExistErrorOperation && showErrors ? 'col-err' : ''}>
          <Select
            showSearch
            placeholder="Select operation"
            value={condition.operation}
            onChange={handleOperationChange}
            disabled={readOnly}
            style={{ width: '100%' }}
            options={conditionTypesFiltered.map((ct) => ({
              label: ct.label,
              value: ct.key,
            }))}
          />
        </Col>

        {selectedConditionType.isRange ? (
          <>
            <Col span={5}>{renderValueInput('from')}</Col>
            <Col span={5}>{renderValueInput('to')}</Col>
          </>
        ) : selectedConditionType.disableValueField ? null : (
          <Col span={6}>{renderValueInput('value')}</Col>
        )}

        {!disableRemove && !readOnly && (
          <Col span={2}>
            <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={handleRemove} />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default FilterBuilderCondition;


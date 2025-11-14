import React from 'react';
import { Row, Col, Select, Input, Button, InputNumber, DatePicker } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Condition } from './HelperFilter';

interface FilterBuilderConditionProps {
  condition: Condition;
  cols: Array<{ alias: string; type: string; typeShort?: string }>;
  readOnly?: boolean;
  showErrors?: boolean;
  disableRemove?: boolean;
  disableColumn?: boolean;
  className?: string;
  isLast?: boolean;
  onRemove: () => void;
  onChange: (condition: Condition) => void;
}

const conditionTypes = [
  {
    '@bean': 'com.cyoda.core.conditions.queryable.Equals',
    key: 'EQUALS',
    label: 'equals',
    types: ['String', 'UUID', 'Integer', 'Long', 'Double', 'Boolean'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.NotEquals',
    key: 'NOT_EQUAL',
    label: 'not equal',
    types: ['String', 'UUID', 'Integer', 'Long', 'Double', 'Boolean'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.nonqueryable.IEquals',
    key: 'IEQUALS',
    label: 'equals (disregard case)',
    types: ['String', 'UUID'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.Contains',
    key: 'CONTAINS',
    label: 'contains',
    types: ['String'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
    key: 'GREATER_THAN',
    label: 'greater than',
    types: ['Integer', 'Long', 'Double', 'Date', 'DateTime'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.LessThan',
    key: 'LESS_THAN',
    label: 'less than',
    types: ['Integer', 'Long', 'Double', 'Date', 'DateTime'],
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.Between',
    key: 'BETWEEN',
    label: 'between',
    types: ['Integer', 'Long', 'Double', 'Date', 'DateTime'],
    isRange: true,
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.IsNull',
    key: 'IS_NULL',
    label: 'is null',
    types: ['String', 'UUID', 'Integer', 'Long', 'Double', 'Boolean', 'Date', 'DateTime'],
    disableValueField: true,
  },
  {
    '@bean': 'com.cyoda.core.conditions.queryable.IsNotNull',
    key: 'IS_NOT_NULL',
    label: 'is not null',
    types: ['String', 'UUID', 'Integer', 'Long', 'Double', 'Boolean', 'Date', 'DateTime'],
    disableValueField: true,
  },
];

const FilterBuilderCondition: React.FC<FilterBuilderConditionProps> = ({
  condition,
  cols,
  readOnly = false,
  showErrors = false,
  disableRemove = false,
  disableColumn = false,
  className = '',
  isLast = false,
  onRemove,
  onChange,
}) => {
  const selectedCol = cols.find((col) => col.alias === condition.fieldName);
  // Use typeShort if available, otherwise extract from type, or default to 'String'
  const fieldType = selectedCol?.typeShort ||
    (selectedCol?.type?.includes('.') ? selectedCol.type.split('.').pop() : selectedCol?.type) ||
    'String';

  // Full Java class name for @type property (e.g., "java.lang.String")
  const fieldTypeFullName = selectedCol?.type || 'java.lang.String';

  const filteredConditionTypes = conditionTypes.filter((ct) =>
    ct.types.includes(fieldType)
  );

  const selectedConditionType = conditionTypes.find(
    (ct) => ct.key === condition.operation
  );

  const handleFieldNameChange = (value: string) => {
    const col = cols.find((c) => c.alias === value);
    const newCondition = {
      ...condition,
      fieldName: value,
      operation: '',
      value: {
        '@type': col?.type || 'java.lang.String',
        value: '',
      },
    };
    onChange(newCondition);
  };

  const handleOperationChange = (value: string) => {
    const condType = conditionTypes.find((ct) => ct.key === value);
    const newCondition: Condition = {
      ...condition,
      operation: value,
      '@bean': condType?.['@bean'] || '',
    };

    if (condType?.isRange) {
      newCondition.from = {
        '@type': fieldTypeFullName,
        value: '',
      };
      newCondition.to = {
        '@type': fieldTypeFullName,
        value: '',
      };
      delete newCondition.value;
    } else if (condType?.disableValueField) {
      delete newCondition.value;
      delete newCondition.from;
      delete newCondition.to;
    } else {
      newCondition.value = {
        '@type': fieldTypeFullName,
        value: '',
      };
      delete newCondition.from;
      delete newCondition.to;
    }

    onChange(newCondition);
  };

  const handleValueChange = (value: any) => {
    const newCondition = {
      ...condition,
      value: {
        '@type': fieldTypeFullName,
        value,
      },
    };
    onChange(newCondition);
  };

  const handleFromChange = (value: any) => {
    const newCondition = {
      ...condition,
      from: {
        '@type': fieldTypeFullName,
        value,
      },
    };
    onChange(newCondition);
  };

  const handleToChange = (value: any) => {
    const newCondition = {
      ...condition,
      to: {
        '@type': fieldTypeFullName,
        value,
      },
    };
    onChange(newCondition);
  };

  const renderValueInput = (value: any, onChange: (val: any) => void) => {
    if (fieldType === 'Boolean') {
      return (
        <Select value={value} onChange={onChange} disabled={readOnly}>
          <Select.Option value={true}>True</Select.Option>
          <Select.Option value={false}>False</Select.Option>
        </Select>
      );
    }

    if (fieldType === 'Integer' || fieldType === 'Long' || fieldType === 'Double') {
      return (
        <InputNumber
          value={value}
          onChange={onChange}
          disabled={readOnly}
          style={{ width: '100%' }}
        />
      );
    }

    if (fieldType === 'Date' || fieldType === 'DateTime') {
      return (
        <DatePicker
          value={value}
          onChange={onChange}
          disabled={readOnly}
          showTime={fieldType === 'DateTime'}
          style={{ width: '100%' }}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        placeholder="Please input"
      />
    );
  };

  const shortLabel = (alias: string) => {
    const parts = alias.split('.');
    return parts[parts.length - 1];
  };

  return (
    <div className={`builder-condition-row ${className}`}>
      <Row gutter={12}>
        <Col span={6} className={showErrors && !condition.fieldName ? 'col-err' : ''}>
          <Select
            value={condition.fieldName || undefined}
            onChange={handleFieldNameChange}
            disabled={disableColumn || readOnly}
            placeholder="Select"
            showSearch
            style={{ width: '100%' }}
          >
            {cols.map((col) => (
              <Select.Option key={col.alias} value={col.alias}>
                {shortLabel(col.alias)}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={6} className={showErrors && !condition.operation ? 'col-err' : ''}>
          <Select
            value={condition.operation || undefined}
            onChange={handleOperationChange}
            disabled={readOnly}
            placeholder="Select"
            showSearch
            style={{ width: '100%' }}
          >
            {filteredConditionTypes.map((ct) => (
              <Select.Option key={ct.key} value={ct.key}>
                {ct.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        {selectedConditionType?.isRange ? (
          <>
            <Col span={4}>
              {renderValueInput(condition.from?.value, handleFromChange)}
            </Col>
            <Col span={4}>
              {renderValueInput(condition.to?.value, handleToChange)}
            </Col>
          </>
        ) : selectedConditionType?.disableValueField ? null : (
          <Col span={8}>
            {renderValueInput(condition.value?.value, handleValueChange)}
          </Col>
        )}
        {!disableRemove && !readOnly && (
          <Col span={2}>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={onRemove}
              shape="circle"
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default FilterBuilderCondition;


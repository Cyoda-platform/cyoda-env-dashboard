import React from 'react';
import { Button, Radio, Dropdown, Space, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import FilterBuilderCondition from './FilterBuilderCondition';
import HelperFilter, { type GroupCondition, type Condition } from './HelperFilter';
import './FilterBuilder.scss';

interface FilterBuilderGroupProps {
  condition: GroupCondition;
  cols: Array<{ alias: string; type: string }>;
  level?: number;
  readOnly?: boolean;
  showErrors?: boolean;
  className?: string;
  onChange: (condition: GroupCondition) => void;
  onRemove?: () => void;
}

const FilterBuilderGroup: React.FC<FilterBuilderGroupProps> = ({
  condition,
  cols,
  level = 0,
  readOnly = false,
  showErrors = false,
  className = '',
  onChange,
  onRemove,
}) => {
  const handleOperatorChange = (e: any) => {
    onChange({
      ...condition,
      operator: e.target.value,
    });
  };

  const handleAddGroup = () => {
    const newConditions = [...condition.conditions, HelperFilter.getGroup()];
    onChange({
      ...condition,
      conditions: newConditions,
    });
  };

  const handleAddCondition = () => {
    const newCondition = HelperFilter.getCondition();
    const groupIndex = condition.conditions.findIndex((c) =>
      HelperFilter.isGroupCondition(c)
    );

    let newConditions;
    if (groupIndex !== -1) {
      newConditions = [...condition.conditions];
      newConditions.splice(groupIndex, 0, newCondition);
    } else {
      newConditions = [...condition.conditions, newCondition];
    }

    onChange({
      ...condition,
      conditions: newConditions,
    });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = condition.conditions.filter((_, i) => i !== index);
    onChange({
      ...condition,
      conditions: newConditions,
    });
  };

  const handleConditionChange = (index: number, newCondition: Condition | GroupCondition) => {
    const newConditions = [...condition.conditions];
    newConditions[index] = newCondition;
    onChange({
      ...condition,
      conditions: newConditions,
    });
  };

  const handleRemoveGroup = () => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to delete group?',
      onOk: () => {
        if (onRemove) {
          onRemove();
        }
      },
    });
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'group',
      label: 'Add new group',
      onClick: handleAddGroup,
    },
    {
      key: 'condition',
      label: 'Add new condition',
      onClick: handleAddCondition,
    },
  ];

  return (
    <div className={`builder-condition-group ${level === 0 ? 'first' : ''} ${className}`}>
      <div className="group-actions" style={{ marginBottom: '16px' }}>
        <Space>
          <Radio.Group
            value={condition.operator}
            onChange={handleOperatorChange}
            disabled={readOnly}
            buttonStyle="solid"
          >
            <Radio.Button value="AND">Match All</Radio.Button>
            <Radio.Button value="OR">Match Any</Radio.Button>
          </Radio.Group>

          {!readOnly && (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="primary" shape="circle" icon={<PlusOutlined />} />
            </Dropdown>
          )}

          {level > 0 && !readOnly && (
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={handleRemoveGroup}
            />
          )}
        </Space>
      </div>

      <div className="group-conditions">
        {condition.conditions.map((childCondition, index) => {
          const isLast = !condition.conditions[index + 1];
          const innerFieldsClass = `inner-fields ${isLast ? 'last' : ''}`;

          if (HelperFilter.isGroupCondition(childCondition)) {
            return (
              <FilterBuilderGroup
                key={`group-${level}-${index}`}
                condition={childCondition}
                cols={cols}
                level={level + 1}
                readOnly={readOnly}
                showErrors={showErrors}
                className={innerFieldsClass}
                onChange={(newCondition) => handleConditionChange(index, newCondition)}
                onRemove={() => handleRemoveCondition(index)}
              />
            );
          } else {
            return (
              <FilterBuilderCondition
                key={`condition-${level}-${index}`}
                condition={childCondition}
                cols={cols}
                readOnly={readOnly}
                showErrors={showErrors}
                className={innerFieldsClass}
                isLast={isLast}
                onChange={(newCondition) => handleConditionChange(index, newCondition)}
                onRemove={() => handleRemoveCondition(index)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default FilterBuilderGroup;


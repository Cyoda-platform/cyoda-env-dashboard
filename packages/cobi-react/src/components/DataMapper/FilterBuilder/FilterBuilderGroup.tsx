import React from 'react';
import { Button, Radio, Dropdown, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { FilterGroup, FilterCondition, ColumnInfo, GROUP_CONDITION_TYPES } from './types';
import { HelperFilter } from './helpers';
import FilterBuilderCondition from './FilterBuilderCondition';
import './FilterBuilderGroup.css';

interface FilterBuilderGroupProps {
  condition: FilterGroup;
  cols: ColumnInfo[];
  level?: number;
  showErrors?: boolean;
  readOnly?: boolean;
  onRemove?: () => void;
  onChange: () => void;
}

const FilterBuilderGroup: React.FC<FilterBuilderGroupProps> = ({
  condition,
  cols,
  level = 0,
  showErrors = false,
  readOnly = false,
  onRemove,
  onChange,
}) => {
  // Handle operator change
  const handleOperatorChange = (e: any) => {
    condition.operator = e.target.value;
    onChange();
  };

  // Add new group
  const handleNewGroup = () => {
    condition.conditions.push(HelperFilter.getGroup());
    onChange();
  };

  // Add new condition
  const handleNewCondition = () => {
    const isExistGroupCondition = condition.conditions.findIndex((el) =>
      HelperFilter.isGroup(el)
    );
    if (isExistGroupCondition !== -1) {
      condition.conditions.splice(isExistGroupCondition, 0, HelperFilter.getCondition());
    } else {
      condition.conditions.push(HelperFilter.getCondition());
    }
    onChange();
  };

  // Remove condition/group at index
  const handleRemoveCondition = (index: number) => {
    condition.conditions.splice(index, 1);
    onChange();
  };

  // Remove this group
  const handleRemoveGroup = () => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to delete group?',
      onOk: onRemove,
    });
  };

  // Check if condition at index is a group
  const isGroup = (index: number): boolean => {
    const cond = condition.conditions[index];
    return cond ? HelperFilter.isGroup(cond) : false;
  };

  // Dropdown menu items
  const menuItems: MenuProps['items'] = [
    {
      key: 'group',
      label: 'Add new group',
      onClick: handleNewGroup,
    },
    {
      key: 'condition',
      label: 'Add new condition',
      onClick: handleNewCondition,
    },
  ];

  return (
    <div
      className={`builder-condition-group ${level > 0 ? 'wrap-actions' : ''} ${
        level === 0 ? 'first' : ''
      }`}
    >
      <div className="group-actions">
        <Radio.Group
          value={condition.operator}
          onChange={handleOperatorChange}
          disabled={readOnly}
          buttonStyle="solid"
        >
          {GROUP_CONDITION_TYPES.map((gct) => (
            <Radio.Button key={gct.key} value={gct.key}>
              {gct.label}
            </Radio.Button>
          ))}
        </Radio.Group>

        {!readOnly && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              className="button-add"
            />
          </Dropdown>
        )}

        {level > 0 && (
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={handleRemoveGroup}
            className="button-delete"
          />
        )}
      </div>

      {condition.conditions.map((childCondition, index) => {
        const isLast = !condition.conditions[index + 1];
        const className = `inner-fields ${isLast ? 'last' : ''}`;

        if (isGroup(index)) {
          return (
            <div key={`${index}-${level + 1}`} className={className}>
              <FilterBuilderGroup
                condition={childCondition as FilterGroup}
                cols={cols}
                level={level + 1}
                showErrors={showErrors}
                readOnly={readOnly}
                onRemove={() => handleRemoveCondition(index)}
                onChange={onChange}
              />
            </div>
          );
        } else {
          return (
            <div key={`${index}-${level + 1}`} className={className}>
              <FilterBuilderCondition
                condition={childCondition as FilterCondition}
                cols={cols}
                showErrors={showErrors}
                readOnly={readOnly}
                isLast={isLast}
                onRemove={() => handleRemoveCondition(index)}
                onChange={onChange}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

export default FilterBuilderGroup;


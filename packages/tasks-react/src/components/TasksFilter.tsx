/**
 * TasksFilter Component
 * Filter controls for tasks list
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/TasksFilter.vue
 */

import React, { useEffect, memo, useCallback, useMemo } from 'react';
import { Form, Select, Row, Col, Divider } from 'antd';
import { HelperStorage, HelperDictionary } from '@cyoda/ui-lib-react';
import type { TaskFilterType } from '../types';
import './TasksFilter.scss';

const { Option } = Select;

interface TasksFilterProps {
  onChangeFilter: (filter: TaskFilterType) => void;
}

const defaultFilter: TaskFilterType = {
  status_id: undefined,
  assignee_id: undefined,
  priority_id: undefined,
};

const helperStorage = new HelperStorage();

export const TasksFilter: React.FC<TasksFilterProps> = memo(({ onChangeFilter }) => {
  const [form] = Form.useForm();

  // Load saved filter from storage
  useEffect(() => {
    const savedFilter = helperStorage.get<TaskFilterType>('TasksFilter', defaultFilter);
    form.setFieldsValue(savedFilter);
    onChangeFilter(savedFilter);
  }, [form, onChangeFilter]);

  const handleValuesChange = useCallback((_: any, allValues: TaskFilterType) => {
    console.log('🔍 Filter values changed:', allValues);
    helperStorage.set('TasksFilter', allValues);
    onChangeFilter(allValues);
  }, [onChangeFilter]);

  // Memoize options to prevent re-creating on every render
  const optionsStatus = useMemo(() => HelperDictionary.statuses || [], []);
  const optionsAssignee = useMemo(() => HelperDictionary.users || [], []);
  const optionsPriority = useMemo(() => HelperDictionary.priorities || [], []);

  return (
    <div className="tasks-filters" role="search" aria-label="Filter tasks">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={defaultFilter}
        aria-label="Task filters form"
      >
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="By Status" name="status_id">
              <Select
                placeholder="-- Select --"
                allowClear
                aria-label="Filter by status"
                aria-describedby="status-filter-description"
                classNames={{ popup: { root: 'tasks-filter-dropdown' } }}
                styles={{ popup: { root: { minWidth: '300px' } } }}
              >
                {optionsStatus.map((item: any) => (
                  <Option key={item.key} value={item.key}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <span id="status-filter-description" className="sr-only">
              Filter tasks by their current status
            </span>
          </Col>
          <Col span={8}>
            <Form.Item label="By Assignee" name="assignee_id">
              <Select
                placeholder="-- Select --"
                allowClear
                aria-label="Filter by assignee"
                aria-describedby="assignee-filter-description"
                classNames={{ popup: { root: 'tasks-filter-dropdown' } }}
                styles={{ popup: { root: { minWidth: '300px' } } }}
              >
                {optionsAssignee.map((item: any) => (
                  <Option key={item.name} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <span id="assignee-filter-description" className="sr-only">
              Filter tasks by assigned user
            </span>
          </Col>
          <Col span={8}>
            <Form.Item label="By Priority" name="priority_id">
              <Select
                placeholder="-- Select --"
                allowClear
                aria-label="Filter by priority"
                aria-describedby="priority-filter-description"
                classNames={{ popup: { root: 'tasks-filter-dropdown' } }}
                styles={{ popup: { root: { minWidth: '300px' } } }}
              >
                {optionsPriority.map((item: any) => (
                  <Option key={item.key} value={item.key}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <span id="priority-filter-description" className="sr-only">
              Filter tasks by priority level
            </span>
          </Col>
        </Row>
      </Form>
      <Divider role="separator" />
    </div>
  );
});
TasksFilter.displayName = 'TasksFilter';


/**
 * TasksFilter Component
 * Filter controls for tasks list
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/TasksFilter.vue
 */

import React, { useEffect } from 'react';
import { Form, Select, Row, Col, Divider } from 'antd';
import { HelperStorage, HelperDictionary } from '@cyoda/ui-lib-react';
import type { TaskFilterType } from '../types';

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

export const TasksFilter: React.FC<TasksFilterProps> = ({ onChangeFilter }) => {
  const [form] = Form.useForm();

  // Load saved filter from storage
  useEffect(() => {
    const savedFilter = helperStorage.get<TaskFilterType>('TasksFilter', defaultFilter);
    form.setFieldsValue(savedFilter);
    onChangeFilter(savedFilter);
  }, []);

  const handleValuesChange = (_: any, allValues: TaskFilterType) => {
    helperStorage.set('TasksFilter', allValues);
    onChangeFilter(allValues);
  };

  const optionsStatus = HelperDictionary.statuses || [];
  const optionsAssignee = HelperDictionary.users || [];
  const optionsPriority = HelperDictionary.priorities || [];

  return (
    <div className="tasks-filters">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={defaultFilter}
      >
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="By Status" name="status_id">
              <Select placeholder="-- Select --" allowClear>
                {optionsStatus.map((item: any) => (
                  <Option key={item.key} value={item.key}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="By Assignee" name="assignee_id">
              <Select placeholder="-- Select --" allowClear>
                {optionsAssignee.map((item: any) => (
                  <Option key={item.name} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="By Priority" name="priority_id">
              <Select placeholder="-- Select --" allowClear>
                {optionsPriority.map((item: any) => (
                  <Option key={item.key} value={item.key}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Divider />
    </div>
  );
};


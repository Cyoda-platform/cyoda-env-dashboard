/**
 * ConfigEditorReportsFilter Component
 * Filter component for Report Configs page
 */

import React from 'react';
import { Form, Input, Select, Row, Col, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import './ConfigEditorReportsFilter.scss';

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterForm {
  search?: string;
  authors?: string[];
  entities?: string[];
  states?: string[];
  types?: string[];
  time_custom?: Date | null;
}

interface ConfigEditorReportsFilterProps {
  value: FilterForm;
  onChange: (value: FilterForm) => void;
  usersOptions: FilterOption[];
  entityOptions: FilterOption[];
  stateOptions?: FilterOption[];
  typeOptions?: FilterOption[];
}

const ConfigEditorReportsFilter: React.FC<ConfigEditorReportsFilterProps> = ({
  value,
  onChange,
  usersOptions,
  entityOptions,
  stateOptions = [],
  typeOptions = [],
}) => {
  const handleFieldChange = (field: keyof FilterForm, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Time shortcuts for date picker
  const timeShortcuts = [
    {
      text: 'Past hour',
      value: () => dayjs().subtract(1, 'hour'),
    },
    {
      text: 'Past 24 hours',
      value: () => dayjs().subtract(24, 'hour'),
    },
    {
      text: 'Past week',
      value: () => dayjs().subtract(7, 'day'),
    },
    {
      text: 'Past month',
      value: () => dayjs().subtract(30, 'day'),
    },
    {
      text: 'Past year',
      value: () => dayjs().subtract(365, 'day'),
    },
  ];

  // Disable future dates
  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <div className="config-editor-reports-filter">
      <h2>Filter</h2>
      <Form layout="vertical">
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="Author or Group:">
              <Select
                mode="multiple"
                placeholder="Select"
                value={value.authors}
                onChange={(val) => handleFieldChange('authors', val)}
                options={usersOptions}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Entity:">
              <Select
                mode="multiple"
                placeholder="Select"
                value={value.entities}
                onChange={(val) => handleFieldChange('entities', val)}
                options={entityOptions}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="By date and time:">
              <DatePicker
                showTime
                format="DD.MM.YYYY HH:mm:ss"
                placeholder="Select from date and time"
                value={value.time_custom ? dayjs(value.time_custom) : null}
                onChange={(date) => handleFieldChange('time_custom', date ? date.toDate() : null)}
                disabledDate={disabledDate}
                presets={timeShortcuts.map((shortcut) => ({
                  label: shortcut.text,
                  value: shortcut.value(),
                }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Search:">
              <Input
                placeholder="Search Report name and description here..."
                value={value.search}
                onChange={(e) => handleFieldChange('search', e.target.value)}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ConfigEditorReportsFilter;


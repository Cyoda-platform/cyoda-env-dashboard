/**
 * ConfigEditorReportsFilter Component
 * Filter component for Report Configs page
 */

import React from 'react';
import { Form, Input, Select, Row, Col } from 'antd';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterForm {
  search?: string;
  authors?: string[];
  entities?: string[];
}

interface ConfigEditorReportsFilterProps {
  value: FilterForm;
  onChange: (value: FilterForm) => void;
  usersOptions: FilterOption[];
  entityOptions: FilterOption[];
}

const ConfigEditorReportsFilter: React.FC<ConfigEditorReportsFilterProps> = ({
  value,
  onChange,
  usersOptions,
  entityOptions,
}) => {
  const handleFieldChange = (field: keyof FilterForm, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className="config-editor-reports-filter">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Search">
            <Input
              placeholder="Search by name or description"
              value={value.search}
              onChange={(e) => handleFieldChange('search', e.target.value)}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Authors">
            <Select
              mode="multiple"
              placeholder="Select authors"
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
          <Form.Item label="Entity Types">
            <Select
              mode="multiple"
              placeholder="Select entity types"
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
      </Row>
    </div>
  );
};

export default ConfigEditorReportsFilter;


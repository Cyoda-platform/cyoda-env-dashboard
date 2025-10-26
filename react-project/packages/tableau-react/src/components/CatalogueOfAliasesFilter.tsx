/**
 * Catalogue of Aliases Filter Component
 * Migrated from: .old_project/packages/http-api/src/components/CatalogOfAliasesFilter/CatalogOfAliasesFilter.vue
 * 
 * Provides filtering options for the catalogue of aliases
 */

import React from 'react';
import { Form, Select, DatePicker, Input, Row, Col } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import './CatalogueOfAliasesFilter.scss';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterForm {
  states?: string[];
  entities?: string[];
  authors?: string[];
  time_custom?: string;
  search?: string;
}

interface CatalogueOfAliasesFilterProps {
  value: FilterForm;
  onChange: (value: FilterForm) => void;
  usersOptions: FilterOption[];
  entityOptions: FilterOption[];
  stateOptions: FilterOption[];
}

const CatalogueOfAliasesFilter: React.FC<CatalogueOfAliasesFilterProps> = ({
  value,
  onChange,
  usersOptions,
  entityOptions,
  stateOptions,
}) => {
  const handleFieldChange = (field: keyof FilterForm, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleDateChange = (date: Moment | null) => {
    handleFieldChange('time_custom', date ? date.toISOString() : undefined);
  };

  // Preset time ranges
  const presets = [
    { label: 'Past hour', value: moment().subtract(1, 'hour') },
    { label: 'Past 24 hours', value: moment().subtract(24, 'hour') },
    { label: 'Past week', value: moment().subtract(7, 'day') },
    { label: 'Past month', value: moment().subtract(30, 'day') },
    { label: 'Past year', value: moment().subtract(1, 'year') },
  ];

  return (
    <div className="catalogue-of-aliases-filter">
      <h2>Filter</h2>
      <Form layout="vertical">
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="Filter by state:">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select"
                value={value.states}
                onChange={(val) => handleFieldChange('states', val)}
                options={stateOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Entity:">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select"
                value={value.entities}
                onChange={(val) => handleFieldChange('entities', val)}
                options={entityOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Author or Group:">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select"
                value={value.authors}
                onChange={(val) => handleFieldChange('authors', val)}
                options={usersOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="By date and time:">
              <DatePicker
                showTime
                placeholder="Select from date and time"
                value={value.time_custom ? moment(value.time_custom) : null}
                onChange={handleDateChange}
                presets={presets}
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
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CatalogueOfAliasesFilter;


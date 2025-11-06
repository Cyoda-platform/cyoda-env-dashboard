/**
 * Processing Events Entities Error List View Filter
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/Component/PmProcessingEventsEntitiesErrorListViewFilter.vue
 */

import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Row, Col, Divider } from 'antd';
import { useEntitiesListPossible } from '../../hooks';
import './ProcessingEventsEntitiesErrorListViewFilter.scss';

interface FilterForm {
  type: string;
}

interface ProcessingEventsEntitiesErrorListViewFilterProps {
  onChange: (form: FilterForm) => void;
  isLoading?: boolean;
}

export const ProcessingEventsEntitiesErrorListViewFilter: React.FC<
  ProcessingEventsEntitiesErrorListViewFilterProps
> = ({ onChange, isLoading = false }) => {
  const [form, setForm] = useState<FilterForm>({ type: 'ALL' });
  const [entityClassOptions, setEntityClassOptions] = useState<string[]>([]);

  const { data } = useEntitiesListPossible();

  useEffect(() => {
    if (data?.data) {
      setEntityClassOptions([...data.data, 'ALL']);
      onChange(form);
    }
  }, [data]);

  const handleSubmit = () => {
    onChange(form);
  };

  return (
    <Form className="pm-processing-events-entities-error-list-view-filter" layout="vertical">
      <h3>Filter</h3>
      <Row gutter={20} className="wrap-row">
        <Col span={10}>
          <Form.Item label="Entity class">
            <Select
              showSearch
              value={form.type}
              onChange={(value) => setForm({ ...form, type: value })}
              options={entityClassOptions.map((item) => ({ label: item, value: item }))}
              popupClassName="processing-events-entities-error-list-view-filter-dropdown"
              dropdownStyle={{ minWidth: '400px' }}
            />
          </Form.Item>
        </Col>
        <Col span={4} className="action-item">
          <Form.Item label=" ">
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
              Load
            </Button>
          </Form.Item>
        </Col>
      </Row>
      <Divider />
    </Form>
  );
};

export default ProcessingEventsEntitiesErrorListViewFilter;


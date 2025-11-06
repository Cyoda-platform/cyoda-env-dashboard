/**
 * PM Components Execution Monitors Filter
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors/PmShardsDetailTabPmComponentsExecutionMonitorsFilter.vue
 */

import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Row, Col } from 'antd';
import './PmComponentsExecutionMonitorsFilter.scss';

interface FilterForm {
  name: string;
  updateInterval: number;
}

interface PmComponentsExecutionMonitorsFilterProps {
  onFilter: (form: FilterForm) => void;
}

export const PmComponentsExecutionMonitorsFilter: React.FC<PmComponentsExecutionMonitorsFilterProps> = ({
  onFilter,
}) => {
  const [form, setForm] = useState<FilterForm>({
    name: '',
    updateInterval: 2,
  });

  useEffect(() => {
    // Emit initial filter on mount
    onFilter(form);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newForm = { ...form, name: e.target.value };
    setForm(newForm);
    onFilter(newForm);
  };

  const handleIntervalChange = (value: number | null) => {
    if (value !== null) {
      setForm({ ...form, updateInterval: value });
    }
  };

  const handleSubmit = () => {
    onFilter(form);
  };

  return (
    <Form className="pm-components-execution-monitors-filter" layout="vertical">
      <h3>Filter</h3>
      <Row gutter={20} className="wrap-row">
        <Col span={5}>
          <Form.Item label="Filter by name">
            <Input
              value={form.name}
              onChange={handleNameChange}
              placeholder="Filter by name"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Update Interval (seconds)">
            <InputNumber
              min={1}
              value={form.updateInterval}
              onChange={handleIntervalChange}
              placeholder="Update Interval"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={4} className="action-item">
          <Button type="primary" onClick={handleSubmit}>
            Update
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default PmComponentsExecutionMonitorsFilter;


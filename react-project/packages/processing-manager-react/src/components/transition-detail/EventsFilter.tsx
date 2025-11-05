/**
 * Events Filter Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/Events/EventsFilter.vue
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Form, Select, Button, Row, Col } from 'antd';
import {
  useEntitiesListPossible,
  useTransactionEventStatusesList,
  useProcessingQueues,
} from '../../hooks';
import './EventsFilter.scss';

interface FilterValues {
  queue: string;
  status: string;
  entityClass: string;
  hasErrors: boolean;
  sort: string;
}

interface EventsFilterProps {
  isLoading?: boolean;
  onChange?: (values: FilterValues) => void;
}

export interface EventsFilterRef {
  form: FilterValues;
}

export const EventsFilter = forwardRef<EventsFilterRef, EventsFilterProps>(
  ({ isLoading = false, onChange }, ref) => {
    const [form, setForm] = useState<FilterValues>({
      queue: '',
      status: '',
      entityClass: '',
      hasErrors: false,
      sort: 'ASC',
    });

    const { data: entityClassesData } = useEntitiesListPossible();
    const { data: statusesData } = useTransactionEventStatusesList();
    const { data: queuesData } = useProcessingQueues();

    const entityClassOptions = Array.isArray(entityClassesData)
      ? entityClassesData.map((el: string) => ({
          label: el,
          value: el,
        }))
      : [];

    const transactionStatusOptions = Array.isArray(statusesData)
      ? statusesData.map((el: string) => ({
          label: el,
          value: el,
        }))
      : [];

    const queueOptions = (Array.isArray(queuesData) ? queuesData : []);

    useImperativeHandle(ref, () => ({
      form,
    }));

    const handleSubmit = () => {
      onChange?.(form);
    };

    const handleFieldChange = (field: keyof FilterValues, value: any) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
      <Card title="Filter">
        <Form layout="vertical" className="events-filter">
          <Row gutter={20} className="wrap-row">
            <Col span={12}>
              <Form.Item label="Queue">
                <Select
                  showSearch
                  allowClear
                  value={form.queue}
                  onChange={(value) => handleFieldChange('queue', value || '')}
                  options={queueOptions.map((q) => ({ value: q, label: q }))}
                  popupClassName="events-filter-dropdown"
                  dropdownStyle={{ minWidth: '400px' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Entity class">
                <Select
                  showSearch
                  allowClear
                  value={form.entityClass}
                  onChange={(value) => handleFieldChange('entityClass', value || '')}
                  options={entityClassOptions}
                  popupClassName="events-filter-dropdown"
                  dropdownStyle={{ minWidth: '400px' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Transaction Status">
                <Select
                  showSearch
                  allowClear
                  value={form.status}
                  onChange={(value) => handleFieldChange('status', value || '')}
                  options={transactionStatusOptions}
                  popupClassName="events-filter-dropdown"
                  dropdownStyle={{ minWidth: '400px' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Has error">
                <Select
                  value={form.hasErrors}
                  onChange={(value) => handleFieldChange('hasErrors', value)}
                  options={[
                    { label: 'True', value: true },
                    { label: 'False', value: false },
                  ]}
                  placeholder="Please select"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Sort">
                <Select
                  value={form.sort}
                  onChange={(value) => handleFieldChange('sort', value)}
                  options={[
                    { label: 'Asc', value: 'ASC' },
                    { label: 'Desc', value: 'DESC' },
                  ]}
                  placeholder="Sort"
                />
              </Form.Item>
            </Col>
            <Col span={6} className="action-item">
              <Button type="primary" onClick={handleSubmit} loading={isLoading}>
                Load
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
);

EventsFilter.displayName = 'EventsFilter';

export default EventsFilter;


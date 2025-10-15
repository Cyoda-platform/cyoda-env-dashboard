/**
 * Transactions Entities Filter Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities/PmShardsDetailTabTransactionsEntitiesFilter.vue
 */

import React, { useState, useEffect } from 'react';
import { Form, Select, Input, DatePicker, Button, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { useEntitiesListPossible } from '../../hooks';
import './TransactionsEntitiesFilter.scss';

interface FilterValues {
  entityClass: string;
  id: string;
  dateFrom: string;
  dateTo: string;
}

interface TransactionsEntitiesFilterProps {
  isLoading?: boolean;
  onChange?: (values: FilterValues) => void;
}

export const TransactionsEntitiesFilter: React.FC<TransactionsEntitiesFilterProps> = ({
  isLoading = false,
  onChange,
}) => {
  const [form, setForm] = useState<FilterValues>({
    entityClass: '',
    id: '',
    dateFrom: dayjs().subtract(1, 'days').format('YYYY-MM-DD'),
    dateTo: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  });

  const { data: entityClassesData } = useEntitiesListPossible();

  const entityClassOptions = Array.isArray(entityClassesData)
    ? entityClassesData.map((el: string) => ({
        label: el,
        value: el,
      }))
    : [];

  useEffect(() => {
    if (Array.isArray(entityClassesData) && entityClassesData.length > 0) {
      const initialClass = entityClassesData[0];
      setForm((prev) => ({ ...prev, entityClass: initialClass }));
      onChange?.({ ...form, entityClass: initialClass });
    }
  }, [entityClassesData]);

  const handleSubmit = () => {
    if (form.entityClass) {
      onChange?.(form);
    }
  };

  const handleFieldChange = (field: keyof FilterValues, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form layout="vertical" className="pm-shards-detail-tab-transactions-entities-filter">
      <h3>Filter</h3>
      <Row gutter={20} className="wrap-row">
        <Col span={5}>
          <Form.Item label="Entity class">
            <Select
              showSearch
              value={form.entityClass}
              onChange={(value) => handleFieldChange('entityClass', value)}
              options={entityClassOptions}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Entity ID">
            <Input
              allowClear
              value={form.id}
              onChange={(e) => handleFieldChange('id', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Time From">
            <DatePicker
              format="YYYY-MM-DD"
              value={form.dateFrom ? dayjs(form.dateFrom) : null}
              onChange={(date) =>
                handleFieldChange('dateFrom', date ? dayjs(date).format('YYYY-MM-DD') : '')
              }
              placeholder="Pick a day"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Time To">
            <DatePicker
              format="YYYY-MM-DD"
              value={form.dateTo ? dayjs(form.dateTo) : null}
              onChange={(date) =>
                handleFieldChange('dateTo', date ? dayjs(date).format('YYYY-MM-DD') : '')
              }
              placeholder="Pick a day"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={4} className="action-item">
          <Button type="primary" onClick={handleSubmit} loading={isLoading}>
            Load
          </Button>
        </Col>
      </Row>
      <hr />
    </Form>
  );
};

export default TransactionsEntitiesFilter;


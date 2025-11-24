/**
 * Transactions View Filter Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView/PmShardsDetailTabTransactionsViewFilter.vue
 */

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { useTransactionStatuses } from '../../hooks';
import './TransactionsViewFilter.scss';

interface FilterValues {
  transactionId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sort: string;
}

interface TransactionsViewFilterProps {
  isLoading?: boolean;
  onChange?: (values: FilterValues) => void;
}

export const TransactionsViewFilter: React.FC<TransactionsViewFilterProps> = ({
  isLoading = false,
  onChange,
}) => {
  const [form, setForm] = useState<FilterValues>({
    transactionId: '',
    status: '',
    dateFrom: dayjs().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss.000'),
    dateTo: dayjs().format('YYYY-MM-DD HH:mm:ss.000'),
    sort: 'DESC',
  });

  const { data: statusesData } = useTransactionStatuses();

  const transactionStatusOptions = Array.isArray(statusesData)
    ? statusesData.map((status: string) => ({
        label: status,
        value: status,
      }))
    : [];

  useEffect(() => {
    // Emit initial form values
    onChange?.(form);
  }, []);

  const handleSubmit = () => {
    onChange?.(form);
  };

  const handleFieldChange = (field: keyof FilterValues, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form layout="vertical" className="pm-shards-detail-tab-transactions-view-filter">
      <h3>Filter</h3>
      <Row gutter={20} className="wrap-row">
        <Col span={4}>
          <Form.Item label="Transaction ID">
            <Input
              allowClear
              value={form.transactionId}
              onChange={(e) => handleFieldChange('transactionId', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label="Transaction Status">
            <Select
              allowClear
              showSearch
              value={form.status || undefined}
              onChange={(value) => handleFieldChange('status', value || '')}
              options={transactionStatusOptions}
              placeholder="Select status"
              popupMatchSelectWidth={false}
              classNames={{ popup: 'transactions-view-filter-dropdown' }}
              styles={{ popup: { minWidth: '400px' } }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label="Date From">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={form.dateFrom ? dayjs(form.dateFrom) : null}
              onChange={(date) =>
                handleFieldChange('dateFrom', date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss.000') : '')
              }
              placeholder="Pick a day"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label="Date To">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={form.dateTo ? dayjs(form.dateTo) : null}
              onChange={(date) =>
                handleFieldChange('dateTo', date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss.000') : '')
              }
              placeholder="Pick a day"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label="Sort">
            <Select
              value={form.sort}
              onChange={(value) => handleFieldChange('sort', value)}
              options={[
                { value: 'ASC', label: 'Asc' },
                { value: 'DESC', label: 'Desc' },
              ]}
              popupMatchSelectWidth={false}
              classNames={{ popup: 'transactions-view-filter-dropdown' }}
              styles={{ popup: { minWidth: '300px' } }}
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
      <hr />
    </Form>
  );
};

export default TransactionsViewFilter;


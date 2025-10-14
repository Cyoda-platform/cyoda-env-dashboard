/**
 * Transition Versions Filter Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionVersions/TransitionVersionsFilter.vue
 */

import React, { useState, useEffect } from 'react';
import { Card, Form, DatePicker, Select, Button, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { useTransactionStatuses } from '../../hooks';
import './TransitionVersionsFilter.scss';

interface FilterValues {
  transactionId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sort: string;
  actionTypeStr: string;
}

interface TransitionVersionsFilterProps {
  isLoading?: boolean;
  onChange?: (values: FilterValues) => void;
}

export const TransitionVersionsFilter: React.FC<TransitionVersionsFilterProps> = ({
  isLoading = false,
  onChange,
}) => {
  const [form, setForm] = useState<FilterValues>({
    transactionId: '',
    status: '',
    dateFrom: dayjs().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
    dateTo: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    sort: 'ASC',
    actionTypeStr: 'ALL',
  });

  const { data: statusesData } = useTransactionStatuses();

  const actionTypeOptions = ['ALL', 'READ', 'UPDATE', 'REMOVE'];

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
    <Card title="Filter">
      <Form layout="vertical" className="transition-versions-filter">
        <Row gutter={20} className="wrap-row">
          <Col span={4}>
            <Form.Item label="Date From">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                value={form.dateFrom ? dayjs(form.dateFrom) : null}
                onChange={(date) =>
                  handleFieldChange('dateFrom', date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '')
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
                  handleFieldChange('dateTo', date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '')
                }
                placeholder="Pick a day"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Action Type">
              <Select
                value={form.actionTypeStr}
                onChange={(value) => handleFieldChange('actionTypeStr', value)}
                placeholder="Action Type"
                options={actionTypeOptions.map((type) => ({ value: type, label: type }))}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Sort">
              <Select
                value={form.sort}
                onChange={(value) => handleFieldChange('sort', value)}
                placeholder="Sort"
                options={[
                  { value: 'ASC', label: 'Asc' },
                  { value: 'DESC', label: 'Desc' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={4} className="action-item">
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
              Load
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default TransitionVersionsFilter;


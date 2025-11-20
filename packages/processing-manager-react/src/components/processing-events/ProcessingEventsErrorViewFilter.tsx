/**
 * Processing Events Error View Filter Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmProcessingEventsErrorView/Component/PmProcessingEventsErrorViewFilter.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, DatePicker, Button, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { useSummary, useProcessingQueues } from '../../hooks';
import './ProcessingEventsErrorViewFilter.scss';

interface FilterValues {
  queue: string;
  shard: string;
  from: string;
  to: string;
  sort: string;
  pageNum: number;
}

interface ProcessingEventsErrorViewFilterProps {
  isLoading?: boolean;
  onChange?: (values: FilterValues) => void;
}

export const ProcessingEventsErrorViewFilter: React.FC<ProcessingEventsErrorViewFilterProps> = ({
  isLoading = false,
  onChange,
}) => {
  const [form, setForm] = useState<FilterValues>({
    queue: 'ALL',
    shard: 'ALL',
    from: dayjs().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
    to: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    sort: 'SORT_DESC',
    pageNum: 0,
  });

  const { data: summaryData } = useSummary();
  const { data: queuesData } = useProcessingQueues();

  const actualShardsOptions = useMemo(() => {
    if (!summaryData?.actualShards) return ['ALL'];
    const shards = summaryData.actualShards.map((el: any) => el.shardId);
    return [...shards, 'ALL'];
  }, [summaryData]);

  const queueOptions = useMemo(() => {
    if (!queuesData) return ['ALL'];
    return [...queuesData, 'ALL'];
  }, [queuesData]);

  const listSortes = ['SORT_ASC', 'SORT_DESC'];

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
    <Form layout="vertical" className="pm-processing-events-error-view-filter">
      <h3>Filter</h3>
      <Row gutter={20} className="wrap-row">
        <Col span={5}>
          <Form.Item label="Queue">
            <Select
              showSearch
              allowClear
              value={form.queue}
              onChange={(value) => handleFieldChange('queue', value || 'ALL')}
              options={queueOptions.map((q) => ({ value: q, label: q }))}
              popupMatchSelectWidth={false}
              classNames={{ popup: 'processing-events-error-view-filter-dropdown' }}
              styles={{ popup: { minWidth: '400px' } }}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Shard">
            <Select
              showSearch
              allowClear
              value={form.shard}
              onChange={(value) => handleFieldChange('shard', value || 'ALL')}
              options={actualShardsOptions.map((s) => ({ value: s, label: s }))}
              popupMatchSelectWidth={false}
              classNames={{ popup: 'processing-events-error-view-filter-dropdown' }}
              styles={{ popup: { minWidth: '400px' } }}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Time From">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={form.from ? dayjs(form.from) : null}
              onChange={(date) =>
                handleFieldChange('from', date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '')
              }
              placeholder="Pick a day"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Time To">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={form.to ? dayjs(form.to) : null}
              onChange={(date) =>
                handleFieldChange('to', date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '')
              }
              placeholder="Pick a day"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label="Sort by time">
            <Select
              showSearch
              value={form.sort}
              onChange={(value) => handleFieldChange('sort', value)}
              options={listSortes.map((s) => ({ value: s, label: s }))}
              popupMatchSelectWidth={false}
              classNames={{ popup: 'processing-events-error-view-filter-dropdown' }}
              styles={{ popup: { minWidth: '400px' } }}
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

export default ProcessingEventsErrorViewFilter;


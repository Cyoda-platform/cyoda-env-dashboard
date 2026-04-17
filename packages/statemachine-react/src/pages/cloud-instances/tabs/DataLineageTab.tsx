import React, { useState } from 'react';
import { Button, Checkbox, Col, DatePicker, Row, Timeline, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@cyoda/ui-lib-react';
import { getInstancesGateway } from '../../../gateways';

const { Title, Text } = Typography;

export interface DataLineageTabProps {
  entityId: string;
}

export const DataLineageTab: React.FC<DataLineageTabProps> = ({ entityId }) => {
  const changesQuery = useQuery({
    queryKey: ['cloud-instances', 'changes', entityId],
    queryFn: () => getInstancesGateway().loadChanges(entityId),
  });

  // Click-order FIFO of timestamps (length ≤ 2). When user clicks a third box,
  // we drop the head and push the new one.
  const [checkedQueue, setCheckedQueue] = useState<string[]>([]);
  const [diff, setDiff] = useState<{ older: string; newer: string } | null>(null);

  const onToggle = (timestamp: string) => {
    setCheckedQueue((q) => {
      if (q.includes(timestamp)) return q.filter((t) => t !== timestamp);
      const next = [...q, timestamp];
      return next.length > 2 ? next.slice(1) : next;
    });
  };

  const onCompare = async () => {
    if (checkedQueue.length !== 2) return;
    // Sort to derive older/newer (sortable as ISO strings)
    const sorted = [...checkedQueue].sort();
    const [older, newer] = sorted;
    const [olderEntity, newerEntity] = await Promise.all([
      getInstancesGateway().load(entityId, { pointInTime: older }),
      getInstancesGateway().load(entityId, { pointInTime: newer }),
    ]);
    setDiff({
      older: JSON.stringify(olderEntity.data ?? {}, null, 2),
      newer: JSON.stringify(newerEntity.data ?? {}, null, 2),
    });
  };

  const changes = changesQuery.data ?? [];

  return (
    <Row gutter={32}>
      <Col span={6}>
        <Title level={5}>Filter</Title>
        <DatePicker.RangePicker disabled style={{ width: '100%' }} />
      </Col>
      <Col span={18}>
        <Title level={5}>Current version</Title>
        <Timeline
          items={changes.map((c) => ({
            color: 'green',
            children: (
              <Row gutter={16} align="middle" style={{ marginBottom: 4 }}>
                <Col flex="200px"><Text>{c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}</Text></Col>
                <Col flex="auto"><Text type="secondary">No. changed fields [{c.fieldsChangedCount ?? 0}]</Text></Col>
                <Col flex="40px">
                  <Checkbox checked={checkedQueue.includes(c.timestamp)} onChange={() => onToggle(c.timestamp)} />
                </Col>
              </Row>
            ),
          }))}
        />
        <Button type="primary" disabled={checkedQueue.length !== 2} onClick={onCompare} style={{ marginTop: 12 }}>Compare</Button>
        {diff && (
          <div style={{ marginTop: 16 }}>
            <CodeEditor
              diff
              diffReadonly
              oldString={diff.older}
              newString={diff.newer}
              language="json"
              height={400}
            />
          </div>
        )}
      </Col>
    </Row>
  );
};

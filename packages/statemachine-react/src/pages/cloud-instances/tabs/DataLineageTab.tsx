import React, { useState } from 'react';
import { Button, Checkbox, DatePicker, Space, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@cyoda/ui-lib-react';
import { getInstancesGateway, type EntityChange } from '../../../gateways';

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
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Title level={4}>Filter</Title>
      <DatePicker.RangePicker disabled />

      <Title level={4}>Current version</Title>
      <Space direction="vertical">
        {changes.map((c: EntityChange) => (
          <div key={c.timestamp}>
            <Checkbox checked={checkedQueue.includes(c.timestamp)} onChange={() => onToggle(c.timestamp)}>
              <Text>{c.timestamp}</Text>
            </Checkbox>
          </div>
        ))}
      </Space>

      <Button type="primary" disabled={checkedQueue.length !== 2} onClick={onCompare}>Compare</Button>

      {diff && (
        <CodeEditor
          diff
          diffReadonly
          original={diff.older}
          modified={diff.newer}
          language="json"
          height={400}
        />
      )}
    </Space>
  );
};

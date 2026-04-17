import React, { useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Col, DatePicker, Row, Space, Timeline, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { DiffEditor, type DiffOnMount } from '@monaco-editor/react';
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
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

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

  const diffContainerRef = useRef<HTMLDivElement | null>(null);
  const onDiffMount: DiffOnMount = (editor) => {
    // Monaco's diff editor sometimes computes a near-zero width for the
    // original pane on initial mount, leaving the splitter pinned to the
    // gutter. Force a layout based on the container's actual size after
    // the next paint, which reseats the 50/50 sash.
    requestAnimationFrame(() => {
      const w = diffContainerRef.current?.clientWidth;
      const h = 520;
      if (w && w > 0) editor.layout({ width: w, height: h });
      else editor.layout();
    });
  };

  const allChanges = changesQuery.data ?? [];
  const changes = useMemo(() => {
    if (!range || (!range[0] && !range[1])) return allChanges;
    const fromMs = range[0]?.startOf('day').valueOf() ?? -Infinity;
    const toMs = range[1]?.endOf('day').valueOf() ?? Infinity;
    return allChanges.filter((c) => {
      const t = c.timestamp ? new Date(c.timestamp).getTime() : NaN;
      return Number.isFinite(t) && t >= fromMs && t <= toMs;
    });
  }, [allChanges, range]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Title level={5}>Filter</Title>
        <DatePicker.RangePicker
          value={range as any}
          onChange={(v) => setRange(v as any)}
          allowClear
          style={{ width: 360 }}
        />
      </div>
      <div>
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
      </div>
      <Button type="primary" disabled={checkedQueue.length !== 2} onClick={onCompare}>Compare</Button>
      {diff && (
        <div ref={diffContainerRef} style={{ width: '100%' }}>
          <DiffEditor
            key={`${checkedQueue[0] ?? ''}|${checkedQueue[1] ?? ''}`}
            original={diff.older}
            modified={diff.newer}
            language="json"
            height={520}
            theme={document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'vs-dark'}
            onMount={onDiffMount}
            options={{
              readOnly: true,
              renderSideBySide: true,
              useInlineViewWhenSpaceIsLimited: false,
              renderSideBySideInlineBreakpoint: 0,
              enableSplitViewResizing: true,
              originalEditable: false,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 13,
              automaticLayout: true,
              splitViewDefaultRatio: 0.5,
            }}
          />
        </div>
      )}
    </Space>
  );
};

// dayjs is the AntD v5 default date library; this import keeps it bundled so the
// RangePicker value typing aligns with what it accepts.
void dayjs;

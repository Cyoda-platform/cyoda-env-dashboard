/**
 * Event View Page
 * Migrated from @cyoda/processing-manager/src/views/EventView.vue
 */

import { useMemo } from 'react';
import { Card, Typography, Divider, Breadcrumb, Descriptions, Tag, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProcessingQueueErrorEventByEntity } from '../hooks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Title } = Typography;

export default function EventView() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryParams = {
    queue: searchParams.get('queue') || '',
    shard: searchParams.get('shard') || '',
    timeUUID: searchParams.get('timeUUID') || '',
  };

  const { data, refetch, isLoading } = useProcessingQueueErrorEventByEntity(queryParams);

  const event = data?.event || {};
  const isDone = data?.done || false;

  const formattedCoreData = useMemo(() => {
    if (!event.coreData) return '{}';
    try {
      return JSON.stringify(event.coreData, null, 2);
    } catch (e) {
      return String(event.coreData);
    }
  }, [event.coreData]);

  const handleReload = () => {
    refetch();
  };

  const breadcrumbItems = [
    {
      title: (
        <span>
          <HomeOutlined />
          <span style={{ marginLeft: 8 }}>Processing</span>
        </span>
      ),
      onClick: () => navigate('/processing-ui'),
    },
    {
      title: 'Nodes',
      onClick: () => navigate('/processing-ui/nodes'),
    },
    {
      title: name,
      onClick: () => navigate(`/processing-ui/nodes/${name}`),
    },
    {
      title: 'Event View',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />

      <Card variant="borderless" loading={isLoading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Event View
          </Title>
          {!isDone && (
            <Button icon={<ReloadOutlined />} onClick={handleReload}>
              Reload
            </Button>
          )}
        </div>

        <Divider />

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={<strong>Create Time</strong>}>
            {event.createTime || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Queue</strong>}>
            {event.queueName || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Shard</strong>}>
            {event.shardId || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Status</strong>}>
            {event.status ? <Tag color="blue">{event.status}</Tag> : '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Time-UUID</strong>}>
            {event.timeUUID || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Entity-Class</strong>}>
            {event.queueName || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Entity-ID</strong>}>
            {event.entityId || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Has Errors</strong>}>
            {event.entityHasErrors !== undefined ? (
              <Tag color={event.entityHasErrors ? 'red' : 'green'}>
                {event.entityHasErrors ? 'Yes' : 'No'}
              </Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Error Event Time-UUID</strong>}>
            {event.errorEventTimeUUID || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Core event data</strong>}>
            {/* @ts-ignore - react-syntax-highlighter type compatibility issue */}
            <SyntaxHighlighter
              language="javascript"
              style={prism}
              customStyle={{
                margin: 0,
                maxHeight: '400px',
                fontSize: '12px',
              }}
            >
              {formattedCoreData}
            </SyntaxHighlighter>
          </Descriptions.Item>

          <Descriptions.Item label={<strong>Client event data</strong>}>
            {event.clientDataClassName || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}


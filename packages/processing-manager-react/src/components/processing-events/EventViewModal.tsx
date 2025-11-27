/**
 * Event View Modal Component
 * Modal version of EventView page for displaying event details
 */

import { useMemo } from 'react';
import { Modal, Descriptions, Spin, Button } from 'antd';
import { useProcessingQueueErrorEventByEntity } from '../../hooks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ErrorViewActions } from '../common/ErrorViewActions';

interface EventViewModalProps {
  open: boolean;
  onClose: () => void;
  queue: string;
  shard: string | number;
  timeUUID: string;
}

export const EventViewModal: React.FC<EventViewModalProps> = ({
  open,
  onClose,
  queue,
  shard,
  timeUUID,
}) => {
  const queryParams = {
    queue,
    shard: String(shard),
    timeUUID,
  };

  const { data, refetch, isLoading } = useProcessingQueueErrorEventByEntity(queryParams, {
    enabled: open && !!queue && !!shard && !!timeUUID,
  });

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

  return (
    <Modal
      title="Event view"
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <Spin spinning={isLoading}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          {!isDone && (
            <ErrorViewActions
              onReload={handleReload}
              params={{
                queue,
                shard: String(shard),
                timeUUID,
              }}
            />
          )}
        </div>

        <Descriptions column={1} bordered={false} size="small" labelStyle={{ fontWeight: 'normal' }}>
          <Descriptions.Item label="Create Time">
            {event.createTime || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Queue">
            {event.queueName || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Shard">
            {event.shardId || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            {event.status || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Time-UUID">
            {event.timeUUID || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Entity-Class">
            {event.queueName || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Entity-ID">
            {event.entityId || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Has Errors">
            {event.entityHasErrors !== undefined ? (
              event.entityHasErrors ? 'Yes' : 'No'
            ) : (
              '-'
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Error Event Time-UUID">
            {event.errorEventTimeUUID || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Core event data">
            <div style={{ 
              background: '#f5f5f5', 
              padding: '8px', 
              borderRadius: '4px',
              marginTop: '8px'
            }}>
              {/* @ts-ignore - react-syntax-highlighter type compatibility issue */}
              <SyntaxHighlighter
                language="javascript"
                style={prism}
                customStyle={{
                  margin: 0,
                  maxHeight: '300px',
                  fontSize: '12px',
                  background: 'transparent',
                }}
              >
                {formattedCoreData}
              </SyntaxHighlighter>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Client event data">
            {event.clientDataClassName || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Spin>
    </Modal>
  );
};

export default EventViewModal;


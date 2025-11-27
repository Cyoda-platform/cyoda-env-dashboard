/**
 * Event View Modal Component
 * Modal version of EventView page for displaying event details
 */

import { useMemo } from 'react';
import { Modal, Descriptions, Spin, Button } from 'antd';
import { useProcessingQueueErrorEventByEntity } from '../../hooks';
import { CodeEditor } from '@cyoda/ui-lib-react';
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
      width="90%"
      style={{ maxWidth: '1400px' }}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      styles={{
        body: {
          maxHeight: '80vh',
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
        </Descriptions>

        {/* Core event data - full width section */}
        <div style={{ marginTop: '24px' }}>
          <div style={{
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 'normal',
          }}>
            Core event data:
          </div>
          <CodeEditor
            value={formattedCoreData}
            language="json"
            readOnly={true}
            height="400px"
          />
        </div>

        {/* Client event data */}
        <Descriptions column={1} bordered={false} size="small" labelStyle={{ fontWeight: 'normal' }} style={{ marginTop: '24px' }}>
          <Descriptions.Item label="Client event data">
            {event.clientDataClassName || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Spin>
    </Modal>
  );
};

export default EventViewModal;


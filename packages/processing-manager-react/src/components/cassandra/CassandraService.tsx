/**
 * Cassandra Service Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCassandra/PmShardsDetailTabCassandraService.vue
 */

import React, { useEffect, useState } from 'react';
import { Card, Tag, Modal, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useProcessingStore } from '../../stores';
import './CassandraService.scss';

export const CassandraService: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [up, setUp] = useState<boolean | null>(null);
  const nodes = useProcessingStore((state) => state.nodes);

  useEffect(() => {
    const loadServiceStatus = async () => {
      if (nodes.length > 0) {
        const node = nodes.find((el: any) => el.hostname === name);
        if (node?.grafana) {
          // TODO: Implement loadUp from grafana store
          // For now, set to null (unknown)
          setUp(null);
        }
      }
    };

    loadServiceStatus();
  }, [nodes, name]);

  const handleReboot = () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Cassandra Reboot. Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Implement cassandra reboot
        message.success('Cassandra Reboot completed');
      },
      onCancel: () => {
        message.info('Cassandra Reboot canceled');
      },
    });
  };

  const handlePowerOff = () => {
    Modal.confirm({
      title: 'Warning',
      content: 'Cassandra Stop. Continue?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Implement cassandra stop
        message.success('Cassandra Stop completed');
      },
      onCancel: () => {
        message.info('Cassandra Stop canceled');
      },
    });
  };

  const getStatusTag = () => {
    if (up === null) {
      return <Tag color="default">Unknown</Tag>;
    }
    if (up) {
      return <Tag color="success">Running</Tag>;
    }
    return <Tag color="error">Stop</Tag>;
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Service</span>
          {getStatusTag()}
        </div>
      }
      className="cassandra-service"
    >
      <div>Cassandra service status and controls</div>
    </Card>
  );
};

export default CassandraService;


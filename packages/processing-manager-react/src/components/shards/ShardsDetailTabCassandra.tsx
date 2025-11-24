/**
 * Shards Detail Tab Cassandra Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCassandra.vue
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Tag } from 'antd';
import { GrafanaChart, GrafanaChartResetButton } from '../grafana';
import { useProcessingStore } from '../../stores/processingStore';
import { useGrafanaStore } from '../../stores/grafanaStore';
import './ShardsDetailTabCassandra.scss';

function CassandraService() {
  const params = useParams<{ name: string }>();
  const nodes = useProcessingStore((state) => state.nodesProcessing);
  const loadUp = useGrafanaStore((state) => state.loadUp);
  const [up, setUp] = useState<boolean | null>(null);

  useEffect(() => {
    const loadServiceStatus = async () => {
      if (nodes && nodes.length > 0) {
        const node = nodes.find((el: any) => el.hostname === params.name);
        if (node?.grafana) {
          try {
            // Modify grafana config for Cassandra (port 7070, job 'cassandra')
            const modifiedGrafana = {
              ...node.grafana,
              instance: node.grafana.instance.replace(':9100', ':7070'),
              job: 'cassandra'
            };
            const status = await loadUp(modifiedGrafana);
            setUp(status);
          } catch (error) {
            console.error('Failed to load Cassandra service status:', error);
            setUp(null);
          }
        }
      }
    };

    loadServiceStatus();
  }, [nodes, params.name, loadUp]);

  const getStatusTag = () => {
    if (up === null) {
      return <Tag color="default">Unknown</Tag>;
    }
    return up ? <Tag color="success">Running</Tag> : <Tag color="error">Stop</Tag>;
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Service</span>
          {getStatusTag()}
        </div>
      }
    />
  );
}

export default function ShardsDetailTabCassandra() {
  const params = useParams<{ name: string }>();
  const nodes = useProcessingStore((state) => state.nodesProcessing);
  const [node, setNode] = useState<string>('');
  const [job, setJob] = useState<string>('');

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const current = nodes.find((el: any) => el.hostname.indexOf(params.name) !== -1);
      if (current?.grafana) {
        const [nodeValue] = current.grafana.instance.split(':');
        setNode(nodeValue);
        setJob(current.grafana.job);
      }
    }
  }, [nodes, params.name]);

  return (
    <div className="shards-detail-tab-cassandra">
      <Row gutter={16}>
        <Col sm={18} className="cassandra-charts-column">
          <GrafanaChart
            dashboardName="Cassandra"
            panelName="Writes / sec $instance"
            job={job}
            node={node}
            port="7070"
          />
          <GrafanaChart
            dashboardName="Cassandra"
            panelName="Reads / sec $instance"
            job={job}
            node={node}
            port="7070"
          />
          <GrafanaChart
            dashboardName="Cassandra"
            panelName="Avg write latency $instance"
            job={job}
            node={node}
            port="7070"
          />
          <GrafanaChart
            dashboardName="Cassandra"
            panelName="Avg read latency $instance"
            job={job}
            node={node}
            port="7070"
          />
        </Col>
        <Col sm={6} className="cassandra-controls-column">
          <GrafanaChartResetButton />
          <CassandraService />
        </Col>
      </Row>
    </div>
  );
}


/**
 * Shards Detail Tab Summary Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabSummary.vue
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col } from 'antd';
import { GrafanaChart, GrafanaChartResetButton } from '../grafana';
import { SummaryPower, SummaryConsole, SummaryIpAddresses } from '../summary';
import { useProcessingStore } from '../../stores/processingStore';
import './ShardsDetailTabSummary.scss';

export default function ShardsDetailTabSummary() {
  const params = useParams<{ name: string }>();
  const nodes = useProcessingStore((state) => state.nodesProcessing);
  const [node, setNode] = useState<string>('');
  const [port, setPort] = useState<string>('');
  const [job, setJob] = useState<string>('');

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const current = nodes.find((el: any) => el.hostname.indexOf(params.name) !== -1);
      if (current?.grafana) {
        const [nodeValue, portValue] = current.grafana.instance.split(':');
        setNode(nodeValue);
        setPort(portValue);
        setJob(current.grafana.job);
      }
    }
  }, [nodes, params.name]);

  return (
    <div className="shards-detail-tab-summary">
      <Row gutter={16}>
        <Col sm={18} className="summary-charts-column">
          <GrafanaChart
            dashboardName="Linux"
            panelName="CPU basic"
            node={node}
            port={port}
            job={job}
          />
          <GrafanaChart
            dashboardName="Linux"
            panelName="Disk IOps Completed"
            node={node}
            port={port}
            job={job}
          />
          <GrafanaChart
            dashboardName="Linux"
            panelName="Network Traffic by Packets"
            node={node}
            port={port}
            job={job}
          />
        </Col>
        <Col sm={6} className="summary-controls-column">
          <GrafanaChartResetButton />
          <SummaryPower />
          <SummaryConsole />
          <SummaryIpAddresses />
        </Col>
      </Row>
    </div>
  );
}


/**
 * Node Component
 * Migrated from @cyoda/processing-manager/src/components/PmNode/PmNode.vue
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ServerOutlined } from '@ant-design/icons';
import type { PmNode } from '../../types';
import './Node.scss';

interface NodeProps {
  node: PmNode;
}

interface NodeInfo {
  cpu: string;
  storage: string;
  ram: string;
  osName: string;
  up: boolean;
}

export default function Node({ node }: NodeProps) {
  const navigate = useNavigate();
  const [nodeInfo, setNodeInfo] = useState<NodeInfo>({
    cpu: '',
    storage: '',
    ram: '',
    osName: '',
    up: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const description = [
    nodeInfo.osName || '-',
    `${nodeInfo.cpu || '-'} CPU`,
    `${nodeInfo.storage || '-'} Storage`,
    `${nodeInfo.ram || '-'} RAM`,
  ].join(', ');

  const handleOpenNode = () => {
    navigate(`/processing-ui/nodes/${node.hostname}`);
  };

  useEffect(() => {
    // TODO: Implement Grafana API calls when grafana store methods are available
    // For now, just show the node without Grafana data
    if (node && node.grafana) {
      setIsLoading(true);
      // Placeholder for Grafana API calls
      // const info = await loadNodeInfo(node.grafana);
      // const up = await loadUp(node.grafana);
      // setNodeInfo({ ...info, up });
      setIsLoading(false);
    }
  }, [node]);

  return (
    <div>
      <Spin spinning={isLoading}>
        <div className="row-item" onClick={handleOpenNode}>
          <div className="row align-items-center">
            <div className="col-auto">
              <div
                className={`statusIndicator ${nodeInfo.up ? 'active' : 'deactive'}`}
              />
            </div>
            <div className="col-auto">
              <ServerOutlined style={{ fontSize: '20px' }} />
            </div>
            <div className="col">
              <div className="title">{node.hostname}</div>
              <div className="description">
                {node.grafana ? (
                  description
                ) : (
                  'This IP is not connected to Grafana'
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
}


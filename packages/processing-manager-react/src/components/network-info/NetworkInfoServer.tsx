/**
 * Network Info Server Component
 * Migrated from @cyoda/http-api/src/components/NetworkInfoServer/NetworkInfoServer.vue
 */

import React from 'react';
import { Spin } from 'antd';
import { useNetworkServerInfo } from '../../hooks/usePlatformCommon';
import './NetworkInfoServer.scss';

interface ServerInfo {
  type: string;
  id: string;
  nodeType: string;
  host: string;
  port: number;
  running: boolean;
  binded: boolean;
}

export const NetworkInfoServer: React.FC = () => {
  const { data: serverInfo, isLoading } = useNetworkServerInfo();

  if (isLoading) {
    return <Spin />;
  }

  const info = serverInfo as ServerInfo;

  return (
    <div className="network-info-server">
      <div>
        <h1 className="label">Server</h1>
        <div className="wrap-box">
          <div className="title">
            <span className="type-class">TYPE:</span>&nbsp;
            <span className="green">{info?.type || '-'}</span>
          </div>
          <div className="row-flex">
            <div>
              <strong>Id:</strong><br/>
              {info?.id || '-'}
            </div>
            <div>
              <strong>Node Type:</strong><br/>
              {info?.nodeType || '-'}
            </div>
            <div>
              <strong>Host:</strong><br/>
              {info?.host || '-'}
            </div>
            <div>
              <strong>Port:</strong><br/>
              {info?.port || '-'}
            </div>
            <div>
              <strong>Running:</strong><br/>
              {info?.running ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Binded:</strong><br/>
              {info?.binded ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkInfoServer;


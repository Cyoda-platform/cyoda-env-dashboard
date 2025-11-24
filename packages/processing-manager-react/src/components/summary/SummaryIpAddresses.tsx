/**
 * Summary IP Addresses Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummaryIp.vue
 */

import React from 'react';
import { Card, message, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import './SummaryIpAddresses.scss';

const { Text } = Typography;

export const SummaryIpAddresses: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const ips = [name]; // In the future, this could be an array of multiple IPs

  const handleCopyIp = async (ip: string) => {
    try {
      await navigator.clipboard.writeText(ip);
      message.success(`IP address ${ip} was copied`);
    } catch (error) {
      message.error(`IP address ${ip} NOT was copied`);
    }
  };

  return (
    <Card className="summary-ip-card" title="IP Addresses" style={{ marginBottom: 16 }}>
      <ul className="ip-addresses-list">
        {ips.map((ip) => (
          <li key={ip}>
            <Text>{ip}</Text>
            <CopyOutlined
              className="copy-icon"
              onClick={() => handleCopyIp(ip)}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default SummaryIpAddresses;


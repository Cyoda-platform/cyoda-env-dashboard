/**
 * Header Proxy Request Component
 * Migrated from @cyoda/processing-manager/src/components/PmHeader/PmHeaderProxyRequest.vue
 */

import React, { useState, useEffect } from 'react';
import { Switch, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './HeaderProxyRequest.scss';

const KEY = 'proxyRequest';

export const HeaderProxyRequest: React.FC = () => {
  const [proxyRequest, setProxyRequest] = useState<boolean>(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === null) {
      return true;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      // If stored value is invalid JSON, default to true
      console.warn('Invalid proxyRequest value in localStorage, defaulting to true');
      return true;
    }
  });

  const handleChange = (checked: boolean) => {
    setProxyRequest(checked);
    localStorage.setItem(KEY, JSON.stringify(checked));
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const content = (
    <div>
      - <strong>on</strong>, requests to a processing manager is done via the main (delegating)
      endpoint. <br />
      - <strong>off</strong>, requests are made directly to a processing manager node, which may not
      work in certain environments
    </div>
  );

  return (
    <div className="pm-header-proxy-request">
      Proxy mode
      <Switch checked={proxyRequest} onChange={handleChange} style={{ margin: '0 5px' }} />
      <Popover content={content} title="Proxy mode" trigger="click" placement="bottom">
        <InfoCircleOutlined className="icon-popover" />
      </Popover>
    </div>
  );
};

export default HeaderProxyRequest;


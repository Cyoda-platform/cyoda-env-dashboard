/**
 * Proxy Mode Toggle Component
 * Migrated from @cyoda/processing-manager/src/components/PmHeader/PmHeaderProxyRequest.vue
 * 
 * Allows users to toggle between proxy mode and direct connection mode.
 * When changed, the page reloads to apply the new setting.
 */

import { Switch, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';
import './ProxyModeToggle.scss';

export default function ProxyModeToggle() {
  const proxyRequest = useAppStore((state) => state.proxyRequest);
  const setProxyRequest = useAppStore((state) => state.setProxyRequest);

  const handleChange = (checked: boolean) => {
    setProxyRequest(checked);
    // Reload page after a short delay to apply the new setting
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const popoverContent = (
    <div style={{ maxWidth: 300 }}>
      - <strong>on</strong>, requests to a processing manager is done via the main (delegating) endpoint.
      <br />
      - <strong>off</strong>, requests are made directly to a processing manager node, which may not work in certain environments
    </div>
  );

  return (
    <div className="proxy-mode-toggle">
      <span>Proxy mode</span>
      <Switch checked={proxyRequest} onChange={handleChange} />
      <Popover content={popoverContent} title="Proxy mode" trigger="click" placement="bottom">
        <InfoCircleOutlined className="info-icon" />
      </Popover>
    </div>
  );
}


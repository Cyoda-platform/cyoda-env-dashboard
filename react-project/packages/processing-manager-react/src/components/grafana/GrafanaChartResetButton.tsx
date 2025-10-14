/**
 * Grafana Chart Reset Button Component
 * Migrated from @cyoda/processing-manager/src/components/PmGrafanaChart/PmGrafanaChartResetButton.vue
 */

import { useState } from 'react';
import { Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import './GrafanaChartResetButton.scss';

export default function GrafanaChartResetButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClickReset = () => {
    // Dispatch custom event for chart reset
    window.dispatchEvent(new Event('grafana:chart:reset'));
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="actions">
      <Button
        type="primary"
        loading={isLoading}
        onClick={handleClickReset}
        icon={<SyncOutlined />}
      >
        Reset
      </Button>
    </div>
  );
}


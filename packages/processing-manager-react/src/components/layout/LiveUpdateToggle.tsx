/**
 * Live Update Toggle Component
 * Migrated from @cyoda/processing-manager/src/components/ViewWrapper.vue
 * 
 * Allows users to toggle live updates for consistency time lag and other real-time data.
 */

import { Switch } from 'antd';
import { useAppStore } from '../../stores/appStore';
import './LiveUpdateToggle.scss';

export default function LiveUpdateToggle() {
  const liveUpdate = useAppStore((state) => state.liveUpdate);
  const setLiveUpdate = useAppStore((state) => state.setLiveUpdate);

  const handleChange = (checked: boolean) => {
    setLiveUpdate(checked);
  };

  return (
    <div className="live-update-toggle">
      <span>Live update:</span>
      <Switch checked={liveUpdate} onChange={handleChange} />
    </div>
  );
}


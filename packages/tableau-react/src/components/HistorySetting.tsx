/**
 * HistorySetting Component
 * Settings for report history display (lazy loading)
 * Migrated from: .old_project/packages/http-api/src/views/History/HistorySetting.vue
 */

import React from 'react';
import { Form, Switch } from 'antd';
import type { HistorySettings } from '../types';
import './HistorySetting.scss';

interface HistorySettingProps {
  settings: HistorySettings;
  onChange: (settings: HistorySettings) => void;
}

const HistorySetting: React.FC<HistorySettingProps> = ({ settings, onChange }) => {
  const handleLazyLoadingChange = (checked: boolean) => {
    onChange({
      ...settings,
      lazyLoading: checked,
    });
  };

  return (
    <div className="history-setting">
      <Form layout="inline">
        <Form.Item label="Lazy loading">
          <Switch
            checked={settings.lazyLoading}
            onChange={handleLazyLoadingChange}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default HistorySetting;


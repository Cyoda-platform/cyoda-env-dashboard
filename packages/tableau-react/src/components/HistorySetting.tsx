/**
 * HistorySetting Component
 * Settings for report history display (lazy loading, group display type)
 * Migrated from: .old_project/packages/http-api/src/views/History/HistorySetting.vue
 */

import React from 'react';
import { Form, Switch, Radio } from 'antd';
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

  const handleDisplayGroupTypeChange = (e: any) => {
    onChange({
      ...settings,
      displayGroupType: e.target.value,
    });
  };

  return (
    <div className="history-setting">
      <h2>Settings</h2>
      <Form layout="inline">
        <Form.Item label="Lazy loading">
          <Switch
            checked={settings.lazyLoading}
            onChange={handleLazyLoadingChange}
          />
        </Form.Item>
        <Form.Item label="Group display">
          <Radio.Group
            value={settings.displayGroupType}
            onChange={handleDisplayGroupTypeChange}
            buttonStyle="solid"
          >
            <Radio.Button value="in">In Table</Radio.Button>
            <Radio.Button value="out">Out Table</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HistorySetting;


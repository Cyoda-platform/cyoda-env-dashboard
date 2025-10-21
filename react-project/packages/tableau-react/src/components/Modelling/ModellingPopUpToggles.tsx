/**
 * ModellingPopUpToggles Component
 * Toggle switches for modelling popup options
 * Migrated from: CyodaModellingPopUpToggles.vue
 */

import React, { useState } from 'react';
import { Form, Switch, Space } from 'antd';
import './ModellingPopUpToggles.scss';

interface ModellingPopUpTogglesProps {
  onChange?: (values: { isCondenseThePaths: boolean; isOpenAllSelected: boolean }) => void;
}

export const ModellingPopUpToggles: React.FC<ModellingPopUpTogglesProps> = ({ onChange }) => {
  const [isCondenseThePaths, setIsCondenseThePaths] = useState(false);
  const [isOpenAllSelected, setIsOpenAllSelected] = useState(false);

  const handleCondenseChange = (checked: boolean) => {
    setIsCondenseThePaths(checked);
    onChange?.({ isCondenseThePaths: checked, isOpenAllSelected });
  };

  const handleOpenAllChange = (checked: boolean) => {
    setIsOpenAllSelected(checked);
    onChange?.({ isCondenseThePaths, isOpenAllSelected: checked });
  };

  return (
    <div className="modelling-popup-toggles">
      <Space size="large" split={<span className="delimiter">|</span>}>
        <Form.Item label="Condense the paths" style={{ margin: 0 }}>
          <Switch checked={isCondenseThePaths} onChange={handleCondenseChange} />
        </Form.Item>
        <Form.Item label="Open all selected" style={{ margin: 0 }}>
          <Switch checked={isOpenAllSelected} onChange={handleOpenAllChange} />
        </Form.Item>
      </Space>
    </div>
  );
};


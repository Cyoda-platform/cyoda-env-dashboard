/**
 * ModellingPopUpToggles Component
 * Toggle switches for modelling popup options
 * Migrated from: CyodaModellingPopUpToggles.vue
 */

import React, { useState } from 'react';
import { Switch, Space } from 'antd';
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
      <Space size="middle">
        <span className="toggle-item">
          <span className="toggle-label">Condense the paths:</span>
          <Switch checked={isCondenseThePaths} onChange={handleCondenseChange} />
        </span>
        <span className="delimiter">|</span>
        <span className="toggle-item">
          <span className="toggle-label">Open all selected:</span>
          <Switch checked={isOpenAllSelected} onChange={handleOpenAllChange} />
        </span>
      </Space>
    </div>
  );
};


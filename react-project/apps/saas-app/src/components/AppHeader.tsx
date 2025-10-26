import React from 'react';
import { Layout, Space } from 'antd';
import { EntityTypeSwitch, type EntityType } from '@cyoda/ui-lib-react';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import './AppHeader.scss';

const { Header } = Layout;

export const AppHeader: React.FC = () => {
  const { entityType, setEntityType } = useGlobalUiSettingsStore();

  const handleEntityTypeChange = (newType: EntityType) => {
    setEntityType(newType);
  };

  return (
    <Header className="saas-app-header">
      <div className="header-content">
        <div className="logo">
          <img
            src="/assets/images/cyoda-logo-green.svg"
            alt="CYODA"
          />
        </div>
        
        <Space className="header-right">
          <EntityTypeSwitch
            value={entityType}
            onChange={handleEntityTypeChange}
            visible={true}
          />
        </Space>
      </div>
    </Header>
  );
};


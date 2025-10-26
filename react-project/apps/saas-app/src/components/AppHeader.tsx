import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { EntityTypeSwitch, type EntityType, AppLogo } from '@cyoda/ui-lib-react';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import './AppHeader.scss';

const { Header } = Layout;
const { Text } = Typography;

export const AppHeader: React.FC = () => {
  const { entityType, setEntityType } = useGlobalUiSettingsStore();

  const handleEntityTypeChange = (newType: EntityType) => {
    setEntityType(newType);
  };

  return (
    <Header className="saas-app-header">
      <div className="header-content">
        <div className="logo-section">
          <AppLogo size="m" />
        </div>

        <Space className="header-right" size="large">
          <div className="entity-type-section">
            <Text className="entity-type-label">Entity Type:</Text>
            <EntityTypeSwitch
              value={entityType}
              onChange={handleEntityTypeChange}
              visible={true}
            />
          </div>
        </Space>
      </div>
    </Header>
  );
};


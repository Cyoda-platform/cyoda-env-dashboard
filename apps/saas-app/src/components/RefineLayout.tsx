import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemedLayoutV2, ThemedHeaderV2, ThemedTitleV2 } from '@refinedev/antd';
import { Space, Typography } from 'antd';
import { AppLogo, EntityTypeSwitch, type EntityType } from '@cyoda/ui-lib-react';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import './RefineLayout.scss';

const { Text } = Typography;

// Custom Header Component
const CustomHeader: React.FC = () => {
  const { entityType, setEntityType } = useGlobalUiSettingsStore();

  const handleEntityTypeChange = (newType: EntityType) => {
    setEntityType(newType);
  };

  return (
    <ThemedHeaderV2 sticky>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '64px',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AppLogo size="l" />
        </div>
        <Space size="large">
          <Text style={{ fontSize: '14px', color: '#595959', fontWeight: 500 }}>
            Entity Type:
          </Text>
          <EntityTypeSwitch
            value={entityType}
            onChange={handleEntityTypeChange}
            visible={true}
          />
        </Space>
      </div>
    </ThemedHeaderV2>
  );
};

// Custom Title Component
const CustomTitle: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  return (
    <ThemedTitleV2 collapsed={collapsed} text="Cyoda SaaS" />
  );
};

// Main Refine Layout Component
export const RefineLayout: React.FC = () => {
  return (
    <ThemedLayoutV2
      Header={CustomHeader}
      Title={CustomTitle}
    >
      <Outlet />
    </ThemedLayoutV2>
  );
};


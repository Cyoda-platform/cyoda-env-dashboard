import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { EntityTypeSwitch, type EntityType, AppLogo } from '@cyoda/ui-lib-react';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import { useLocation } from 'react-router-dom';
import { LiveUpdateToggle, ProxyModeToggle, useClusterStats, useAppStore } from '@cyoda/processing-manager-react';
import './AppHeader.scss';

const { Header } = Layout;

export const AppHeader: React.FC = () => {
  const { entityType, setEntityType } = useGlobalUiSettingsStore();
  const location = useLocation();
  const { data, refetch } = useClusterStats();
  const liveUpdate = useAppStore((state: any) => state.liveUpdate);
  const [consistencyTimeLagMs, setConsistencyTimeLagMs] = useState<number>(0);

  const handleEntityTypeChange = (newType: EntityType) => {
    setEntityType(newType);
  };

  // Show processing features only on processing-ui routes
  const showProcessingFeatures = location.pathname.startsWith('/processing-ui');

  // Show entity type toggle only on pages that use it (not on processing-ui)
  // Entity type toggle is used in: Entity Viewer, Reports, Workflows, Instances
  const showEntityTypeToggle = !location.pathname.startsWith('/processing-ui');

  // Polling logic for consistency time lag when live update is enabled
  useEffect(() => {
    if (!showProcessingFeatures || !liveUpdate) {
      return;
    }

    const poll = async () => {
      const result = await refetch();
      if (result.data?.consistencyTimeLagMs !== undefined) {
        setConsistencyTimeLagMs(result.data.consistencyTimeLagMs);
      }
    };

    // Initial poll
    poll();

    // Set up polling interval
    const intervalId = setInterval(poll, 1000);

    return () => clearInterval(intervalId);
  }, [liveUpdate, refetch, showProcessingFeatures]);

  // Update consistency time lag when data changes
  useEffect(() => {
    if (data?.consistencyTimeLagMs !== undefined) {
      setConsistencyTimeLagMs(data.consistencyTimeLagMs);
    }
  }, [data]);

  return (
    <Header className="saas-app-header">
      <div className="header-content">
        <div className="logo-section">
          <AppLogo size="m" />
        </div>

        <div className="header-right">
          {showProcessingFeatures && (
            <div className="processing-features">
              <div className="consistency-time">
                Consistency time lag(millis): {consistencyTimeLagMs}
              </div>
              <div className="delimiter">|</div>
              <LiveUpdateToggle />
              <div className="delimiter">|</div>
              <ProxyModeToggle />
            </div>
          )}
          {showEntityTypeToggle && (
            <div className="entity-type-section">
              <EntityTypeSwitch
                value={entityType}
                onChange={handleEntityTypeChange}
                visible={true}
              />
            </div>
          )}
        </div>
      </div>
    </Header>
  );
};


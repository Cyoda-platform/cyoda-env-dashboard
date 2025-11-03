/**
 * ReportUISettings Component
 * Button and dialog for configuring report UI settings (ID field selection)
 * Migrated from: .old_project/packages/http-api/src/components/ReportUISettings/ReportUISettings.vue
 */

import React, { useState, useMemo } from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import ReportUISettingsDialog from './ReportUISettingsDialog';
import { useReportsStore } from '../stores/reportsStore';
import type { ConfigDefinition } from '../types';
import './ReportUISettings.scss';

interface ReportUISettingsProps {
  reportDefinitionId: string;
  configDefinition: ConfigDefinition;
}

const ReportUISettings: React.FC<ReportUISettingsProps> = ({
  reportDefinitionId,
  configDefinition,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const { getStoredSettings } = useReportsStore();

  // Get ID field list from config definition columns
  const idFieldList = useMemo(() => {
    if (!configDefinition || !configDefinition.columns) {
      return [];
    }
    return configDefinition.columns.map((col: any) => ({
      value: col.name,
      label: col.name,
    }));
  }, [configDefinition]);

  // Check if we need to show the settings button
  // Only show if there's no "id" column in the list
  const isNeedToShow = useMemo(() => {
    return (
      reportDefinitionId &&
      !idFieldList.find((el) => el.value === 'id')
    );
  }, [reportDefinitionId, idFieldList]);

  // Get stored settings for this report
  const storedSettings = useMemo(() => {
    return getStoredSettings(reportDefinitionId);
  }, [reportDefinitionId, getStoredSettings]);

  // Button label - show asterisk if settings are configured
  const buttonLabel = useMemo(() => {
    if (storedSettings && storedSettings.settings.idField) {
      return 'Settings *';
    }
    return 'Settings';
  }, [storedSettings]);

  const handleOpenDialog = () => {
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  if (!isNeedToShow) {
    return null;
  }

  return (
    <div className="report-ui-settings">
      <div className="action">
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={handleOpenDialog}
        >
          {buttonLabel}
        </Button>
      </div>

      <ReportUISettingsDialog
        visible={dialogVisible}
        reportDefinitionId={reportDefinitionId}
        configDefinition={configDefinition}
        idFieldList={idFieldList}
        storedSettings={storedSettings}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default ReportUISettings;


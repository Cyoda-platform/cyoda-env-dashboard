/**
 * Reports Page with Tabs
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor.vue
 * This is the main Reports page with two tabs: Report Config and Reports
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Tabs, Button, Divider, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import HistoryTable from '../components/HistoryTable';
import HistoryFilter from '../components/HistoryFilter';
import HistorySetting from '../components/HistorySetting';
import ReportResultDialog from '../components/ReportResultDialog';
import QuickRunReport from '../components/QuickRunReport';
import ReportUISettings from '../components/ReportUISettings';
import ColumnCollectionsDialog, { type ColumnCollectionsDialogRef } from '../components/ColumnCollectionsDialog';
import ReportConfigs from './ReportConfigs';
import { HelperStorage } from '@cyoda/ui-lib-react';
import { axiosPlatform } from '@cyoda/http-api-react';
import type { ReportHistoryData, ConfigDefinition, HistorySettings, TableDataRow } from '../types';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import './Reports.scss';

// History Reports Tab Content Component (migrated from HistoryReports.vue)
const HistoryReportsTab: React.FC<{ onResetState: () => void }> = ({ onResetState }) => {
  // Mock user for now - will be replaced when http-api-react is available
  const user = { username: 'User' };

  // Ref for ColumnCollectionsDialog
  const columnCollectionsDialogRef = useRef<ColumnCollectionsDialogRef>(null);

  const [filter, setFilter] = useState<HistoryFilterForm>({
    authors: [],
    states: [],
    types: [],
    time_custom: null,
    entityType: 'BUSINESS',
  });

  const [settings, setSettings] = useState<HistorySettings>({
    lazyLoading: false,
    hideUnknownConfigs: true, // Default to hiding unknown configs
  });

  const [configDefinition, setConfigDefinition] = useState<ConfigDefinition>({});
  const [reportDefinition, setReportDefinition] = useState<TableDataRow | null>(null);

  // Modal state for group results
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedGroupData, setSelectedGroupData] = useState<any>(null);

  // Selected config from QuickRunReport dropdown
  const [selectedQuickRunConfig, setSelectedQuickRunConfig] = useState<{ id: string } | null>(null);

  const handleHistoryTableChange = useCallback(
    ({ reportDefinition: newReportDef, configDefinition: newConfigDef }: {
      reportDefinition: TableDataRow;
      configDefinition: ConfigDefinition;
    }) => {
      setConfigDefinition(newConfigDef);
      setReportDefinition(newReportDef);
    },
    []
  );

  // Handle group click - open modal with results
  // Handle group click - open modal with results
  const handleGroupClick = useCallback(async (row: any) => {
    try {
      // Use reportId from the row if available, otherwise use current reportDefinition
      const reportId = row.reportId || reportDefinition?.id;
      
      // Fetch configDefinition if not available or if reportId is different
      let configDef = configDefinition;
      if (reportId && (!configDef?.columns || configDef.columns.length === 0)) {
        const { data } = await axiosPlatform.get(
          `/api/platform-api/reporting/report/${reportId}/config`
        );
        configDef = data.content;
      }
      
      setSelectedGroupData({
        linkRows: row._link_rows,
        configDefinition: configDef,
        reportDefinitionId: reportId,
        lazyLoading: settings.lazyLoading,
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to load config definition:', error);
      // Still open modal with whatever we have
      setSelectedGroupData({
        linkRows: row._link_rows,
        configDefinition: configDefinition,
        reportDefinitionId: row.reportId || reportDefinition?.id,
        lazyLoading: settings.lazyLoading,
      });
      setIsModalVisible(true);
    }
  }, [configDefinition, reportDefinition?.id, settings.lazyLoading]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedGroupData(null);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: HistoryFilterForm) => {
    setFilter(newFilter);
  }, []);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: HistorySettings) => {
    setSettings(newSettings);
  }, []);

  return (
    <div className="history-view-reports">
      {/* Quick Run Report Section */}
      <div className="history-report-quick-run-flex">
        <div className="history-report-quick-run">
          <QuickRunReport onChange={setSelectedQuickRunConfig} />
        </div>
        <div className="button-box">
          <Tooltip title="Reset state: filters, table settings, etc." placement="top">
            <Button type="primary" icon={<ReloadOutlined />} onClick={onResetState}>
              Reset state
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* History Filter */}
      <div className="wrap-history-filter">
        <HistoryFilter value={filter} onChange={handleFilterChange} />
      </div>

      {/* History Settings and Report UI Settings */}
      <div className="settings-row">
        {reportDefinition && (
          <ReportUISettings
            reportDefinitionId={reportDefinition.id}
            configDefinition={configDefinition}
          />
        )}
        <HistorySetting settings={settings} onChange={handleSettingsChange} />
      </div>

      {/* Report Table with expandable groups */}
      <div className="report-table">
        <div className="wrap-table full">
          <span className="label">Reports History</span>
          <HistoryTable
            filter={filter}
            lazyLoading={settings.lazyLoading}
            hideUnknownConfigs={settings.hideUnknownConfigs}
            selectedConfigId={selectedQuickRunConfig?.id || null}
            onChange={handleHistoryTableChange}
            onGroupClick={handleGroupClick}
            onShowColumnDetail={(data) => columnCollectionsDialogRef.current?.showDetail(data)}
          />
        </div>
      </div>

      {/* Modal for Group Results */}
      <ReportResultDialog
        visible={isModalVisible}
        reportData={selectedGroupData}
        onClose={handleModalClose}
        onShowColumnDetail={(data) => columnCollectionsDialogRef.current?.showDetail(data)}
      />

      {/* Column Collections Dialog */}
      <ColumnCollectionsDialog ref={columnCollectionsDialogRef} />
    </div>
  );
};

// Main Reports Page with Tabs (migrated from ConfigEditor.vue)
const Reports: React.FC = () => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [activeTab, setActiveTab] = useState<string>(
    storage.get('configEditor:tab', 'reportConfig') || 'reportConfig'
  );

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    storage.set('configEditor:tab', key);
  }, [storage]);

  const handleResetState = useCallback(() => {
    setActiveTab('reportConfig');
    storage.set('configEditor:tab', 'reportConfig');
  }, [storage]);

  const tabItems = [
    {
      key: 'reportConfig',
      label: 'Report Config',
      children: <ReportConfigs onResetState={handleResetState} />,
    },
    {
      key: 'reports',
      label: 'History',
      children: <HistoryReportsTab onResetState={handleResetState} />,
    },
  ];

  return (
    <div className="config-editor">
      <h1 className="page-title">Reports</h1>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        className="reports-tabs"
        items={tabItems}
      />
    </div>
  );
};

export default Reports;


/**
 * Reports Page with Tabs
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor.vue
 * This is the main Reports page with two tabs: Report Config and Reports
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, Button, Divider, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import HistoryTable from '../components/HistoryTable';
import HistoryFilter from '../components/HistoryFilter';
import ReportTableGroup from '../components/ReportTableGroup';
import ReportTableRows from '../components/ReportTableRows';
import QuickRunReport from '../components/QuickRunReport';
import ReportConfigs from './ReportConfigs';
import { HelperStorage } from '@cyoda/ui-lib-react';
import type { ReportHistoryData, ConfigDefinition, HistorySettings } from '../types';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import './Reports.scss';

// History Reports Tab Content Component (migrated from HistoryReports.vue)
const HistoryReportsTab: React.FC<{ onResetState: () => void }> = ({ onResetState }) => {
  // Mock user for now - will be replaced when http-api-react is available
  const user = { username: 'User' };

  const [filter, setFilter] = useState<HistoryFilterForm>({
    authors: [],
    states: [],
    types: [],
    time_custom: null,
    entityType: 'BUSINESS',
  });

  const [settings] = useState<HistorySettings>({
    lazyLoading: false,
    displayGroupType: 'out',
  });

  const [configDefinition, setConfigDefinition] = useState<ConfigDefinition>({});
  const [reportDefinition, setReportDefinition] = useState<ReportHistoryData | null>(null);
  const [tableLinkRows, setTableLinkRows] = useState<string>('');
  const [isVisibleTables, setIsVisibleTables] = useState<boolean>(true);

  // Calculate tableLinkGroup from report definition
  const tableLinkGroup = useMemo(() => {
    if (reportDefinition?.id && reportDefinition?.groupingVersion) {
      return `/platform-api/reporting/report/${reportDefinition.id}/${reportDefinition.groupingVersion}/groups?page=0&size=1000`;
    }
    return '';
  }, [reportDefinition]);

  const handleHistoryTableChange = useCallback(
    ({ reportDefinition: newReportDef, configDefinition: newConfigDef }: {
      reportDefinition: ReportHistoryData;
      configDefinition: ConfigDefinition;
    }) => {
      setConfigDefinition(newConfigDef);
      setReportDefinition(newReportDef);

      // Set table link rows from report definition
      if (newReportDef.id) {
        setTableLinkRows(`/platform-api/reporting/report/${newReportDef.id}/rows`);
      }
    },
    []
  );

  // Handle group row click
  const handleHistoryGroupsChange = useCallback((row: any) => {
    setTableLinkRows(row._link_rows);
    setIsVisibleTables(false);
    // Reset tables
    setTimeout(() => setIsVisibleTables(true), 0);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: HistoryFilterForm) => {
    setFilter(newFilter);
  }, []);

  useEffect(() => {
    // Reset tables when settings change
    setIsVisibleTables(false);
    const timer = setTimeout(() => setIsVisibleTables(true), 0);
    return () => clearTimeout(timer);
  }, [settings]);

  return (
    <div className="history-view-reports">
      {/* Quick Run Report Section */}
      <div className="history-report-quick-run-flex">
        <div className="history-report-quick-run">
          <QuickRunReport />
        </div>
        <div className="button-box">
          <Divider type="vertical" />
          <Tooltip title="Reset state: filters, table settings, etc." placement="top">
            <Button type="primary" icon={<ReloadOutlined />} onClick={onResetState}>
              Reset state
            </Button>
          </Tooltip>
        </div>
      </div>

      <Divider />

      {/* History Filter */}
      <div className="wrap-history-filter">
        <HistoryFilter value={filter} onChange={handleFilterChange} />
      </div>

      <Divider />

      {/* Report Table */}
      <div className="report-table">
        <div
          className={`wrap-table ${settings.displayGroupType === 'out' ? 'full' : ''}`}
        >
          <span className="label">Report</span>
          <HistoryTable
            filter={filter}
            settings={settings}
            onChange={handleHistoryTableChange}
          />
        </div>

        {settings.displayGroupType === 'out' && tableLinkGroup && (
          <div className="wrap-group">
            <span className="label">Group</span>
            <ReportTableGroup
              tableLinkGroup={tableLinkGroup}
              displayGroupType={settings.displayGroupType}
              lazyLoading={settings.lazyLoading}
              configDefinition={configDefinition}
              onRowClick={handleHistoryGroupsChange}
            />
          </div>
        )}
      </div>

      {/* Report Table Rows */}
      {isVisibleTables && settings.displayGroupType === 'out' && tableLinkRows && (
        <div>
          <ReportTableRows
            lazyLoading={settings.lazyLoading}
            configDefinition={configDefinition}
            tableLinkRows={tableLinkRows}
          />
        </div>
      )}
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
      label: 'Reports',
      children: <HistoryReportsTab onResetState={handleResetState} />,
    },
  ];

  return (
    <div className="config-editor">
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        className="reports-tabs"
        items={tabItems}
      />
      <Divider />
    </div>
  );
};

export default Reports;


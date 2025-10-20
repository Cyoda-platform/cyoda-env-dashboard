/**
 * Reports Page
 * Migrated from: .old_project/packages/tableau/src/views/ReportsView.vue
 */

import React, { useState, useEffect, useCallback } from 'react';
import HistoryTable from '../components/HistoryTable';
import ReportTableRows from '../components/ReportTableRows';
import type { ReportHistoryData, ConfigDefinition, HistoryFilter, HistorySettings } from '../types';
import './Reports.scss';

const Reports: React.FC = () => {
  // Mock user for now - will be replaced when http-api-react is available
  const user = { username: 'User' };

  const [filter] = useState<HistoryFilter>({
    config: '',
    type: '',
    user: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [settings] = useState<HistorySettings>({
    lazyLoading: false,
    displayGroupType: 'out',
  });

  const [configDefinition, setConfigDefinition] = useState<ConfigDefinition>({});
  const [tableLinkRows, setTableLinkRows] = useState<string>('');
  const [isVisibleTables, setIsVisibleTables] = useState<boolean>(true);

  // tableLinkGroup is used when ReportTableGroup component is available from http-api-react
  // const tableLinkGroup = React.useMemo(() => {
  //   if (reportDefinition.id && reportDefinition.groupingVersion) {
  //     return `/platform-api/reporting/report/${reportDefinition.id}/${reportDefinition.groupingVersion}/groups?page=0&size=1000`;
  //   }
  //   return '';
  // }, [reportDefinition]);

  const handleHistoryTableChange = useCallback(
    ({ reportDefinition: newReportDef, configDefinition: newConfigDef }: {
      reportDefinition: ReportHistoryData;
      configDefinition: ConfigDefinition;
    }) => {
      setConfigDefinition(newConfigDef);

      // Set table link rows from report definition
      if (newReportDef.id) {
        setTableLinkRows(`/platform-api/reporting/report/${newReportDef.id}/rows`);
      }
    },
    []
  );

  // handleHistoryGroupsChange is used when ReportTableGroup component is available
  // const handleHistoryGroupsChange = useCallback((row: any) => {
  //   setTableLinkRows(row._link_rows);
  //   setIsVisibleTables(false);
  //   // Reset tables
  //   setTimeout(() => setIsVisibleTables(true), 0);
  // }, []);

  useEffect(() => {
    // Reset tables when settings change
    setIsVisibleTables(false);
    const timer = setTimeout(() => setIsVisibleTables(true), 0);
    return () => clearTimeout(timer);
  }, [settings]);

  return (
    <div className="reports-view">
      <div className="header">
        <h1 className="heading h1">Tableau</h1>
        <div>
          <div className="logout">
            {user.username}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="wrap-history-filter">
          {/* HistoryFilter component would go here - from http-api-react */}
          {/* For now, we'll skip this as it's in http-api package */}
        </div>
      </div>

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

        {settings.displayGroupType === 'out' && (
          <div className="wrap-group">
            <span className="label">Group</span>
            {/* ReportTableGroup component would go here - from http-api-react */}
            {/* For now, we'll skip this as it's in http-api package */}
          </div>
        )}
      </div>

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

export default Reports;


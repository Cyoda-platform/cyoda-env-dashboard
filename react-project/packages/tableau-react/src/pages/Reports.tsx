/**
 * Reports Page
 * Migrated from: .old_project/packages/tableau/src/views/ReportsView.vue
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@cyoda/http-api-react';
import HistoryTable from '@/components/HistoryTable';
import ReportTableRows from '@/components/ReportTableRows';
import type { ReportHistoryData, ConfigDefinition, HistoryFilter, HistorySettings } from '@/types';
import './Reports.scss';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [filter, setFilter] = useState<HistoryFilter>({
    config: '',
    type: '',
    user: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [settings, setSettings] = useState<HistorySettings>({
    lazyLoading: false,
    displayGroupType: 'out',
  });

  const [reportDefinition, setReportDefinition] = useState<any>({});
  const [configDefinition, setConfigDefinition] = useState<ConfigDefinition>({});
  const [tableLinkRows, setTableLinkRows] = useState<string>('');
  const [isVisibleTables, setIsVisibleTables] = useState<boolean>(true);

  const tableLinkGroup = React.useMemo(() => {
    if (reportDefinition.id && reportDefinition.groupingVersion) {
      return `/platform-api/reporting/report/${reportDefinition.id}/${reportDefinition.groupingVersion}/groups?page=0&size=1000`;
    }
    return '';
  }, [reportDefinition]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/tableau/login');
  }, [logout, navigate]);

  const handleHistoryTableChange = useCallback(
    ({ reportDefinition: newReportDef, configDefinition: newConfigDef }: {
      reportDefinition: ReportHistoryData;
      configDefinition: ConfigDefinition;
    }) => {
      setReportDefinition(newReportDef);
      setConfigDefinition(newConfigDef);
    },
    []
  );

  const handleHistoryGroupsChange = useCallback((row: any) => {
    setTableLinkRows(row._link_rows);
    setIsVisibleTables(false);
    // Reset tables
    setTimeout(() => setIsVisibleTables(true), 0);
  }, []);

  useEffect(() => {
    // Reset tables when settings change
    setIsVisibleTables(false);
    setTimeout(() => setIsVisibleTables(true), 0);
  }, [settings]);

  return (
    <div className="reports-view">
      <div className="header">
        <h1 className="heading h1">Tableau</h1>
        <div>
          <div className="logout">
            {user?.username || 'User'} |
            <Button
              type="link"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
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


/**
 * HistoryTable Component
 * Migrated from: .old_project/packages/tableau/src/components/HistoryTable.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, notification, Button, Tooltip } from 'antd';
import { InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery } from '@tanstack/react-query';
import { axiosPlatform, useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import { HelperStorage } from '@cyoda/ui-lib-react';
import moment from 'moment';
import type { ReportHistoryData, TableDataRow, HistorySettings, ConfigDefinition } from '@/types';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import { ResizableTitle } from './ResizableTitle';
import './HistoryTable.scss';

interface HistoryTableProps {
  filter: HistoryFilterForm | any; // Accept both old and new filter formats
  settings?: HistorySettings;
  onChange: (data: { reportDefinition: ReportHistoryData; configDefinition: ConfigDefinition }) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ filter, onChange }) => {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const storage = useMemo(() => new HelperStorage(), []);

  // Get global entity type
  const { entityType } = useGlobalUiSettingsStore();

  // Column widths state - load from localStorage
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('historyTable:columnWidths', {});
    const widths = saved || {
      createDateTime: 150,
      config: 200,
      type: 200,
      user: 200,
      status: 150,
      execution: 150,
      rows: 150,
      action: 120,
    };
    console.log('HistoryTable columnWidths loaded:', widths);
    return widths;
  });

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    storage.set('historyTable:columnWidths', columnWidths);
  }, [columnWidths, storage]);

  // Handle column resize
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      console.log('Resizing column:', key, 'to width:', size.width);
      setColumnWidths((prev) => ({
        ...prev,
        [key]: size.width,
      }));
    };
  }, []);

  // Fetch report history
  const { data: reportHistoryData = [], isLoading } = useQuery({
    queryKey: ['reportHistory', filter, entityType],
    queryFn: async () => {
      try {
        // Build params matching the Vue implementation
        const params: any = {
          fields: [
            'id',
            'configName',
            'reportFailed',
            'createTime',
            'finishTime',
            'type',
            'status',
            'description',
            'userId',
            'totalRowsCount',
            'regroupingPossible',
            'reportFailedShards',
          ],
          sorting: ['-createTime'],
          size: 500,
        };

        // Add filter params if they exist
        if (filter.dateFrom) params.from = filter.dateFrom;
        if (filter.dateTo) params.to = filter.dateTo;
        if (filter.type) params.filterByType = [filter.type];
        if (filter.user) params.username = filter.user;

        // Add status filters
        if (filter.status) {
          const statusMap: Record<string, string> = {
            'RUNNING': 'running',
            'FINISHED': 'finished',
            'SUCCESSFUL': 'success',
            'FAILED': 'failed',
            'CANCELED': 'canceled',
          };
          const statusKey = statusMap[filter.status];
          if (statusKey) {
            params[statusKey] = 'on';
          }
        }

        const { data } = await axiosPlatform.get('/api/platform-api/reporting/history', {
          params,
        });

        // Extract report history data from embedded format
        if (data._embedded?.reportHistoryFieldsViews) {
          const reports = data._embedded.reportHistoryFieldsViews.map((view: any) =>
            view.reportHistoryFields
          );

          // Debug: Log first report to see structure
          if (reports.length > 0) {
            console.log('Sample report data:', reports[0]);
          }

          // Fetch user data for all unique user IDs
          const userIds = [...new Set(reports.map((r: any) => r.userId).filter(Boolean))];
          if (userIds.length > 0) {
            try {
              const { data: users } = await axiosPlatform.post('/api/platform-api/users/get-by-ids', userIds);
              // Map users to reports
              return reports.map((report: any) => ({
                ...report,
                user: users.find((u: any) => u.userId === report.userId) || { username: report.userId },
              })) as ReportHistoryData[];
            } catch (error) {
              console.error('Failed to fetch users:', error);
              // Return reports with userId as username fallback
              return reports.map((report: any) => ({
                ...report,
                user: { username: report.userId || 'Unknown' },
              })) as ReportHistoryData[];
            }
          }

          return reports as ReportHistoryData[];
        }

        console.warn('Unexpected report history response format:', data);
        return [];
      } catch (error) {
        console.error('Failed to fetch report history:', error);
        return [];
      }
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds to catch new reports
  });

  // Transform data for table
  const tableData = useMemo(() => {
    if (!Array.isArray(reportHistoryData)) {
      return [];
    }
    return reportHistoryData.map((report) => {
      // Safely handle configName
      const configName = report.configName || report.name || 'Unknown';
      const reportName: string[] = configName.split('-');
      const configShortName: string =
        reportName.length < 3
          ? configName
          : reportName.slice(2).join('-');

      const createTime = moment(report.createTime);
      const finishTime = report.finishTime ? moment(report.finishTime) : null;
      const duration = finishTime && finishTime.isValid()
        ? moment.duration(finishTime.diff(createTime))
        : null;

      const createTimeStr = createTime.format('YYYY.MM.DD HH:mm:ss');
      const executionStr = duration ? formatDuration(duration) || 'Not yet run' : 'Not yet run';

      // Safely handle user
      const username = report.user?.username || report.userId || 'Unknown';

      return {
        id: report.id,
        groupingColumns: report.groupingColumns || [],
        groupingVersion: report.groupingVersion || '',
        title: `[${createTimeStr}] ${configShortName}`,
        createDateTime: createTimeStr,
        createDateTimeMkTime: createTime.format('x'),
        config: configShortName,
        type: report.type || '',
        user: username,
        status: report.status || '',
        execution: executionStr,
        rows: formatNumber(report.totalRowsCount || 0),
        totalRowsCount: report.totalRowsCount || 0,
        hierarhyEnable: report.hierarhyEnable || false,
        regroupingPossible: report.regroupingPossible || false,
      };
    });
  }, [reportHistoryData]);

  // Handle info button click - shows report details modal
  const handleInfoClick = useCallback(async (record: TableDataRow) => {
    // TODO: Implement info modal showing:
    // - Group by columns
    // - Filters
    // - Sorting
    // - Other report configuration details
    notification.info({
      message: 'Report Details',
      description: `Report ID: ${record.id}\nConfig: ${record.config}\nRows: ${record.totalRowsCount}`,
      duration: 5,
    });
  }, []);

  // Handle edit button click - opens hierarchy edit modal
  const handleEditClick = useCallback(async (record: TableDataRow) => {
    // TODO: Implement hierarchy edit modal
    notification.info({
      message: 'Edit Hierarchy',
      description: `Edit hierarchy grouping for report: ${record.config}`,
      duration: 3,
    });
  }, []);

  // Table columns with resizable widths
  const columns: ColumnsType<TableDataRow> = useMemo(() => [
    {
      title: 'DateTime',
      dataIndex: 'createDateTime',
      key: 'createDateTime',
      width: columnWidths.createDateTime,
      sorter: (a, b) => Number(a.createDateTimeMkTime) - Number(b.createDateTimeMkTime),
      defaultSortOrder: 'descend',
      onHeaderCell: (column: any) => ({
        width: columnWidths.createDateTime,
        onResize: handleResize('createDateTime'),
        'data-column-width': columnWidths.createDateTime,
      } as any),
    },
    {
      title: 'Config',
      dataIndex: 'config',
      key: 'config',
      width: columnWidths.config,
      onHeaderCell: (column: any) => ({
        width: columnWidths.config,
        onResize: handleResize('config'),
        'data-column-width': columnWidths.config,
      } as any),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: columnWidths.type,
      onHeaderCell: (column: any) => ({
        width: columnWidths.type,
        onResize: handleResize('type'),
        'data-column-width': columnWidths.type,
      } as any),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: columnWidths.user,
      onHeaderCell: (column: any) => ({
        width: columnWidths.user,
        onResize: handleResize('user'),
        'data-column-width': columnWidths.user,
      } as any),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
      onHeaderCell: (column: any) => ({
        width: columnWidths.status,
        onResize: handleResize('status'),
        'data-column-width': columnWidths.status,
      } as any),
    },
    {
      title: 'Execution',
      dataIndex: 'execution',
      key: 'execution',
      width: columnWidths.execution,
      onHeaderCell: (column: any) => ({
        width: columnWidths.execution,
        onResize: handleResize('execution'),
        'data-column-width': columnWidths.execution,
      } as any),
    },
    {
      title: 'Rows',
      dataIndex: 'rows',
      key: 'rows',
      width: columnWidths.rows,
      onHeaderCell: (column: any) => ({
        width: columnWidths.rows,
        onResize: handleResize('rows'),
        'data-column-width': columnWidths.rows,
      } as any),
    },
    {
      title: 'Action',
      key: 'action',
      width: columnWidths.action,
      fixed: 'right',
      onHeaderCell: (column: any) => ({
        width: columnWidths.action,
        onResize: handleResize('action'),
        'data-column-width': columnWidths.action,
      } as any),
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Tooltip title="View report details">
            <Button
              type="primary"
              shape="circle"
              icon={<InfoCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleInfoClick(record);
              }}
            />
          </Tooltip>
          {record.hierarhyEnable && record.regroupingPossible && (
            <Tooltip title="Edit hierarchy grouping">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(record);
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ], [columnWidths, handleResize, handleInfoClick, handleEditClick]);

  // Handle row click
  const handleRowClick = async (record: TableDataRow) => {
    setSelectedRowId(record.id);

    try {
      // Fetch report definition
      const { data: reportDef } = await axiosPlatform.get(
        `/api/platform-api/reporting/report/${record.id}`
      );

      // Fetch config definition
      const { data: configDef } = await axiosPlatform.get(
        `/api/platform-api/reporting/config/${reportDef.configId}`
      );

      onChange({
        reportDefinition: reportDef,
        configDefinition: configDef,
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to load report details',
      });
    }
  };

  return (
    <div className="history-table">
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowKey="id"
        bordered
        size="small"
        scroll={{ y: 250 }}
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: record.id === selectedRowId ? 'selected-row' : '',
        })}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />
    </div>
  );
};

// Helper functions
function formatDuration(duration: moment.Duration): string {
  const time: string[] = [];

  const days = Math.floor(duration.asDays());
  if (days) time.push(`${days}d`);

  const hours = duration.hours();
  if (hours) time.push(`${hours}h`);

  const minutes = duration.minutes();
  if (minutes) time.push(`${minutes}m`);

  const seconds = duration.seconds();
  if (seconds) time.push(`${seconds}s`);

  const milliseconds = duration.milliseconds();
  if (milliseconds) time.push(`${milliseconds}ms`);

  return time.join(' ');
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default HistoryTable;


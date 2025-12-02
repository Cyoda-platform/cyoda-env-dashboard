/**
 * HistoryTable Component
 * Migrated from: .old_project/packages/tableau/src/components/HistoryTable.vue
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Table, notification, Button, Tooltip, Spin } from 'antd';
import { InfoCircleOutlined, EditOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery } from '@tanstack/react-query';
import { axiosPlatform, useGlobalUiSettingsStore, getReportConfig } from '@cyoda/http-api-react';
import { HelperStorage } from '@cyoda/ui-lib-react';
import moment from 'moment';
import type { ReportHistoryData, TableDataRow, ConfigDefinition } from '@/types';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import { ResizableTitle } from './ResizableTitle';
import ReportDetailsDialog from './ReportDetailsDialog';
import type { ColumnData } from './ColumnCollectionsDialog';
import HelperReportTable from '../utils/HelperReportTable';
import './HistoryTable.scss';

interface HistoryTableProps {
  filter: HistoryFilterForm | any; // Accept both old and new filter formats
  lazyLoading?: boolean;
  onChange: (data: { reportDefinition: TableDataRow; configDefinition: ConfigDefinition }) => void;
  onGroupClick?: (row: any) => void;
  onShowColumnDetail?: (data: ColumnData) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  filter,
  lazyLoading = false,
  onChange,
  onGroupClick,
  onShowColumnDetail,
}) => {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
  // Store config definitions for expanded rows
  const [rowConfigDefinitions, setRowConfigDefinitions] = useState<Record<string, ConfigDefinition>>({});
  const [selectedReportDetails, setSelectedReportDetails] = useState<{
    id: string;
    config: string;
    groupingColumns: string[];
  } | null>(null);
  const [detailsConfigDefinition, setDetailsConfigDefinition] = useState<ConfigDefinition | null>(null);
  const storage = useMemo(() => new HelperStorage(), []);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(() => storage.get<number>('historyTable:pageSize', 10) || 10);

  // Get global entity type
  const { entityType } = useGlobalUiSettingsStore();

  // Fetch entity types data
  const { data: entityTypesData = [] } = useQuery({
    queryKey: ['entityTypes'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/platform-api/entity/types');
        return data._embedded?.entityTypes || [];
      } catch (error) {
        console.error('Failed to load entity types:', error);
        return [];
      }
    },
  });

  // Column widths state - using percentages for adaptive behavior within fixed container
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('historyTable:columnWidths', {});

    // Default widths in pixels - will be converted to percentages
    const defaultWidths = {
      createDateTime: 150,
      config: 200,
      type: 150,
      user: 150,
      status: 120,
      execution: 120,
      rows: 100,
      action: 120,
    };

    // Use saved widths if they exist and are not empty, otherwise use defaults
    return (saved && Object.keys(saved).length > 0) ? saved : defaultWidths;
  });

  // Sort state - load from localStorage
  const [sortField, setSortField] = useState<string | null>(() => {
    return storage.get('historyTable:sortField', null);
  });
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(() => {
    return storage.get('historyTable:sortOrder', null);
  });

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    storage.set('historyTable:columnWidths', columnWidths);
  }, [columnWidths, storage]);

  // Save sort settings to localStorage whenever they change
  useEffect(() => {
    storage.set('historyTable:sortField', sortField);
    storage.set('historyTable:sortOrder', sortOrder);
  }, [sortField, sortOrder, storage]);

  // Handle column resize - redistribute widths proportionally
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        // Get all adaptive columns (excluding the one being resized)
        const adaptiveKeys = Object.keys(prev).filter(k => k !== key);

        if (adaptiveKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

        // Calculate total width of adaptive columns
        const totalAdaptiveWidth = adaptiveKeys.reduce((sum, k) => sum + prev[k], 0);

        // Distribute the delta proportionally among other columns
        const newWidths = { ...prev, [key]: newWidth };

        adaptiveKeys.forEach(k => {
          const proportion = prev[k] / totalAdaptiveWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment); // Minimum 50px
        });

        return newWidths;
      });
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

    let data = reportHistoryData.map((report) => {
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

      // Find entity type info
      const reportType = report.type || '';
      const entityTypeInfo = entityTypesData.find((et: any) => {
        if (typeof et === 'object') {
          // Extract short class name from full class name
          // e.g., 'com.cyoda.tdb.model.search.SearchUsageEntity' -> 'SearchUsageEntity'
          const shortName = et.name.split('.').pop();
          return shortName === reportType;
        }
        return et === reportType;
      });
      const entityTypeValue = typeof entityTypeInfo === 'object' ? entityTypeInfo.type : null;

      return {
        id: report.id,
        groupingColumns: report.groupingColumns || [],
        groupingVersion: report.groupingVersion || '',
        title: `[${createTimeStr}] ${configShortName}`,
        createDateTime: createTimeStr,
        createDateTimeMkTime: createTime.format('x'),
        config: configShortName,
        type: reportType,
        user: username,
        status: report.status || '',
        execution: executionStr,
        rows: formatNumber(report.totalRowsCount || 0),
        totalRowsCount: report.totalRowsCount || 0,
        hierarhyEnable: report.hierarhyEnable || false,
        regroupingPossible: report.regroupingPossible || false,
        entityType: entityTypeValue,
      };
    });

    // Filter by entity type from global toggle
    if (entityTypesData.length > 0 && entityTypesData.some((et: any) => typeof et === 'object' && et.type)) {
      data = data.filter((item: any) => {
        // If entity has type info, filter by it
        if (item.entityType) {
          return item.entityType === entityType;
        }
        // If no type info, show in both modes (backward compatibility)
        return true;
      });
    }

    return data;
  }, [reportHistoryData, entityTypesData, entityType]);

  // Handle info button click - shows report details modal
  const handleInfoClick = useCallback(async (record: TableDataRow) => {
    try {
      // Fetch config definition for the report using the correct API
      const { data: configDef } = await getReportConfig(record.id);

      setSelectedReportDetails({
        id: record.id,
        config: record.config,
        groupingColumns: record.groupingColumns || [],
      });
      setDetailsConfigDefinition(configDef.content || configDef);
      setDetailsDialogVisible(true);
    } catch (error) {
      console.error('Failed to load report details:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load report configuration details',
      });
    }
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

  // Table columns - resizable with adaptive defaults
  const columns: ColumnsType<TableDataRow> = useMemo(() => [
    {
      title: 'DateTime',
      dataIndex: 'createDateTime',
      key: 'createDateTime',
      width: columnWidths.createDateTime,
      sorter: (a, b) => Number(a.createDateTimeMkTime) - Number(b.createDateTimeMkTime),
      sortOrder: sortField === 'createDateTime' ? sortOrder : (sortField === null ? 'descend' : null),
    },
    {
      title: 'Config',
      dataIndex: 'config',
      key: 'config',
      width: columnWidths.config,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: columnWidths.type,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: columnWidths.user,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: columnWidths.status,
    },
    {
      title: 'Execution',
      dataIndex: 'execution',
      key: 'execution',
      width: columnWidths.execution,
    },
    {
      title: 'Rows',
      dataIndex: 'rows',
      key: 'rows',
      width: columnWidths.rows,
    },
    {
      title: 'Action',
      key: 'action',
      width: columnWidths.action,
      fixed: 'right',
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
  ], [columnWidths, sortField, sortOrder, handleInfoClick, handleEditClick]);

  // Handle row click
  const handleRowClick = async (record: TableDataRow) => {
    setSelectedRowId(record.id);

    // Check if report has 0 rows
    if (parseInt(String(record.rows), 10) === 0) {
      notification.warning({
        message: 'Warning',
        description: 'Data cannot be loaded, because report have 0 rows',
      });
      return;
    }

    try {
      // Fetch config definition using the report ID
      // In old Vue project: api.getConfig(id) -> /platform-api/reporting/report/${id}/config
      const { data: configDef } = await axiosPlatform.get(
        `/api/platform-api/reporting/report/${record.id}/config`
      );

      onChange({
        reportDefinition: record,
        configDefinition: configDef.content,
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to load report details',
      });
    }
  };

  // Handle row expand - fetch config definition for the row
  const handleRowExpand = useCallback(async (expanded: boolean, record: TableDataRow) => {
    if (expanded && record.groupingVersion) {
      // Fetch config definition if not already cached
      if (!rowConfigDefinitions[record.id]) {
        try {
          const { data: configDef } = await axiosPlatform.get(
            `/api/platform-api/reporting/report/${record.id}/config`
          );
          setRowConfigDefinitions(prev => ({
            ...prev,
            [record.id]: configDef.content,
          }));
        } catch (error) {
          console.error('Failed to load config for expanded row:', error);
        }
      }
    }
  }, [rowConfigDefinitions]);

  // Inline Group List component
  const InlineGroupList: React.FC<{ reportId: string; groupingVersion: string }> = ({ reportId, groupingVersion }) => {
    const tableLinkGroup = `/platform-api/reporting/report/${reportId}/${groupingVersion}/groups?page=0&size=1000`;

    const { data: groups, isLoading } = useQuery({
      queryKey: ['reportGroups', tableLinkGroup],
      queryFn: async () => {
        const { data } = await axiosPlatform.get(tableLinkGroup);
        return data;
      },
      enabled: !!tableLinkGroup,
    });

    if (isLoading) {
      return (
        <div className="inline-group-list loading">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} size="small" />
          <span>Loading groups...</span>
        </div>
      );
    }

    if (!groups?._embedded?.wrappedEntityModels?.length) {
      return <div className="inline-group-list empty">No groups</div>;
    }

    const groupItems = groups._embedded.wrappedEntityModels.map((model: any) => {
      const formattedRow = HelperReportTable.formatGroupRow(model);
      return formattedRow;
    });

    return (
      <div className="inline-group-list">
        {groupItems.map((item: any, index: number) => {
          // Get summary columns (COUNT, SUM, etc.)
          const summaryKeys = Object.keys(item).filter(
            (key) => !['group', '_link_rows', '_link_groups', 'isNext', 'key'].includes(key)
          );

          return (
            <div
              key={index}
              className="group-item"
              onClick={() => {
                if (item._link_rows && onGroupClick) {
                  onGroupClick(item);
                }
              }}
            >
              <span className="group-name">{item.group}</span>
              {summaryKeys.map((key) => (
                <span key={key} className="group-summary">
                  {key}: {item[key]}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Expanded row render - shows inline group list
  const expandedRowRender = useCallback((record: TableDataRow) => {
    if (!record.groupingVersion) {
      return null;
    }

    return <InlineGroupList reportId={record.id} groupingVersion={record.groupingVersion} />;
  }, [onGroupClick]);

  // Custom expand icon
  const expandIcon = useCallback(({ expanded, onExpand, record }: any) => {
    // Don't show expand icon if no grouping version
    if (!record.groupingVersion) {
      return <span style={{ width: 17, display: 'inline-block' }} />;
    }

    return (
      <RightOutlined
        onClick={(e) => {
          e.stopPropagation();
          onExpand(record, e);
        }}
        style={{
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          cursor: 'pointer',
          marginRight: 8,
          fontSize: 10,
          color: 'var(--refine-text-secondary)',
        }}
      />
    );
  }, []);

  // Merge columns with resize handlers
  const resizableColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      onHeaderCell: () => ({
        width: col.width,
        onResize: handleResize(col.key as string),
      }),
    }));
  }, [columns, handleResize]);

  return (
    <div className="history-table">
      <Table
        columns={resizableColumns}
        dataSource={tableData}
        loading={isLoading}
        rowKey="id"
        bordered
        size="small"
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          className: 'pagination-bar',
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            storage.set('historyTable:pageSize', size);
          },
        }}
        onChange={(pagination, filters, sorter: any) => {
          // Handle sorting
          if (sorter && !Array.isArray(sorter)) {
            if (sorter.order) {
              setSortField(sorter.columnKey || sorter.field);
              setSortOrder(sorter.order);
            } else {
              // Clear sorting
              setSortField(null);
              setSortOrder(null);
            }
          }
        }}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
          onExpand: handleRowExpand,
          expandIcon,
          rowExpandable: (record) => !!record.groupingVersion,
        }}
        rowClassName={(record) => {
          const isSelected = record.id === selectedRowId;
          const isExpanded = expandedRowKeys.includes(record.id);
          console.log('rowClassName:', { recordId: record.id, selectedRowId, isSelected, isExpanded });
          return `${isSelected ? 'selected-row' : ''} ${isExpanded ? 'expanded-row' : ''}`.trim();
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />

      {/* Report Details Dialog */}
      <ReportDetailsDialog
        visible={detailsDialogVisible}
        reportId={selectedReportDetails?.id || ''}
        reportConfig={selectedReportDetails?.config || ''}
        groupingColumns={selectedReportDetails?.groupingColumns || []}
        configDefinition={detailsConfigDefinition}
        onClose={() => setDetailsDialogVisible(false)}
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


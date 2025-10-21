/**
 * HistoryTable Component
 * Migrated from: .old_project/packages/tableau/src/components/HistoryTable.vue
 */

import React, { useState, useMemo } from 'react';
import { Table, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import moment from 'moment';
import type { ReportHistoryData, TableDataRow, HistorySettings, ConfigDefinition } from '@/types';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import './HistoryTable.scss';

interface HistoryTableProps {
  filter: HistoryFilterForm | any; // Accept both old and new filter formats
  settings?: HistorySettings;
  onChange: (data: { reportDefinition: ReportHistoryData; configDefinition: ConfigDefinition }) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ filter, onChange }) => {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Fetch report history
  const { data: reportHistoryData = [], isLoading } = useQuery({
    queryKey: ['reportHistory', filter],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/platform-api/reporting/history', {
          params: filter,
        });
        return Array.isArray(data) ? data as ReportHistoryData[] : [];
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
      const reportName: string[] = report.configName.split('-');
      const configShortName: string =
        reportName.length < 3
          ? 'ERROR: CAN\'T GET CONFIG SHORTNAME'
          : reportName.slice(2).join('-');

      const createTime = moment(report.createTime);
      const finishTime = moment(report.finishTime);
      const duration = moment.duration(finishTime.diff(createTime));

      const createTimeStr = createTime.format('YYYY.MM.DD HH:mm:ss');
      const executionStr = formatDuration(duration) || 'Not yet run';

      return {
        id: report.id,
        groupingColumns: report.groupingColumns,
        groupingVersion: report.groupingVersion,
        title: `[${createTimeStr}] ${configShortName}`,
        createDateTime: createTimeStr,
        createDateTimeMkTime: createTime.format('x'),
        config: configShortName,
        type: report.type,
        user: report.user.username,
        status: report.status,
        execution: executionStr,
        rows: formatNumber(report.totalRowsCount),
        totalRowsCount: report.totalRowsCount,
        hierarhyEnable: report.hierarhyEnable,
        regroupingPossible: report.regroupingPossible,
      };
    });
  }, [reportHistoryData]);

  // Table columns
  const columns: ColumnsType<TableDataRow> = [
    {
      title: 'DateTime',
      dataIndex: 'createDateTime',
      key: 'createDateTime',
      width: 150,
      sorter: (a, b) => Number(a.createDateTimeMkTime) - Number(b.createDateTimeMkTime),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Config',
      dataIndex: 'config',
      key: 'config',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 200,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
    },
    {
      title: 'Execution',
      dataIndex: 'execution',
      key: 'execution',
      width: 150,
    },
    {
      title: 'Rows',
      dataIndex: 'rows',
      key: 'rows',
      width: 150,
    },
  ];

  // Handle row click
  const handleRowClick = async (record: TableDataRow) => {
    setSelectedRowId(record.id);

    try {
      // Fetch report definition
      const { data: reportDef } = await axios.get(
        `/platform-api/reporting/report/${record.id}`
      );

      // Fetch config definition
      const { data: configDef } = await axios.get(
        `/platform-api/reporting/config/${reportDef.configId}`
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
      />
    </div>
  );
};

// Helper functions
function formatDuration(duration: moment.Duration): string {
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default HistoryTable;


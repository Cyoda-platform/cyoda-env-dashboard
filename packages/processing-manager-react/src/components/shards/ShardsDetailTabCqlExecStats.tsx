/**
 * Shards Detail Tab - CQL Execution Statistics
 * Tab showing CQL execution statistics for Cassandra tables
 */

import React, { useState } from 'react';
import { Table, Button, Modal, Alert, message, Spin } from 'antd';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useCqlExecStatsAllTablesBrief,
  useCqlExecStatsTable,
  useClearCqlExecStats,
} from '../../hooks/usePlatformCommon';
import './ShardsDetailTabCqlExecStats.scss';

interface TimeStatDataDTO {
  numCalls?: number;
  total?: number;
  last?: number;
  min?: number;
  max?: number;
  avg?: number;
  measure?: number;
  measureDesc?: string;
  from0To100Micros?: number;
  from100MicrosTo1Millis?: number[];
  from1To10Millis?: number[];
  from10To100Millis?: number[];
  from100MillisTo1Second?: number[];
  from1To10Seconds?: number[];
  from10Seconds?: number;
}

interface TableOperationStatsDTO {
  operations: string;
  operationStats: TimeStatDataDTO;
  minuteStats?: Record<string, TimeStatDataDTO>;
}

interface TableTimeStatsDTO {
  table: string;
  tableStats?: TimeStatDataDTO;
  operationStats?: TableOperationStatsDTO[];
}

interface TableBriefStats extends TableTimeStatsDTO {
  [key: string]: any; // Allow for additional fields from API
}

interface TableDetailStats extends TableTimeStatsDTO {
  [key: string]: any; // Allow for additional fields from API
}

export const ShardsDetailTabCqlExecStats: React.FC = () => {
  console.log('ShardsDetailTabCqlExecStats: Component mounted');

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Fetch all tables brief statistics
  const {
    data: tablesData = [],
    isLoading: tablesLoading,
    error: tablesError,
    refetch: refetchTables,
  } = useCqlExecStatsAllTablesBrief();

  // Fetch details for selected table
  const {
    data: tableDetailData,
    isLoading: detailLoading,
    error: detailError,
  } = useCqlExecStatsTable(selectedTable || undefined);

  // Clear statistics mutation
  const clearStatsMutation = useClearCqlExecStats();

  console.log('ShardsDetailTabCqlExecStats: tablesData =', tablesData, 'isLoading =', tablesLoading);

  const handleRowClick = (record: TableBriefStats) => {
    console.log('Row clicked:', record);
    setSelectedTable(record.table);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedTable(null);
  };

  const handleClearStats = async () => {
    Modal.confirm({
      title: 'Clear CQL Execution Statistics',
      content: 'Are you sure you want to clear all CQL execution statistics? This action cannot be undone.',
      okText: 'Clear',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await clearStatsMutation.mutateAsync();
          message.success('CQL execution statistics cleared successfully');
          refetchTables();
        } catch (error) {
          message.error(`Failed to clear statistics: ${error}`);
        }
      },
    });
  };

  const columns: ColumnsType<TableBriefStats> = [
    {
      title: 'Table Name',
      dataIndex: 'table',
      key: 'table',
      width: 400,
      sorter: (a, b) => (a.table || '').localeCompare(b.table || ''),
      render: (text: string) => {
        // Remove quotes from table name
        const cleanName = text?.replace(/^"|"$/g, '') || text;
        return cleanName;
      },
    },
    {
      title: 'Num Calls',
      dataIndex: ['tableStats', 'numCalls'],
      key: 'numCalls',
      width: 130,
      sorter: (a, b) => (a.tableStats?.numCalls || 0) - (b.tableStats?.numCalls || 0),
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Min',
      dataIndex: ['tableStats', 'min'],
      key: 'min',
      width: 130,
      sorter: (a, b) => (a.tableStats?.min || 0) - (b.tableStats?.min || 0),
      render: (time: number, record: TableBriefStats) => {
        if (time == null) return '-';
        const measureDesc = record.tableStats?.measureDesc || 'us';
        return `${time.toLocaleString()}(${measureDesc})`;
      },
    },
    {
      title: 'Avg',
      dataIndex: ['tableStats', 'avg'],
      key: 'avg',
      width: 130,
      sorter: (a, b) => (a.tableStats?.avg || 0) - (b.tableStats?.avg || 0),
      render: (time: number, record: TableBriefStats) => {
        if (time == null) return '-';
        const measureDesc = record.tableStats?.measureDesc || 'us';
        return `${time.toLocaleString()}(${measureDesc})`;
      },
    },
    {
      title: 'Max',
      dataIndex: ['tableStats', 'max'],
      key: 'max',
      width: 130,
      sorter: (a, b) => (a.tableStats?.max || 0) - (b.tableStats?.max || 0),
      render: (time: number, record: TableBriefStats) => {
        if (time == null) return '-';
        const measureDesc = record.tableStats?.measureDesc || 'us';
        return `${time.toLocaleString()}(${measureDesc})`;
      },
    },
    {
      title: 'Last',
      dataIndex: ['tableStats', 'last'],
      key: 'last',
      width: 130,
      sorter: (a, b) => (a.tableStats?.last || 0) - (b.tableStats?.last || 0),
      render: (time: number, record: TableBriefStats) => {
        if (time == null) return '-';
        const measureDesc = record.tableStats?.measureDesc || 'us';
        return `${time.toLocaleString()}(${measureDesc})`;
      },
    },
    {
      title: 'Total',
      dataIndex: ['tableStats', 'total'],
      key: 'total',
      width: 130,
      sorter: (a, b) => (a.tableStats?.total || 0) - (b.tableStats?.total || 0),
      render: (time: number, record: TableBriefStats) => {
        if (time == null) return '-';
        // Total is in seconds, not microseconds
        return `${time.toLocaleString()}(s)`;
      },
    },
  ];

  const renderDetailContent = () => {
    if (detailLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading table details...</p>
        </div>
      );
    }

    if (detailError) {
      return (
        <Alert
          message="Error Loading Details"
          description={`Failed to load table details: ${detailError instanceof Error ? detailError.message : 'Unknown error'}`}
          type="error"
          showIcon
        />
      );
    }

    if (!tableDetailData) {
      return <div style={{ padding: '20px' }}>No details available</div>;
    }

    const stats = tableDetailData.tableStats;
    const operationStats = tableDetailData.operationStats || [];

    return (
      <div className="table-detail-content">
        <h3 style={{ marginTop: 0 }}>Table: {tableDetailData.table}</h3>

        {stats && (
          <div style={{ marginBottom: 24 }}>
            <h4>Overall Statistics</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Total Calls:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.numCalls?.toLocaleString() || 0}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Average Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.avg?.toLocaleString() || 0} us</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Min Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.min?.toLocaleString() || 0} us</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Max Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.max?.toLocaleString() || 0} us</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Total Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.total?.toLocaleString() || 0} s</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Last Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.last?.toLocaleString() || 0} us</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {operationStats.length > 0 && (
          <div>
            <h4>Per-Operation Statistics</h4>
            <Table
              dataSource={operationStats}
              rowKey="operations"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Operation',
                  dataIndex: 'operations',
                  key: 'operations',
                },
                {
                  title: 'Calls',
                  dataIndex: ['operationStats', 'numCalls'],
                  key: 'numCalls',
                  render: (val: number) => val?.toLocaleString() || 0,
                },
                {
                  title: 'Avg (us)',
                  dataIndex: ['operationStats', 'avg'],
                  key: 'avg',
                  render: (val: number) => val?.toLocaleString() || 0,
                },
                {
                  title: 'Min (us)',
                  dataIndex: ['operationStats', 'min'],
                  key: 'min',
                  render: (val: number) => val?.toLocaleString() || 0,
                },
                {
                  title: 'Max (us)',
                  dataIndex: ['operationStats', 'max'],
                  key: 'max',
                  render: (val: number) => val?.toLocaleString() || 0,
                },
              ]}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="shards-detail-tab-cql-exec-stats">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
          CQL Execution Statistics
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchTables()}
            loading={tablesLoading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearStats}
            loading={clearStatsMutation.isPending}
          >
            Clear
          </Button>
        </div>
      </div>

      {tablesError && (
        <Alert
          message="Error Loading Statistics"
          description={`Failed to load CQL execution statistics: ${tablesError instanceof Error ? tablesError.message : 'Unknown error'}`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={() => refetchTables()}>
              Retry
            </Button>
          }
        />
      )}

      <Table
        columns={columns}
        dataSource={tablesData}
        rowKey="table"
        bordered
        size="small"
        loading={tablesLoading || clearStatsMutation.isPending}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
          position: ['bottomCenter'],
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={
          <span>
            Details for table <code style={{ fontFamily: 'monospace' }}>{selectedTable?.replace(/^"|"$/g, '')}</code>
          </span>
        }
        open={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        {renderDetailContent()}
      </Modal>
    </div>
  );
};

export default ShardsDetailTabCqlExecStats;


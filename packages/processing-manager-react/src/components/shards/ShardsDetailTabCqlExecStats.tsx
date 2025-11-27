/**
 * Shards Detail Tab - CQL Execution Statistics
 * Tab showing CQL execution statistics for Cassandra tables
 */

import React, { useState, useMemo } from 'react';
import { Table, Button, Modal, Alert, message, Spin, Select, Tabs, Row, Col } from 'antd';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useCqlExecStatsTables,
  useCqlExecStatsAllTablesBrief,
  useCqlExecStatsTable,
  useClearCqlExecStats,
} from '../../hooks/usePlatformCommon';
import './ShardsDetailTabCqlExecStats.scss';

const { TabPane } = Tabs;

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

/**
 * Helper function to format time values in milliseconds for detail modal
 * Converts time from nanoseconds to milliseconds
 * API returns time in nanoseconds, need to divide by 1,000,000 to get ms
 */
const formatTimeWithMeasure = (time: number | undefined, measure: number | undefined, measureDesc: string | undefined): string => {
  if (time == null) return '-';

  // time is in nanoseconds (base unit)
  // Convert to milliseconds: divide by 1,000,000
  const timeInMs = time / 1000000;

  // Format with appropriate precision
  if (timeInMs < 0.01) {
    // Very small values: show 3 decimal places
    return `${timeInMs.toFixed(3)} ms`;
  } else if (timeInMs < 1) {
    // Less than 1ms: show 2 decimal places
    return `${timeInMs.toFixed(2)} ms`;
  } else if (timeInMs < 10) {
    // 1-10ms: show 1 decimal place
    return `${timeInMs.toFixed(1)} ms`;
  } else {
    // >= 10ms: show whole number
    return `${Math.round(timeInMs).toLocaleString()} ms`;
  }
};

/**
 * Format time in milliseconds for consistent table display
 * Converts time from nanoseconds to milliseconds
 * API returns time in nanoseconds, need to divide by 1,000,000 to get ms
 */
const formatTimeInMs = (time: number | undefined): string => {
  if (time == null) return '-';

  // time is in nanoseconds (base unit)
  // Convert to milliseconds: divide by 1,000,000
  const timeInMs = time / 1000000;

  // Format with appropriate precision
  if (timeInMs < 0.01) {
    // Very small values: show 3 decimal places
    return timeInMs.toFixed(3);
  } else if (timeInMs < 1) {
    // Less than 1ms: show 2 decimal places
    return timeInMs.toFixed(2);
  } else if (timeInMs < 10) {
    // 1-10ms: show 1 decimal place
    return timeInMs.toFixed(1);
  } else {
    // >= 10ms: show whole number
    return Math.round(timeInMs).toLocaleString();
  }
};

/**
 * Helper function to format table name for display
 * Removes quotes and splits composite keys
 */
const formatTableName = (tableName: string): { isComposite: boolean; tables: string[] } => {
  // Remove outer quotes
  const cleanName = tableName?.replace(/^"|"$/g, '') || tableName;

  // Check if this is a composite key (multiple tables separated by commas)
  if (cleanName.includes('","')) {
    const tables = cleanName.split('","').map(t => t.replace(/^"|"$/g, ''));
    return { isComposite: true, tables };
  }

  return { isComposite: false, tables: [cleanName] };
};

/**
 * Get color for time value based on performance thresholds
 * @param time - Time value in nanoseconds (always!)
 * @param measure - Display divisor (ignored for color calculation)
 * @returns Color code or undefined for normal values
 */
const getTimeColor = (time: number | undefined, measure: number = 1): string | undefined => {
  if (time == null) return undefined;

  // time is ALWAYS in nanoseconds regardless of measure
  // measure is only used for display formatting, not for color calculation
  const timeInNanoseconds = time;

  // Thresholds in nanoseconds (1ms = 1,000,000 ns)
  if (timeInNanoseconds >= 100000000) return '#ef4444'; // Red: >= 100ms - very slow
  if (timeInNanoseconds >= 50000000) return '#f97316';  // Orange: >= 50ms - slow
  if (timeInNanoseconds >= 10000000) return '#fbbf24';  // Yellow: >= 10ms - moderate

  return undefined; // Normal: < 10ms (no highlighting)
};

export const ShardsDetailTabCqlExecStats: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [tableFilter, setTableFilter] = useState<string | undefined>(undefined);

  // Fetch list of tracked tables for dropdown
  const {
    data: trackedTables = [],
    isLoading: trackedTablesLoading,
  } = useCqlExecStatsTables();

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

  // Filter tables data based on selected table filter
  const filteredTablesData = useMemo(() => {
    if (!tableFilter) return tablesData;
    return tablesData.filter((table: TableBriefStats) => table.table === tableFilter);
  }, [tablesData, tableFilter]);

  const handleRowClick = (record: TableBriefStats) => {
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
        // Remove outer quotes from table name
        const cleanName = text?.replace(/^"|"$/g, '') || text;

        // Check if this is a composite key (multiple tables separated by commas)
        // Pattern: "TABLE1","TABLE2","TABLE3"
        if (cleanName.includes('","')) {
          // Split by "," and display each table on a new line
          const tables = cleanName.split('","').map(t => t.replace(/^"|"$/g, ''));
          return (
            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {tables.map((table, index) => (
                <div key={index} style={{ marginBottom: index < tables.length - 1 ? '4px' : 0 }}>
                  {table}
                </div>
              ))}
            </div>
          );
        }

        // Single table - allow word wrap for long names
        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {cleanName}
          </div>
        );
      },
    },
    {
      title: 'Num Calls',
      dataIndex: ['tableStats', 'numCalls'],
      key: 'numCalls',
      width: 130,
      sorter: (a, b) => (a.tableStats?.numCalls || 0) - (b.tableStats?.numCalls || 0),
      render: (count: number, record: TableBriefStats) => {
        if (!record.tableStats) return '-';
        return count?.toLocaleString() || 0;
      },
    },
    {
      title: 'Min (ms)',
      dataIndex: ['tableStats', 'min'],
      key: 'min',
      width: 130,
      sorter: (a, b) => (a.tableStats?.min || 0) - (b.tableStats?.min || 0),
      render: (time: number, record: TableBriefStats) => {
        if (!record.tableStats) return '-';
        const color = getTimeColor(time, record.tableStats.measure);
        return (
          <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
            {formatTimeInMs(time)}
          </span>
        );
      },
    },
    {
      title: 'Avg (ms)',
      dataIndex: ['tableStats', 'avg'],
      key: 'avg',
      width: 130,
      sorter: (a, b) => (a.tableStats?.avg || 0) - (b.tableStats?.avg || 0),
      render: (time: number, record: TableBriefStats) => {
        if (!record.tableStats) return '-';
        const color = getTimeColor(time, record.tableStats.measure);
        return (
          <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
            {formatTimeInMs(time)}
          </span>
        );
      },
    },
    {
      title: 'Max (ms)',
      dataIndex: ['tableStats', 'max'],
      key: 'max',
      width: 130,
      sorter: (a, b) => (a.tableStats?.max || 0) - (b.tableStats?.max || 0),
      render: (time: number, record: TableBriefStats) => {
        if (!record.tableStats) return '-';
        const color = getTimeColor(time, record.tableStats.measure);
        return (
          <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
            {formatTimeInMs(time)}
          </span>
        );
      },
    },
    {
      title: 'Last (ms)',
      dataIndex: ['tableStats', 'last'],
      key: 'last',
      width: 130,
      sorter: (a, b) => (a.tableStats?.last || 0) - (b.tableStats?.last || 0),
      render: (time: number, record: TableBriefStats) => {
        if (!record.tableStats) return '-';
        const color = getTimeColor(time, record.tableStats.measure);
        return (
          <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
            {formatTimeInMs(time)}
          </span>
        );
      },
    },
    {
      title: 'Total (s)',
      dataIndex: ['tableStats', 'total'],
      key: 'total',
      width: 130,
      sorter: (a, b) => (a.tableStats?.total || 0) - (b.tableStats?.total || 0),
      render: (time: number, record: TableBriefStats) => {
        if (!record.tableStats || time == null) return '-';
        // Total is in seconds, not microseconds
        return time.toLocaleString();
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
    const { isComposite, tables } = formatTableName(tableDetailData.table);

    return (
      <div className="table-detail-content">
        {/* Always show table information block */}
        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          {isComposite ? (
            <>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#666' }}>
                Composite Partition Key ({tables.length} columns):
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', fontFamily: 'monospace' }}>
                {tables.map((table, index) => (
                  <li key={index}>{table}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#666' }}>
                Table:
              </div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 500 }}>
                {tables[0]}
              </div>
            </>
          )}
        </div>

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
                  <td style={{ padding: '8px', textAlign: 'right', color: getTimeColor(stats.avg, stats.measure), fontWeight: getTimeColor(stats.avg, stats.measure) ? 600 : 'normal' }}>
                    {formatTimeWithMeasure(stats.avg, stats.measure, stats.measureDesc)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Min Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: getTimeColor(stats.min, stats.measure), fontWeight: getTimeColor(stats.min, stats.measure) ? 600 : 'normal' }}>
                    {formatTimeWithMeasure(stats.min, stats.measure, stats.measureDesc)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Max Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: getTimeColor(stats.max, stats.measure), fontWeight: getTimeColor(stats.max, stats.measure) ? 600 : 'normal' }}>
                    {formatTimeWithMeasure(stats.max, stats.measure, stats.measureDesc)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Total Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.total?.toLocaleString() || 0} s</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Last Time:</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: getTimeColor(stats.last, stats.measure), fontWeight: getTimeColor(stats.last, stats.measure) ? 600 : 'normal' }}>
                    {formatTimeWithMeasure(stats.last, stats.measure, stats.measureDesc)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {stats && (
          <div style={{ marginBottom: 24 }}>
            <h4>Time Distribution</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>0 to 100 us:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.from0To100Micros?.toLocaleString() || 0} queries</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>100 us to 1 ms:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {Array.isArray(stats.from100MicrosTo1Millis)
                      ? stats.from100MicrosTo1Millis.reduce((a, b) => a + b, 0).toLocaleString()
                      : 0} queries
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>1 to 10 ms:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {Array.isArray(stats.from1To10Millis)
                      ? stats.from1To10Millis.reduce((a, b) => a + b, 0).toLocaleString()
                      : 0} queries
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>10 to 100 ms:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {Array.isArray(stats.from10To100Millis)
                      ? stats.from10To100Millis.reduce((a, b) => a + b, 0).toLocaleString()
                      : 0} queries
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>100 ms to 1 s:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {Array.isArray(stats.from100MillisTo1Second)
                      ? stats.from100MillisTo1Second.reduce((a, b) => a + b, 0).toLocaleString()
                      : 0} queries
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>1 to 10 s:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {Array.isArray(stats.from1To10Seconds)
                      ? stats.from1To10Seconds.reduce((a, b) => a + b, 0).toLocaleString()
                      : 0} queries
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>&gt; 10 s:</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{stats.from10Seconds?.toLocaleString() || 0} queries</td>
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
              expandable={{
                expandedRowRender: (record: TableOperationStatsDTO) => {
                  if (!record.minuteStats || Object.keys(record.minuteStats).length === 0) {
                    return <p style={{ margin: 0, padding: '8px', color: '#999' }}>No minute-level statistics available</p>;
                  }

                  const minuteData = Object.entries(record.minuteStats).map(([minute, stats]) => ({
                    minute,
                    ...stats,
                  }));

                  return (
                    <Table
                      dataSource={minuteData}
                      rowKey="minute"
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: 'Minute',
                          dataIndex: 'minute',
                          key: 'minute',
                        },
                        {
                          title: 'Calls',
                          dataIndex: 'numCalls',
                          key: 'numCalls',
                          render: (val: number) => val?.toLocaleString() || 0,
                        },
                        {
                          title: 'Avg',
                          dataIndex: 'avg',
                          key: 'avg',
                          render: (val: number, row: any) => {
                            const color = getTimeColor(val, row.measure);
                            return (
                              <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
                                {formatTimeWithMeasure(val, row.measure, row.measureDesc)}
                              </span>
                            );
                          },
                        },
                        {
                          title: 'Min',
                          dataIndex: 'min',
                          key: 'min',
                          render: (val: number, row: any) => {
                            const color = getTimeColor(val, row.measure);
                            return (
                              <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
                                {formatTimeWithMeasure(val, row.measure, row.measureDesc)}
                              </span>
                            );
                          },
                        },
                        {
                          title: 'Max',
                          dataIndex: 'max',
                          key: 'max',
                          render: (val: number, row: any) => {
                            const color = getTimeColor(val, row.measure);
                            return (
                              <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
                                {formatTimeWithMeasure(val, row.measure, row.measureDesc)}
                              </span>
                            );
                          },
                        },
                      ]}
                    />
                  );
                },
                rowExpandable: (record: TableOperationStatsDTO) => !!record.minuteStats && Object.keys(record.minuteStats).length > 0,
              }}
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
                  title: 'Avg',
                  dataIndex: ['operationStats', 'avg'],
                  key: 'avg',
                  render: (val: number, record: TableOperationStatsDTO) => {
                    const color = getTimeColor(val, record.operationStats?.measure);
                    return (
                      <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
                        {formatTimeWithMeasure(val, record.operationStats?.measure, record.operationStats?.measureDesc)}
                      </span>
                    );
                  },
                },
                {
                  title: 'Min',
                  dataIndex: ['operationStats', 'min'],
                  key: 'min',
                  render: (val: number, record: TableOperationStatsDTO) => {
                    const color = getTimeColor(val, record.operationStats?.measure);
                    return (
                      <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
                        {formatTimeWithMeasure(val, record.operationStats?.measure, record.operationStats?.measureDesc)}
                      </span>
                    );
                  },
                },
                {
                  title: 'Max',
                  dataIndex: ['operationStats', 'max'],
                  key: 'max',
                  render: (val: number, record: TableOperationStatsDTO) => {
                    const color = getTimeColor(val, record.operationStats?.measure);
                    return (
                      <span style={{ color, fontWeight: color ? 600 : 'normal' }}>
                        {formatTimeWithMeasure(val, record.operationStats?.measure, record.operationStats?.measureDesc)}
                      </span>
                    );
                  },
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Select
            placeholder="Filter by table"
            allowClear
            showSearch
            style={{ width: 400 }}
            popupMatchSelectWidth={false}
            classNames={{ popup: { root: 'cql-stats-table-filter-dropdown' } }}
            styles={{ popup: { root: { minWidth: 500, maxWidth: 800 } } }}
            value={tableFilter}
            onChange={setTableFilter}
            loading={trackedTablesLoading}
            optionRender={(option) => {
              const tableName = option.value as string;
              const { isComposite, tables } = formatTableName(tableName);

              if (isComposite) {
                return (
                  <div style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                      Composite Key ({tables.length} columns)
                    </div>
                    <div style={{ fontSize: '14px', whiteSpace: 'normal', lineHeight: '1.5', color: '#333' }}>
                      {tables.join(', ')}
                    </div>
                  </div>
                );
              }

              return (
                <div style={{ fontSize: '14px', padding: '8px 12px' }}>
                  {tables[0]}
                </div>
              );
            }}
            optionLabelProp="label"
            options={trackedTables.map((table: string) => {
              const { isComposite, tables } = formatTableName(table);

              // Label for selected value (shown in the input field)
              const label = isComposite
                ? `${tables[0]} (+${tables.length - 1} more)`
                : tables[0];

              return {
                label,
                value: table,
                title: isComposite ? tables.join(', ') : tables[0], // Tooltip
              };
            })}
          />
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
        dataSource={filteredTablesData}
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
          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            CQL Execution Statistics
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
        destroyOnHidden
      >
        {renderDetailContent()}
      </Modal>
    </div>
  );
};

export default ShardsDetailTabCqlExecStats;


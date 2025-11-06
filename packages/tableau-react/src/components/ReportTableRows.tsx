/**
 * ReportTableRows Component
 * Migrated from: .old_project/packages/tableau/src/components/ReportTable/ReportTableRows.vue
 *
 * This component loads report data and sends it to Tableau Web Data Connector
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table } from 'antd';
import type { ResizeCallbackData } from 'react-resizable';
import { axios } from '@cyoda/http-api-react';
import { HelperStorage } from '@cyoda/ui-lib-react';
import type { ConfigDefinition, ReportingReportRows, TableColumn, TableauConnectionData } from '@/types';
import type { ColumnData } from './ColumnCollectionsDialog';
import EntityDetailModal from './EntityDetailModal';
import { ResizableTitle } from './ResizableTitle';
import './ReportTableRows.scss';

interface ReportTableRowsProps {
  tableLinkRows: string;
  lazyLoading: boolean;
  configDefinition: ConfigDefinition;
  onShowColumnDetail?: (data: ColumnData) => void;
}

const ReportTableRows: React.FC<ReportTableRowsProps> = ({
  tableLinkRows,
  lazyLoading,
  configDefinition,
  onShowColumnDetail,
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [pageSize, setPageSize] = useState(50);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const storage = useMemo(() => new HelperStorage(), []);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('reportTableRows:columnWidths', {});
    return saved && Object.keys(saved).length > 0 ? saved : {};
  });

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('reportTableRows:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  // Handle column resize - redistribute widths proportionally
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key] || 150; // Default width if not set
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        // Get all columns (excluding the one being resized)
        const otherKeys = Object.keys(prev).filter(k => k !== key);

        if (otherKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

        // Calculate total width of other columns
        const totalOtherWidth = otherKeys.reduce((sum, k) => sum + prev[k], 0);

        // Distribute the delta proportionally among other columns
        const newWidths = { ...prev, [key]: newWidth };

        otherKeys.forEach(k => {
          const proportion = prev[k] / totalOtherWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment); // Min width 50px
        });

        return newWidths;
      });
    };
  }, []);

  // Load rows from API
  const loadRows = async (link: string): Promise<ReportingReportRows> => {
    const { data } = await axios.get(link);
    return data;
  };

  // Set table columns from config definition
  const setTableColumnsFromConfig = () => {
    if (configDefinition && configDefinition.columns) {
      const columns = configDefinition.columns.map((el) => {
        const name = shortNamePath(el.name);
        return {
          label: name,
          prop: getFieldName(name),
        };
      });
      setTableColumns(columns);
    } else {
      setTableColumns([]);
    }
  };

  // Get field name from column name
  const getFieldName = (name: string): string => {
    let field = name.replace(/\./g, '_');
    if (field.indexOf('*') > -1) {
      const fields = field.split('_[');
      field = fields[0];
    }

    if (field.indexOf('_["#') > -1) {
      field = field.replace(/\[("|")(.*)("|")\]/, (_match, ...args) => {
        return args[1];
      });
    }
    return field;
  };

  // Short name path helper
  const shortNamePath = (path: string): string => {
    // Simplified version - you may need to implement full logic
    return path.split('.').pop() || path;
  };

  // Flatten table row
  const flatTableRow = (obj: any, prefix = ''): any => {
    const flattened: any = {};
    
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flatTableRow(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  };

  // Set table data from API response
  const setTableDataFromResponse = (data: ReportingReportRows) => {
    if (Object.keys(data).length > 0) {
      let reportRows = data._embedded.reportRows;
      if (lazyLoading) {
        reportRows = reportRows.slice(0, pageSize);
      }
      const flattenedData = reportRows.map((el) => flatTableRow(el.content));
      setTableData(flattenedData);
    }
  };

  // Load data on mount and when tableLinkRows changes
  useEffect(() => {
    const loadData = async () => {
      if (!tableLinkRows) return;

      try {
        const size = lazyLoading ? pageSize : 100000;
        const data = await loadRows(`${tableLinkRows}?size=${size}`);

        setTableColumnsFromConfig();
        setTableDataFromResponse(data);
      } catch (error) {
        console.error('Failed to load report rows:', error);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableLinkRows, lazyLoading, pageSize]);

  // Send data to Tableau when tableData changes
  useEffect(() => {
    if (tableData.length === 0 || tableColumns.length === 0) return;
    if (!window.tableau) {
      console.warn('Tableau Web Data Connector not loaded');
      return;
    }

    const tableauColumns = tableColumns.map((el) => ({
      id: el.prop,
      alias: el.label,
      dataType: window.tableau.dataTypeEnum.string,
    }));

    const connectionData: TableauConnectionData = {
      tableauColumns,
      tableauData: tableData,
      tableauTableAlias: configDefinition.description || 'Report Data',
    };

    window.tableau.connectionData = JSON.stringify(connectionData);
    window.tableau.connectionName = configDefinition.description || 'Report Data';
    window.tableau.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, tableColumns]);

  // Handle row double click
  const handleRowDoubleClick = (record: any) => {
    setSelectedRow(record);
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRow(null);
  };

  // Handle column cell click for object/array values
  const handleCellClick = (record: any, columnName: string) => {
    const value = record[columnName];
    if (value && typeof value === 'object' && onShowColumnDetail) {
      onShowColumnDetail({
        headerName: columnName,
        data: value,
      });
    }
  };

  // Create Ant Design columns from table columns with resizable support
  const antColumns = tableColumns.map((col) => ({
    title: col.label,
    dataIndex: col.prop,
    key: col.prop,
    width: columnWidths[col.prop],
    ellipsis: true,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(col.prop),
    }),
    render: (value: any, record: any) => {
      // Check if value is an object or array
      if (value && typeof value === 'object') {
        return (
          <span
            className="clickable-cell"
            onClick={() => handleCellClick(record, col.prop)}
            style={{ cursor: 'pointer', color: '#00D4AA', textDecoration: 'underline' }}
          >
            {Array.isArray(value) ? `[Array: ${value.length} items]` : '[Object]'}
          </span>
        );
      }
      return value;
    },
  }));

  // Render the table with data
  return (
    <div className="report-table-rows">
      <div style={{ marginBottom: 16 }}>
        <strong>Report Results:</strong> {tableData.length} rows
      </div>
      <Table
        columns={antColumns}
        dataSource={tableData}
        loading={!tableLinkRows || tableData.length === 0}
        rowKey={(record) => record.id || record.key || JSON.stringify(record)}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} rows`,
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
        scroll={{ x: true, y: 400 }}
        bordered
        size="small"
        onRow={(record) => ({
          onDoubleClick: () => handleRowDoubleClick(record),
        })}
      />

      {/* Entity Detail Modal */}
      <EntityDetailModal
        visible={isModalVisible}
        selectedRow={selectedRow}
        configDefinition={configDefinition}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default ReportTableRows;


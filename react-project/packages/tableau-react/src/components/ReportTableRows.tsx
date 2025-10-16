/**
 * ReportTableRows Component
 * Migrated from: .old_project/packages/tableau/src/components/ReportTable/ReportTableRows.vue
 * 
 * This component loads report data and sends it to Tableau Web Data Connector
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import type { ConfigDefinition, ReportingReportRows, TableColumn, TableauConnectionData } from '@/types';

interface ReportTableRowsProps {
  tableLinkRows: string;
  lazyLoading: boolean;
  configDefinition: ConfigDefinition;
}

const ReportTableRows: React.FC<ReportTableRowsProps> = ({
  tableLinkRows,
  lazyLoading,
  configDefinition,
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

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
      field = field.replace(/\[("|")(.*)("|")\]/, (match, ...args) => {
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

      setIsLoading(true);
      try {
        const size = lazyLoading ? pageSize : 100000;
        const data = await loadRows(`${tableLinkRows}?size=${size}`);
        
        if (!lazyLoading) {
          setTotalElements(data.page.totalElements);
        }
        
        setTableColumnsFromConfig();
        setTableDataFromResponse(data);
      } catch (error) {
        console.error('Failed to load report rows:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
  }, [tableData, tableColumns, configDefinition]);

  // Convert table columns to Ant Design columns
  const antColumns: ColumnsType<any> = useMemo(() => {
    return tableColumns.map((col) => ({
      title: col.label,
      dataIndex: col.prop,
      key: col.prop,
      ellipsis: true,
    }));
  }, [tableColumns]);

  // This component doesn't render anything visible
  // It just sends data to Tableau
  return null;

  // Optionally, you can render a hidden table for debugging:
  // return (
  //   <div style={{ display: 'none' }}>
  //     <Table
  //       columns={antColumns}
  //       dataSource={tableData}
  //       loading={isLoading}
  //       rowKey={(record, index) => index?.toString() || '0'}
  //       pagination={false}
  //     />
  //   </div>
  // );
};

export default ReportTableRows;


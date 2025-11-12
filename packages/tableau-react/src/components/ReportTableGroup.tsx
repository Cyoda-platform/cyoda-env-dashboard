/**
 * ReportTableGroup Component
 * Migrated from: .old_project/packages/http-api/src/components/ReportTable/ReportTableGroup.vue
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery } from '@tanstack/react-query';
import { axios } from '@cyoda/http-api-react';
import { RightOutlined } from '@ant-design/icons';
import ReportTableRows from './ReportTableRows';
import type { ColumnData } from './ColumnCollectionsDialog';
import HelperReportTable, { type ReportGroup, type WrappedEntityModel } from '../utils/HelperReportTable';
import type { ConfigDefinition } from '../types';
import { HelperStorage } from '@cyoda/ui-lib-react';
import { ResizableTitle } from './ResizableTitle';
import './ReportTableGroup.scss';

interface ReportTableGroupProps {
  tableLinkGroup: string;
  showHeader?: boolean;
  displayGroupType: 'in' | 'out';
  configDefinition: ConfigDefinition;
  lazyLoading: boolean;
  smallPagination?: boolean;
  onRowClick?: (row: any) => void;
  onShowColumnDetail?: (data: ColumnData) => void;
}

interface TableDataRow {
  key: string;
  group: string;
  _link_rows: string;
  _link_groups: string | null;
  isNext: boolean;
  [key: string]: any;
}

const STORAGE_KEY = 'ReportTableGroup';

const ReportTableGroup: React.FC<ReportTableGroupProps> = ({
  tableLinkGroup,
  showHeader = true,
  displayGroupType,
  configDefinition,
  lazyLoading,
  smallPagination = false,
  onRowClick,
  onShowColumnDetail,
}) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => storage.get<number>(STORAGE_KEY, 5) || 5);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('reportTableGroup:columnWidths', {});
    const defaultWidths = { group: 350 };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('reportTableGroup:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  // Handle column resize - redistribute widths proportionally
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key] || 150;
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

        const totalOtherWidth = otherKeys.reduce((sum, k) => sum + prev[k], 0);
        const newWidths = { ...prev, [key]: newWidth };

        otherKeys.forEach(k => {
          const proportion = prev[k] / totalOtherWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment);
        });

        return newWidths;
      });
    };
  }, []);

  // Load groups data
  const { data: groups, isLoading } = useQuery({
    queryKey: ['reportGroups', tableLinkGroup],
    queryFn: async () => {
      if (!tableLinkGroup) return null;
      const { data } = await axios.get<ReportGroup>(tableLinkGroup);
      return data;
    },
    enabled: !!tableLinkGroup,
  });

  // Calculate table columns with resizable support
  const tableColumns = useMemo(() => {
    if (!groups || Object.keys(groups).length === 0) return [];

    const columns: ColumnsType<TableDataRow> = [
      {
        title: 'Group',
        dataIndex: 'group',
        key: 'group',
        width: columnWidths['group'] || 350,
        onHeaderCell: (column: any) => ({
          width: column.width,
          onResize: handleResize('group'),
        }),
      },
    ];

    const additionalColumns = HelperReportTable.getHeaderHistoryGroupColumns(groups);
    additionalColumns.forEach((col) => {
      columns.push({
        title: col.label,
        dataIndex: col.prop,
        key: col.prop,
        width: columnWidths[col.prop] || 350,
        onHeaderCell: (column: any) => ({
          width: column.width,
          onResize: handleResize(col.prop),
        }),
      });
    });

    return columns;
  }, [groups, columnWidths, handleResize]);

  // Calculate table data
  const tableData = useMemo((): TableDataRow[] => {
    if (!groups || Object.keys(groups).length === 0) return [];

    return groups._embedded.wrappedEntityModels.slice(0, groups.page.size).map((model, index) => {
      const formattedRow = HelperReportTable.formatGroupRow(model);
      return {
        ...formattedRow,
        key: `group-${index}`,
      };
    });
  }, [groups]);

  // Handle row click
  const handleRowClick = useCallback(
    (record: TableDataRow) => {
      if (!record.isNext && displayGroupType === 'out') {
        setSelectedRowKey(record.key);
        onRowClick?.(record);
      }
    },
    [displayGroupType, onRowClick]
  );

  // Handle page size change
  useEffect(() => {
    storage.set(STORAGE_KEY, pageSize);
  }, [pageSize, storage]);

  // Expandable row render
  const expandedRowRender = useCallback(
    (record: TableDataRow) => {
      // If it has nested groups, render another ReportTableGroup
      if (record.isNext && record._link_groups) {
        return (
          <div className="inner-group-table">
            <ReportTableGroup
              tableLinkGroup={record._link_groups}
              showHeader={false}
              displayGroupType={displayGroupType}
              configDefinition={configDefinition}
              lazyLoading={lazyLoading}
              smallPagination={smallPagination}
            />
          </div>
        );
      }

      // If displayGroupType is 'in', render rows directly
      if (displayGroupType === 'in' && record._link_rows) {
        return (
          <ReportTableRows
            tableLinkRows={record._link_rows}
            lazyLoading={lazyLoading}
            configDefinition={configDefinition}
            onShowColumnDetail={onShowColumnDetail}
          />
        );
      }

      return null;
    },
    [displayGroupType, configDefinition, lazyLoading, smallPagination]
  );

  // Determine if row is expandable
  const isRowExpandable = useCallback(
    (record: TableDataRow) => {
      if (tableData.length === 0) return false;
      const firstRow = tableData[0];
      return firstRow.isNext || displayGroupType === 'in';
    },
    [tableData, displayGroupType]
  );

  // Calculate max height for table
  const [maxHeight, setMaxHeight] = useState(500);

  useEffect(() => {
    const resize = () => {
      const headerHeight = document.querySelector('header.sticky')?.clientHeight || 0;
      let height = window.innerHeight - headerHeight - 100;
      if (height < 150) height = 200;
      setMaxHeight(height);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Pagination config
  const paginationConfig = smallPagination
    ? {
        simple: true,
        current: currentPage,
        pageSize: pageSize,
        total: tableData.length,
        onChange: (page: number, size: number) => {
          setCurrentPage(page);
          setPageSize(size);
        },
      }
    : {
        current: currentPage,
        pageSize: pageSize,
        total: tableData.length,
        showSizeChanger: true,
        showTotal: (total: number) => `Total ${total} items`,
        onChange: (page: number, size: number) => {
          setCurrentPage(page);
          setPageSize(size);
        },
      };

  // Custom expand icon
  const expandIcon = ({ expanded, onExpand, record }: any) => (
    <RightOutlined
      onClick={(e) => onExpand(record, e)}
      style={{
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--refine-text-secondary)',
      }}
    />
  );

  return (
    <div className="report-table-group">
      <Table
        columns={tableColumns}
        dataSource={tableData}
        loading={isLoading}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        bordered
        size="small"
        showHeader={showHeader}
        scroll={{ y: maxHeight }}
        pagination={paginationConfig}
        expandable={{
          expandedRowRender: isRowExpandable(tableData[0]) ? expandedRowRender : undefined,
          expandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
          expandIcon: expandIcon,
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: selectedRowKey === record.key && displayGroupType === 'out' ? 'selected-row' : '',
        })}
      />
    </div>
  );
};

export default ReportTableGroup;


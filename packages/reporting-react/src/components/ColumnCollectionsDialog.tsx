/**
 * ColumnCollectionsDialog Component
 * Dialog for displaying column collection details
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterColumnCollections.vue
 */

import React, { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Modal, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './ColumnCollectionsDialog.scss';

export interface ColumnData {
  headerName: string;
  data: {
    [key: string]: any;
  };
}

export interface ColumnCollectionsDialogRef {
  showDetail: (data: ColumnData) => void;
}

interface TableRow {
  key: string;
  index: string;
  value: string;
}

const ColumnCollectionsDialog = forwardRef<ColumnCollectionsDialogRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [columnData, setColumnData] = useState<ColumnData>({
    headerName: '',
    data: {},
  });

  const showDetail = (data: ColumnData) => {
    setVisible(true);
    setColumnData(data);
  };

  useImperativeHandle(ref, () => ({
    showDetail,
  }));

  const handleClose = () => {
    setVisible(false);
  };

  const title = `Column ${columnData.headerName}`;

  // Convert data to table format
  const tableData: TableRow[] = useMemo(() => {
    return Object.keys(columnData.data).map((key) => ({
      key,
      index: key,
      value: typeof columnData.data[key] === 'object'
        ? JSON.stringify(columnData.data[key])
        : String(columnData.data[key]),
    }));
  }, [columnData.data]);

  // Table columns
  const columns: ColumnsType<TableRow> = [
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
      width: 100,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
  ];

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={600}
      className="column-collections-dialog"
    >
      <Table
        columns={columns}
        dataSource={tableData}
        size="small"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
});

ColumnCollectionsDialog.displayName = 'ColumnCollectionsDialog';

export default ColumnCollectionsDialog;

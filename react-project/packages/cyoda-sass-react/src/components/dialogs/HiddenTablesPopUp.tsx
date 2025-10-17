import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Modal, Table, Input, Checkbox, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SqlTable } from '../../types';
import './HiddenTablesPopUp.css';

interface HiddenTablesPopUpProps {
  tables: SqlTable[];
}

export interface HiddenTablesPopUpRef {
  open: () => void;
}

const HiddenTablesPopUp = forwardRef<HiddenTablesPopUpRef, HiddenTablesPopUpProps>(
  ({ tables }, ref) => {
    const [visible, setVisible] = useState(false);
    const [filter, setFilter] = useState('');

    // Open dialog
    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
        setFilter('');
      },
    }));

    // Filter hidden tables
    const filteredTables = useMemo(() => {
      if (!tables) return [];
      return tables
        .filter((el) => el.hidden)
        .filter((el) => {
          if (!filter) return true;
          return el.tableName.toLowerCase().includes(filter.toLowerCase());
        });
    }, [tables, filter]);

    // Handle checkbox change
    const handleHiddenChange = (record: SqlTable, checked: boolean) => {
      record.hidden = checked;
    };

    // Table columns
    const columns: ColumnsType<SqlTable> = [
      {
        title: 'Deleted',
        key: 'hidden',
        width: 140,
        render: (_, record) => (
          <Checkbox
            checked={record.hidden}
            onChange={(e) => handleHiddenChange(record, e.target.checked)}
          />
        ),
      },
      {
        title: 'Table Name',
        dataIndex: 'tableName',
        key: 'tableName',
      },
      {
        title: 'Uniformed Path',
        dataIndex: 'uniformedPath',
        key: 'uniformedPath',
      },
    ];

    return (
      <Modal
        title="Restore Tables"
        open={visible}
        onCancel={() => setVisible(false)}
        width="80%"
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
        maskClosable={false}
      >
        <div className="hidden-tables-actions">
          <Input
            placeholder="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 250, marginBottom: 10 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredTables}
          rowKey="tableName"
          bordered
          pagination={false}
        />
      </Modal>
    );
  }
);

HiddenTablesPopUp.displayName = 'HiddenTablesPopUp';

export default HiddenTablesPopUp;


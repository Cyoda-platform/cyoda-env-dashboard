import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Table, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface DataRelation {
  column: {
    srcColumnPath: string;
    dstColumnPath: string;
    jsonPath?: string;
  };
  type: 'columnMapping' | 'functionalMapping' | 'cobiCoreMetadata';
}

interface DeleteRelationsDialogProps {
  selectedDataRelations: DataRelation[];
  onDelete: (relation: DataRelation) => void;
  onDeleteList: (relations: DataRelation[]) => void;
}

export interface DeleteRelationsDialogRef {
  open: () => void;
  close: () => void;
}

const DeleteRelationsDialog = forwardRef<DeleteRelationsDialogRef, DeleteRelationsDialogProps>(
  ({ selectedDataRelations, onDelete, onDeleteList }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const handleDelete = (record: DataRelation) => {
      Modal.confirm({
        title: 'Confirm!',
        content: 'Do you really want to remove?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          onDelete(record);
          message.success('Relation deleted successfully');
        },
      });
    };

    const handleDeleteAll = () => {
      Modal.confirm({
        title: 'Confirm!',
        content: `Do you really want to remove ${selectedDataRelations.length} record(s)?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          onDeleteList(selectedDataRelations);
          setVisible(false);
          message.success(`${selectedDataRelations.length} relation(s) deleted successfully`);
        },
      });
    };

    const columns: ColumnsType<DataRelation> = [
      {
        title: 'Source Field',
        dataIndex: ['column', 'srcColumnPath'],
        key: 'srcColumnPath',
        ellipsis: true,
      },
      {
        title: 'Target Field',
        dataIndex: ['column', 'dstColumnPath'],
        key: 'dstColumnPath',
        ellipsis: true,
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (_, record) => (
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        ),
      },
    ];

    return (
      <Modal
        title="Delete Relations"
        open={visible}
        onCancel={() => setVisible(false)}
        width={800}
        footer={[
          <Button key="deleteAll" danger onClick={handleDeleteAll}>
            <DeleteOutlined /> Delete All
          </Button>,
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={selectedDataRelations}
          rowKey={(record) => `${record.column.srcColumnPath}-${record.column.dstColumnPath}`}
          pagination={false}
          size="small"
        />
      </Modal>
    );
  }
);

DeleteRelationsDialog.displayName = 'DeleteRelationsDialog';

export default DeleteRelationsDialog;


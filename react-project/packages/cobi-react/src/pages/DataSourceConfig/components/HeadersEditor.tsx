import React from 'react';
import { Button, Table, Input, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { confirm } = Modal;

interface HeaderRow {
  key: string;
  value: string;
}

interface HeadersEditorProps {
  headers: { [key: string]: string };
  onChange: (headers: { [key: string]: string }) => void;
}

const HeadersEditor: React.FC<HeadersEditorProps> = ({ headers, onChange }) => {
  // Convert headers object to array for table
  const headersArray: HeaderRow[] = Object.entries(headers || {}).map(([key, value]) => ({
    key,
    value,
  }));

  const handleAdd = () => {
    const newHeaders = { ...headers, '': '' };
    onChange(newHeaders);
  };

  const handleDelete = (headerKey: string) => {
    confirm({
      title: 'Delete Header',
      content: 'Are you sure you want to delete this header?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const newHeaders = { ...headers };
        delete newHeaders[headerKey];
        onChange(newHeaders);
      },
    });
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    const newHeaders = { ...headers };
    const value = newHeaders[oldKey];
    delete newHeaders[oldKey];
    newHeaders[newKey] = value;
    onChange(newHeaders);
  };

  const handleValueChange = (key: string, value: string) => {
    const newHeaders = { ...headers, [key]: value };
    onChange(newHeaders);
  };

  const columns: ColumnsType<HeaderRow> = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: '40%',
      render: (key: string) => (
        <Input
          value={key}
          onChange={(e) => handleKeyChange(key, e.target.value)}
          placeholder="Header key"
        />
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '50%',
      render: (value: string, record) => (
        <Input
          value={value}
          onChange={(e) => handleValueChange(record.key, e.target.value)}
          placeholder="Header value"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
        />
      ),
    },
  ];

  return (
    <div className="headers-editor">
      <div style={{ marginBottom: 8 }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block
        >
          Add Header
        </Button>
      </div>
      <Table
        dataSource={headersArray}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="key"
        locale={{ emptyText: 'No headers configured' }}
      />
    </div>
  );
};

export default HeadersEditor;


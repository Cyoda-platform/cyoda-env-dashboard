import React, { useState } from 'react';
import { Table, Input, Button, Modal, message } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Script } from '../../../types';
import './ScriptEditorFields.css';

interface ScriptEditorFieldsProps {
  script?: Script;
}

const ScriptEditorFields: React.FC<ScriptEditorFieldsProps> = ({ script }) => {
  const [filterSourceFields, setFilterSourceFields] = useState('');

  if (!script) return null;

  const handleCopy = (field: string) => {
    const textToCopy = `input.get("${field}")`;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        message.success('Value was copied');
      },
      () => {
        message.error('Value was NOT copied');
      }
    );
  };

  const handleDelete = (field: 'inputSrcPaths' | 'inputMetaPaths', value: string) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to delete this element?',
      onOk: () => {
        if (script[field]) {
          const index = script[field].indexOf(value);
          if (index > -1) {
            script[field].splice(index, 1);
            message.success('Field deleted');
          }
        }
      },
    });
  };

  const sourceFieldsData = (script.inputSrcPaths || [])
    .filter((field) => {
      const filter = filterSourceFields.toLowerCase();
      return !filter || field.toLowerCase().includes(filter);
    })
    .map((field) => ({
      key: field,
      field,
    }));

  const metaPathsData = (script.inputMetaPaths || []).map((field) => ({
    key: field,
    field,
  }));

  const sourceColumns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      ellipsis: true,
      render: (text: string) => (
        <span>
          <CopyOutlined
            onClick={() => handleCopy(text)}
            style={{ marginRight: 8, cursor: 'pointer' }}
          />
          {text}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete('inputSrcPaths', record.field)}
        />
      ),
    },
  ];

  const metaColumns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      ellipsis: true,
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete('inputMetaPaths', record.field)}
        />
      ),
    },
  ];

  return (
    <div className="script-editor-fields">
      <h3>Source Fields</h3>
      <Input
        placeholder="Filter"
        value={filterSourceFields}
        onChange={(e) => setFilterSourceFields(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Table
        size="small"
        dataSource={sourceFieldsData}
        columns={sourceColumns}
        pagination={false}
        scroll={{ y: 200 }}
      />

      <h3 style={{ marginTop: 16 }}>Meta Params Fields</h3>
      <Table
        size="small"
        dataSource={metaPathsData}
        columns={metaColumns}
        pagination={false}
        scroll={{ y: 200 }}
      />
    </div>
  );
};

export default ScriptEditorFields;


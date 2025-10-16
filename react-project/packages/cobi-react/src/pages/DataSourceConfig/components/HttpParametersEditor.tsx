import React from 'react';
import { Button, Table, Input, Select, Switch, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { HttpParameterDto } from '../../../types';

const { Option } = Select;
const { confirm } = Modal;

interface HttpParametersEditorProps {
  parameters: HttpParameterDto[];
  onChange: (parameters: HttpParameterDto[]) => void;
}

const HttpParametersEditor: React.FC<HttpParametersEditorProps> = ({ parameters, onChange }) => {
  const handleAdd = () => {
    const newParameter: HttpParameterDto = {
      type: 'REQUEST_PARAM',
      name: '',
      required: false,
      defaultValue: '',
      secure: false,
      excludeFromCacheKey: false,
    };
    onChange([...parameters, newParameter]);
  };

  const handleDelete = (index: number) => {
    confirm({
      title: 'Delete Parameter',
      content: 'Are you sure you want to delete this parameter?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const newParameters = [...parameters];
        newParameters.splice(index, 1);
        onChange(newParameters);
      },
    });
  };

  const handleChange = (index: number, field: keyof HttpParameterDto, value: any) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    onChange(newParameters);
  };

  const columns: ColumnsType<HttpParameterDto> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (type: string, _record, index) => (
        <Select
          value={type}
          onChange={(value) => handleChange(index, 'type', value)}
          style={{ width: '100%' }}
        >
          <Option value="REQUEST_PARAM">Request Param</Option>
          <Option value="PATH_VARIABLE">Path Variable</Option>
          <Option value="HEADER_PARAM">Header Param</Option>
          <Option value="REQUEST_BODY_VARIABLE">Body Variable</Option>
          <Option value="TEMPLATE_VARIABLE">Template Variable</Option>
        </Select>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, _record, index) => (
        <Input
          value={name}
          onChange={(e) => handleChange(index, 'name', e.target.value)}
          placeholder="Parameter name"
        />
      ),
    },
    {
      title: 'Default Value',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 150,
      render: (defaultValue: string, _record, index) => (
        <Input
          value={defaultValue}
          onChange={(e) => handleChange(index, 'defaultValue', e.target.value)}
          placeholder="Default value"
        />
      ),
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (required: boolean, _record, index) => (
        <Switch
          checked={required}
          onChange={(checked) => handleChange(index, 'required', checked)}
        />
      ),
    },
    {
      title: 'Secure',
      dataIndex: 'secure',
      key: 'secure',
      width: 80,
      render: (secure: boolean, _record, index) => (
        <Switch
          checked={secure}
          onChange={(checked) => handleChange(index, 'secure', checked)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_text, _record, index) => (
        <Button
          type="default"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(index)}
        />
      ),
    },
  ];

  return (
    <div className="http-parameters-editor">
      <div style={{ marginBottom: 8 }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block
        >
          Add Parameter
        </Button>
      </div>
      <Table
        dataSource={parameters}
        columns={columns}
        pagination={false}
        size="small"
        rowKey={(_, index) => `param-${index}`}
        locale={{ emptyText: 'No parameters configured' }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default HttpParametersEditor;


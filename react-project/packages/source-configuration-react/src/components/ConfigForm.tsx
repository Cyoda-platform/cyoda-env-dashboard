/**
 * Configuration Form Component
 * Handles creating and editing CSV, XML, and JDBC configurations
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tabs,
  Table,
  message,
  Upload,
} from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useSaveConfig,
  useSaveJdbcConfig,
  useMappersList,
  useAliases,
  useUploadSample,
  useTestJdbcConnection,
} from '../hooks/useSourceConfig';
import { useSourceConfigStore } from '../stores/sourceConfigStore';
import type {
  CsvUploadConfig,
  XmlUploadConfig,
  JdbcSourceConfig,
  FileType,
  CsvColumnMapping,
  XmlColumnMapping,
  JdbcColumnMapping,
} from '../types';
import { validateConfig } from '../utils/helpers';
import './ConfigForm.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

const ConfigForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileType, setFileType] = useState<FileType>('CSV');
  const [columnMappings, setColumnMappings] = useState<any[]>([]);
  const [sampleData, setSampleData] = useState<any>(null);

  const isOpen = useSourceConfigStore((state) => state.isCreateDialogOpen);
  const setIsOpen = useSourceConfigStore((state) => state.setCreateDialogOpen);
  const editingConfig = useSourceConfigStore((state) => state.editingConfig);

  const { mutate: saveConfig, isPending: isSaving } = useSaveConfig();
  const { mutate: saveJdbcConfig, isPending: isSavingJdbc } = useSaveJdbcConfig();
  const { mutate: uploadSample, isPending: isUploading } = useUploadSample();
  const { mutate: testConnection, isPending: isTesting } = useTestJdbcConnection();
  const { data: mappers } = useMappersList();
  const { data: aliases } = useAliases();

  // Initialize form when editing
  useEffect(() => {
    if (editingConfig) {
      form.setFieldsValue({
        name: editingConfig.name,
        xmlBaseXPath: 'xmlBaseXPath' in editingConfig ? editingConfig.xmlBaseXPath : '',
        srcSql: 'srcSql' in editingConfig ? editingConfig.srcSql : '',
      });
      setColumnMappings(editingConfig.columnMappingConfigs || []);
      
      if ('fileType' in editingConfig) {
        setFileType(editingConfig.fileType);
      } else if ('srcSql' in editingConfig) {
        setFileType('JDBC');
      }
    } else {
      form.resetFields();
      setColumnMappings([]);
      setSampleData(null);
    }
  }, [editingConfig, form]);

  const handleClose = () => {
    setIsOpen(false);
    form.resetFields();
    setColumnMappings([]);
    setSampleData(null);
  };

  const handleFileUpload = (file: File) => {
    uploadSample(file, {
      onSuccess: (data) => {
        setSampleData(data);
        // Auto-populate column mappings from sample data
        if (data.columnNames) {
          const newMappings = data.columnNames.map((name: string) => ({
            csvColumnName: name,
            dstAliasName: '',
            mapperClass: '',
            mapperFormatParam: '',
          }));
          setColumnMappings(newMappings);
        }
      },
    });
    return false; // Prevent default upload behavior
  };

  const handleTestConnection = () => {
    form.validateFields(['jdbcUrl', 'username', 'password', 'driverClassName']).then((values) => {
      testConnection({
        jdbcUrl: values.jdbcUrl,
        username: values.username,
        password: values.password,
        driverClassName: values.driverClassName,
      });
    });
  };

  const handleAddColumn = () => {
    const newMapping: any = {};
    if (fileType === 'CSV') {
      newMapping.csvColumnName = '';
    } else if (fileType === 'XML') {
      newMapping.xmlColumnName = '';
      newMapping.xmlColumnXPath = '';
    } else {
      newMapping.srcColumnName = '';
      newMapping.srcColumnType = '';
    }
    newMapping.dstAliasName = '';
    newMapping.mapperClass = '';
    newMapping.mapperFormatParam = '';
    setColumnMappings([...columnMappings, newMapping]);
  };

  const handleDeleteColumn = (index: number) => {
    const newMappings = columnMappings.filter((_, i) => i !== index);
    setColumnMappings(newMappings);
  };

  const handleColumnChange = (index: number, field: string, value: any) => {
    const newMappings = [...columnMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setColumnMappings(newMappings);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      let config: any = {
        id: editingConfig?.id,
        name: values.name,
        columnMappingConfigs: columnMappings,
      };

      if (fileType === 'CSV') {
        config.fileType = 'CSV';
      } else if (fileType === 'XML') {
        config.fileType = 'XML';
        config.xmlBaseXPath = values.xmlBaseXPath;
      } else {
        config.srcSql = values.srcSql;
        config.jdbcUrl = values.jdbcUrl;
        config.username = values.username;
        config.password = values.password;
        config.driverClassName = values.driverClassName;
      }

      // Validate configuration
      const validation = validateConfig(config);
      if (!validation.valid) {
        validation.errors.forEach((error) => message.error(error));
        return;
      }

      // Save configuration
      if (fileType === 'JDBC') {
        saveJdbcConfig(config, {
          onSuccess: () => {
            handleClose();
          },
        });
      } else {
        saveConfig(config, {
          onSuccess: () => {
            handleClose();
          },
        });
      }
    });
  };

  // Column mapping table columns
  const getColumns = (): ColumnsType<any> => {
    const columns: ColumnsType<any> = [];

    if (fileType === 'CSV') {
      columns.push({
        title: 'CSV Column Name',
        dataIndex: 'csvColumnName',
        key: 'csvColumnName',
        render: (text, record, index) => (
          <Input
            value={text}
            onChange={(e) => handleColumnChange(index, 'csvColumnName', e.target.value)}
            placeholder="Column name"
          />
        ),
      });
    } else if (fileType === 'XML') {
      columns.push(
        {
          title: 'XML Column Name',
          dataIndex: 'xmlColumnName',
          key: 'xmlColumnName',
          render: (text, record, index) => (
            <Input
              value={text}
              onChange={(e) => handleColumnChange(index, 'xmlColumnName', e.target.value)}
              placeholder="Column name"
            />
          ),
        },
        {
          title: 'XPath',
          dataIndex: 'xmlColumnXPath',
          key: 'xmlColumnXPath',
          render: (text, record, index) => (
            <Input
              value={text}
              onChange={(e) => handleColumnChange(index, 'xmlColumnXPath', e.target.value)}
              placeholder="/path/to/element"
            />
          ),
        }
      );
    } else {
      columns.push(
        {
          title: 'Column Name',
          dataIndex: 'srcColumnName',
          key: 'srcColumnName',
          render: (text, record, index) => (
            <Input
              value={text}
              onChange={(e) => handleColumnChange(index, 'srcColumnName', e.target.value)}
              placeholder="Column name"
            />
          ),
        },
        {
          title: 'Column Type',
          dataIndex: 'srcColumnType',
          key: 'srcColumnType',
          render: (text, record, index) => (
            <Select
              value={text}
              onChange={(value) => handleColumnChange(index, 'srcColumnType', value)}
              placeholder="Select type"
              style={{ width: '100%' }}
            >
              <Select.Option value="VARCHAR">VARCHAR</Select.Option>
              <Select.Option value="INTEGER">INTEGER</Select.Option>
              <Select.Option value="BIGINT">BIGINT</Select.Option>
              <Select.Option value="DECIMAL">DECIMAL</Select.Option>
              <Select.Option value="DATE">DATE</Select.Option>
              <Select.Option value="TIMESTAMP">TIMESTAMP</Select.Option>
              <Select.Option value="BOOLEAN">BOOLEAN</Select.Option>
            </Select>
          ),
        }
      );
    }

    // Common columns
    columns.push(
      {
        title: 'Alias',
        dataIndex: 'dstAliasName',
        key: 'dstAliasName',
        render: (text, record, index) => (
          <Select
            value={text}
            onChange={(value) => handleColumnChange(index, 'dstAliasName', value)}
            placeholder="Select alias"
            style={{ width: '100%' }}
            showSearch
            allowClear
          >
            {aliases?.map((alias) => (
              <Select.Option key={alias.id} value={alias.name}>
                {alias.name}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        title: 'Mapper',
        dataIndex: 'mapperClass',
        key: 'mapperClass',
        render: (text, record, index) => (
          <Select
            value={text}
            onChange={(value) => handleColumnChange(index, 'mapperClass', value)}
            placeholder="Select mapper"
            style={{ width: '100%' }}
            showSearch
            allowClear
          >
            {mappers?.map((mapper) => (
              <Select.Option key={mapper.className} value={mapper.className}>
                {mapper.displayName}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        title: 'Parameters',
        dataIndex: 'mapperFormatParam',
        key: 'mapperFormatParam',
        render: (text, record, index) => (
          <Input
            value={text}
            onChange={(e) => handleColumnChange(index, 'mapperFormatParam', e.target.value)}
            placeholder="Mapper parameters"
          />
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 80,
        render: (_, record, index) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteColumn(index)}
          />
        ),
      }
    );

    return columns;
  };

  return (
    <Modal
      title={editingConfig ? 'Edit Configuration' : 'Create Configuration'}
      open={isOpen}
      onCancel={handleClose}
      onOk={handleSubmit}
      width={1000}
      confirmLoading={isSaving || isSavingJdbc}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Configuration Name"
          rules={[{ required: true, message: 'Please enter configuration name' }]}
        >
          <Input placeholder="Enter configuration name" />
        </Form.Item>

        {!editingConfig && (
          <Form.Item label="File Type">
            <Select value={fileType} onChange={setFileType}>
              <Select.Option value="CSV">CSV</Select.Option>
              <Select.Option value="XML">XML</Select.Option>
              <Select.Option value="JDBC">JDBC</Select.Option>
            </Select>
          </Form.Item>
        )}

        {fileType === 'CSV' && (
          <Form.Item label="Upload Sample File">
            <Upload beforeUpload={handleFileUpload} accept=".csv" maxCount={1}>
              <Button icon={<UploadOutlined />} loading={isUploading}>
                Upload CSV Sample
              </Button>
            </Upload>
          </Form.Item>
        )}

        {fileType === 'XML' && (
          <Form.Item
            name="xmlBaseXPath"
            label="Base XPath"
            rules={[{ required: true, message: 'Please enter base XPath' }]}
          >
            <Input placeholder="/root/element" />
          </Form.Item>
        )}

        {fileType === 'JDBC' && (
          <>
            <Form.Item
              name="srcSql"
              label="SQL Query"
              rules={[{ required: true, message: 'Please enter SQL query' }]}
            >
              <TextArea rows={4} placeholder="SELECT * FROM table" />
            </Form.Item>
            <Form.Item
              name="jdbcUrl"
              label="JDBC URL"
              rules={[{ required: true, message: 'Please enter JDBC URL' }]}
            >
              <Input placeholder="jdbc:mysql://localhost:3306/database" />
            </Form.Item>
            <Form.Item name="username" label="Username">
              <Input placeholder="Database username" />
            </Form.Item>
            <Form.Item name="password" label="Password">
              <Input.Password placeholder="Database password" />
            </Form.Item>
            <Form.Item name="driverClassName" label="Driver Class">
              <Input placeholder="com.mysql.cj.jdbc.Driver" />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleTestConnection} loading={isTesting}>
                Test Connection
              </Button>
            </Form.Item>
          </>
        )}

        <div className="column-mappings-section">
          <div className="section-header">
            <h3>Column Mappings</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddColumn}>
              Add Column
            </Button>
          </div>
          <Table
            columns={getColumns()}
            dataSource={columnMappings}
            rowKey={(_, index) => `col-${index}`}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default ConfigForm;


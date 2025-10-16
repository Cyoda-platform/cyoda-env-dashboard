import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Tabs } from 'antd';
import HeadersEditor from '../components/HeadersEditor';

const { Option } = Select;

interface ConnectionDialogProps {
  visible: boolean;
  connection: any;
  onSave: (connection: any) => void;
  onCancel: () => void;
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  visible,
  connection,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [connectionType, setConnectionType] = useState<string>('Http');
  const [headers, setHeaders] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      if (connection) {
        // Editing existing connection
        const bean = connection['@bean'] || '';
        if (bean.includes('Http')) {
          setConnectionType('Http');
          setHeaders(connection.headers || {});
          form.setFieldsValue({
            name: connection.name,
            baseUrl: connection.baseUrl,
            authType: connection.authType,
            proxyConfigurationKey: connection.proxyConfigurationKey,
          });
        } else if (bean.includes('Sql')) {
          setConnectionType('Sql');
          form.setFieldsValue({
            name: connection.name,
            jdbcUrl: connection.jdbcUrl,
            username: connection.username,
            password: connection.password,
            driverClassName: connection.driverClassName,
          });
        } else if (bean.includes('Workflow')) {
          setConnectionType('Workflow');
          form.setFieldsValue({
            name: connection.name,
            entityClass: connection.entityClass,
          });
        }
      } else {
        // New connection
        form.resetFields();
        setConnectionType('Http');
        setHeaders({});
      }
    }
  }, [visible, connection, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      let connectionData: any;

      if (connectionType === 'Http') {
        connectionData = {
          '@bean': 'com.cyoda.plugins.datasource.dtos.connection.HttpConnectionDetailsDto',
          name: values.name,
          baseUrl: values.baseUrl,
          authType: values.authType || 'NONE',
          headers: headers,
          proxyConfigurationKey: values.proxyConfigurationKey || null,
          authConfig: {
            name: '',
            authOperationConfigs: [],
            numOfRetries: 1,
            cacheConfig: {
              ttl: 0,
              persistCache: false,
            },
          },
        };
      } else if (connectionType === 'Sql') {
        connectionData = {
          '@bean': 'com.cyoda.plugins.datasource.dtos.connection.SqlConnectionDetailsDto',
          name: values.name,
          jdbcUrl: values.jdbcUrl,
          username: values.username,
          password: values.password,
          driverClassName: values.driverClassName,
          connectionProperties: {},
        };
      } else if (connectionType === 'Workflow') {
        connectionData = {
          '@bean': 'com.cyoda.plugins.datasource.dtos.connection.WorkflowSourceConnectionDetailsDto',
          name: values.name,
          entityClass: values.entityClass,
        };
      }

      onSave(connectionData);
      form.resetFields();
      setHeaders({});
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setHeaders({});
    onCancel();
  };

  const handleTypeChange = (type: string) => {
    setConnectionType(type);
    form.resetFields();
    setHeaders({});
  };

  const httpTabItems = [
    {
      key: 'default',
      label: 'Default',
      children: (
        <>
          <Form.Item
            name="baseUrl"
            label="Base URL"
            rules={[{ required: true, message: 'Please enter base URL' }]}
          >
            <Input placeholder="https://api.example.com" />
          </Form.Item>

          <Form.Item name="proxyConfigurationKey" label="Proxy Configuration">
            <Input placeholder="Proxy configuration key (optional)" />
          </Form.Item>

          <Form.Item name="authType" label="Auth Type">
            <Select placeholder="Select authentication type">
              <Option value="NONE">None</Option>
              <Option value="BASIC">Basic</Option>
              <Option value="BEARER">Bearer</Option>
              <Option value="API_KEY">API Key</Option>
              <Option value="OAUTH2">OAuth 2.0</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Headers">
            <HeadersEditor headers={headers} onChange={setHeaders} />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={connection ? 'Edit Connection' : 'Add Connection'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {!connection && (
          <Form.Item label="Connection Type">
            <Select value={connectionType} onChange={handleTypeChange}>
              <Option value="Http">HTTP</Option>
              <Option value="Sql">SQL</Option>
              <Option value="Workflow">Workflow</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter connection name' }]}
        >
          <Input placeholder="Enter connection name" />
        </Form.Item>

        {connectionType === 'Http' && (
          <Tabs items={httpTabItems} />
        )}

        {connectionType === 'Sql' && (
          <>
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
            <Form.Item name="driverClassName" label="Driver Class Name">
              <Input placeholder="com.mysql.cj.jdbc.Driver" />
            </Form.Item>
          </>
        )}

        {connectionType === 'Workflow' && (
          <Form.Item
            name="entityClass"
            label="Entity Class"
            rules={[{ required: true, message: 'Please enter entity class' }]}
          >
            <Input placeholder="com.example.Entity" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ConnectionDialog;


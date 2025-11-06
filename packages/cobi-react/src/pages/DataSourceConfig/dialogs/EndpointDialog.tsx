import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Tabs, InputNumber, Switch } from 'antd';
import HttpParametersEditor from '../components/HttpParametersEditor';
import ChainingsSelector from '../components/ChainingsSelector';
import type { HttpParameterDto } from '../../../types';

const { Option } = Select;
const { TextArea } = Input;

interface EndpointDialogProps {
  visible: boolean;
  endpoint: any;
  connections: any[];
  onSave: (endpoint: any) => void;
  onCancel: () => void;
}

const EndpointDialog: React.FC<EndpointDialogProps> = ({
  visible,
  endpoint,
  connections,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [endpointType, setEndpointType] = useState<string>('Http');
  const [parameters, setParameters] = useState<HttpParameterDto[]>([]);
  const [chainings, setChainings] = useState<string[]>([]);

  // Determine endpoint type based on connections
  useEffect(() => {
    if (visible && connections.length > 0) {
      const firstConnection = connections[0];
      const bean = firstConnection['@bean'] || '';
      if (bean.includes('Http')) {
        setEndpointType('Http');
      } else if (bean.includes('Sql')) {
        setEndpointType('Sql');
      } else if (bean.includes('Workflow')) {
        setEndpointType('Workflow');
      }
    }
  }, [visible, connections]);

  useEffect(() => {
    if (visible) {
      if (endpoint) {
        // Editing existing endpoint
        setParameters(endpoint.parameters || []);
        setChainings(endpoint.chainings || []);
        form.setFieldsValue({
          operation: endpoint.operation,
          query: endpoint.query,
          method: endpoint.method,
          type: endpoint.type,
          bodyTemplate: endpoint.bodyTemplate,
          connectionTimeout: endpoint.connectionTimeout,
          readWriteTimeout: endpoint.readWriteTimeout,
          cacheTtl: endpoint.cache?.ttl || 0,
          cachePersist: endpoint.cache?.persistCache || false,
        });
      } else {
        // New endpoint
        form.resetFields();
        setParameters([]);
        setChainings([]);
      }
    }
  }, [visible, endpoint, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      let endpointData: any;

      if (endpointType === 'Http') {
        endpointData = {
          '@bean': 'com.cyoda.plugins.datasource.dtos.endpoint.HttpEndpointDto',
          operation: values.operation,
          query: values.query || '',
          method: values.method || 'GET',
          type: values.type || '',
          bodyTemplate: values.bodyTemplate || '',
          parameters: parameters,
          chainings: chainings,
          connectionTimeout: values.connectionTimeout || null,
          readWriteTimeout: values.readWriteTimeout || null,
          cache: {
            ttl: values.cacheTtl || 0,
            persistCache: values.cachePersist || false,
          },
        };
      } else if (endpointType === 'Sql') {
        endpointData = {
          '@bean': 'com.cyoda.plugins.datasource.dtos.endpoint.SqlEndpointDto',
          operation: values.operation,
          query: values.query || '',
          parameters: [],
          chainings: chainings,
        };
      } else if (endpointType === 'Workflow') {
        endpointData = {
          '@bean': 'com.cyoda.plugins.datasource.dtos.endpoint.WorkflowEndpointDto',
          operation: values.operation,
          query: values.query || '',
        };
      }

      onSave(endpointData);
      form.resetFields();
      setParameters([]);
      setChainings([]);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setParameters([]);
    setChainings([]);
    onCancel();
  };

  const httpTabItems = [
    {
      key: 'default',
      label: 'Default',
      children: (
        <>
          <Form.Item name="type" label="Path / Type">
            <Input placeholder="/api/users" />
          </Form.Item>
          <Form.Item name="method" label="HTTP Method">
            <Select placeholder="Select HTTP method">
              <Option value="GET">GET</Option>
              <Option value="POST_BODY">POST (Body)</Option>
              <Option value="POST_FORM">POST (Form)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="query"
            label="Query"
          >
            <TextArea
              rows={3}
              placeholder="Optional query parameters"
            />
          </Form.Item>
          <Form.Item name="bodyTemplate" label="Body Template">
            <TextArea
              rows={4}
              placeholder="Request body template (for POST methods)"
            />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'parameters',
      label: 'Parameters',
      children: (
        <HttpParametersEditor parameters={parameters} onChange={setParameters} />
      ),
    },
    {
      key: 'advanced',
      label: 'Advanced',
      children: (
        <>
          <Form.Item name="connectionTimeout" label="Connection Timeout (ms)">
            <InputNumber min={0} placeholder="300" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="readWriteTimeout" label="Read/Write Timeout (ms)">
            <InputNumber min={0} placeholder="300" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Cache Settings">
            <Form.Item name="cacheTtl" label="TTL (seconds)" style={{ marginBottom: 8 }}>
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="cachePersist" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch /> Persist Cache
            </Form.Item>
          </Form.Item>
          <Form.Item label="Chainings">
            <ChainingsSelector value={chainings} onChange={setChainings} />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={endpoint ? 'Edit Endpoint' : 'Add Endpoint'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="operation"
          label="Operation"
          rules={[{ required: true, message: 'Please enter operation name' }]}
        >
          <Input placeholder="e.g., getUsers, createOrder" />
        </Form.Item>

        {endpointType === 'Http' && (
          <Tabs items={httpTabItems} />
        )}

        {endpointType === 'Sql' && (
          <>
            <Form.Item
              name="query"
              label="SQL Query"
              rules={[{ required: true, message: 'Please enter SQL query' }]}
            >
              <TextArea
                rows={6}
                placeholder="SELECT * FROM users WHERE id = ?"
              />
            </Form.Item>
            <Form.Item label="Chainings">
              <ChainingsSelector value={chainings} onChange={setChainings} />
            </Form.Item>
          </>
        )}

        {endpointType === 'Workflow' && (
          <Form.Item
            name="query"
            label="Query"
          >
            <TextArea
              rows={4}
              placeholder="Optional query configuration"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EndpointDialog;


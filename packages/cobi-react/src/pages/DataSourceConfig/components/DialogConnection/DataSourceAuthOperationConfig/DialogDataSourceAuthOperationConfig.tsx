import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Modal, Form, Select, Input, InputNumber, Tabs, Alert, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { authServiceConfigs, authRespParserConfigs } from '../../../../../api/dataSourceConfigApi';
import DataSourceAuthOperationConfigEditor from './DataSourceAuthOperationConfigEditor';
import './DialogDataSourceAuthOperationConfig.css';

interface DataSourceAuthOperationConfigDto {
  authService: string;
  authServiceName: string;
  baseUrl: string;
  query: string;
  method: string;
  bodyTemplate: string;
  headers: any;
  parameters: any[];
  dataSourceAuthRespConfig: {
    '@bean': string;
    responseParser: string;
    responseParserName: string;
    responseParamToPathMap: any;
  };
  connectionTimeout: number;
  readWriteTimeout: number;
  proxyConfigurationKey: string;
}

interface DialogDataSourceAuthOperationConfigProps {
  connectionDetailsDto: any;
}

export interface DialogDataSourceAuthOperationConfigRef {
  openDialogAndCreateNew: () => void;
  openDialogAndEditRecord: (data: DataSourceAuthOperationConfigDto) => void;
}

const defaultForm: DataSourceAuthOperationConfigDto = {
  authService: '',
  authServiceName: '',
  baseUrl: '',
  query: '',
  method: 'GET',
  bodyTemplate: '',
  headers: {},
  parameters: [],
  dataSourceAuthRespConfig: {
    '@bean': 'com.cyoda.plugins.datasource.dtos.connection.auth.resp.DataSourceAuthRespConfigDto',
    responseParser: '',
    responseParserName: '',
    responseParamToPathMap: {},
  },
  connectionTimeout: 300,
  readWriteTimeout: 300,
  proxyConfigurationKey: '',
};

const methodOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'POST_BODY', label: 'POST_BODY' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
];

const DialogDataSourceAuthOperationConfig = forwardRef<
  DialogDataSourceAuthOperationConfigRef,
  DialogDataSourceAuthOperationConfigProps
>((props, ref) => {
  const { connectionDetailsDto } = props;
  const [form] = Form.useForm();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState<DataSourceAuthOperationConfigDto>(defaultForm);
  const [editingConfig, setEditingConfig] = useState<DataSourceAuthOperationConfigDto | null>(null);
  const [activeTab, setActiveTab] = useState('0');
  const [allErrorMessages, setAllErrorMessages] = useState<string[]>([]);

  // Fetch auth service configs
  const { data: authServiceConfigsData = [] } = useQuery({
    queryKey: ['authServiceConfigs'],
    queryFn: async () => {
      const response = await authServiceConfigs();
      return response.data || [];
    },
  });

  // Fetch auth response parser configs
  const { data: responseParserData = [] } = useQuery({
    queryKey: ['authRespParserConfigs'],
    queryFn: async () => {
      const response = await authRespParserConfigs();
      return response.data || [];
    },
  });

  const authServiceNameOptions = authServiceConfigsData.map((el: any) => ({
    value: el.authServiceName,
    label: el.authServiceName,
  }));

  const responseParserOptions = responseParserData.map((el: any) => ({
    value: el.responseParserName,
    label: el.responseParserName,
  }));

  useImperativeHandle(ref, () => ({
    openDialogAndCreateNew: () => {
      setEditingConfig(null);
      setFormData(JSON.parse(JSON.stringify(defaultForm)));
      form.setFieldsValue(defaultForm);
      setActiveTab('0');
      setAllErrorMessages([]);
      setDialogVisible(true);
    },
    openDialogAndEditRecord: (data: DataSourceAuthOperationConfigDto) => {
      setEditingConfig(data);
      setFormData(JSON.parse(JSON.stringify(data)));
      form.setFieldsValue(data);
      setActiveTab('0');
      setAllErrorMessages([]);
      setDialogVisible(true);
    },
  }));

  const onChangeAuthServiceName = (val: string) => {
    const selected = authServiceConfigsData.find((el: any) => el.authServiceName === val);

    if (selected) {
      const blackList = ['authServiceName', 'authService', 'dataSourceAuthRespConfig'];
      const updated: any = { ...formData, authService: selected.authService, authServiceName: val };

      for (const key of Object.keys(selected)) {
        if (blackList.includes(key)) continue;
        if (key === 'parameters' && !selected[key]) {
          updated[key] = [];
        } else {
          updated[key] = selected[key];
        }
      }

      setFormData(updated);
      form.setFieldsValue(updated);
    }
  };

  const onChangeResponseParserName = (val: string) => {
    const selected = responseParserData.find((el: any) => el.responseParserName === val);

    if (selected) {
      const blackList = ['responseParserName', 'responseParser'];
      const updatedRespConfig: any = {
        ...formData.dataSourceAuthRespConfig,
        responseParser: selected.responseParser,
        responseParserName: val,
      };

      for (const key of Object.keys(selected)) {
        if (blackList.includes(key)) continue;
        const data = typeof selected[key] === 'object' ? JSON.parse(JSON.stringify(selected[key])) : selected[key];
        updatedRespConfig[key] = data;
      }

      const updated = {
        ...formData,
        dataSourceAuthRespConfig: updatedRespConfig,
      };

      setFormData(updated);
      form.setFieldsValue(updated);
    }
  };

  const onClearAuthServiceName = () => {
    const updated = { ...formData, authService: '', authServiceName: '' };
    setFormData(updated);
    form.setFieldsValue(updated);
  };

  const onClearResponseParserName = () => {
    const updated = {
      ...formData,
      dataSourceAuthRespConfig: {
        ...formData.dataSourceAuthRespConfig,
        responseParamToPathMap: {},
        responseParser: '',
        responseParserName: '',
      },
    };
    setFormData(updated);
    form.setFieldsValue(updated);
  };

  const onChangeMethod = (val: string) => {
    const updated = { ...formData, method: val, bodyTemplate: '' };
    setFormData(updated);
    form.setFieldsValue(updated);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setAllErrorMessages([]);

      const finalData = { ...formData, ...values };

      if (editingConfig) {
        // Edit existing
        const authOperationConfigs = connectionDetailsDto.authConfig.authOperationConfigs;
        const index = authOperationConfigs.indexOf(editingConfig);
        if (index > -1) {
          authOperationConfigs[index] = finalData;
        }
      } else {
        // Add new
        if (!connectionDetailsDto.authConfig) {
          connectionDetailsDto.authConfig = { authOperationConfigs: [] };
        }
        if (!connectionDetailsDto.authConfig.authOperationConfigs) {
          connectionDetailsDto.authConfig.authOperationConfigs = [];
        }
        connectionDetailsDto.authConfig.authOperationConfigs.push(finalData);
      }

      setDialogVisible(false);
    } catch (errorInfo: any) {
      const errors: string[] = [];
      if (errorInfo.errorFields) {
        errorInfo.errorFields.forEach((field: any) => {
          field.errors.forEach((error: string) => {
            errors.push(error);
          });
        });
      }
      setAllErrorMessages(errors);
    }
  };

  const isNeedBodyTemplate = formData.method === 'POST_BODY';

  const tabItems = [
    {
      key: '0',
      label: 'Default',
      children: (
        <div>
          <Form.Item
            label="Auth Service Name"
            name="authServiceName"
            rules={[{ required: true, message: 'Please select Auth Service Name' }]}
          >
            <Select
              placeholder="Select"
              allowClear
              onClear={onClearAuthServiceName}
              onChange={onChangeAuthServiceName}
              options={authServiceNameOptions}
            />
          </Form.Item>

          <Form.Item label="Base Url" name="baseUrl" rules={[{ required: true, message: 'Please input Base Url' }]}>
            <Input placeholder="https://some_url.com/api" />
            <span className="hint">Example: https://some_url.com/api</span>
          </Form.Item>

          <Form.Item label="Query Path" name="query">
            <Input placeholder="/get-companies" />
            <span className="hint">
              Example: /get-companies. Support placeholders: ${'{'}name{'}'} <strong>Full path:</strong>{' '}
              {formData.baseUrl + formData.query}
            </span>
          </Form.Item>

          <Form.Item label="Method" name="method">
            <Select placeholder="Select" allowClear onChange={onChangeMethod} options={methodOptions} />
          </Form.Item>

          <Form.Item label="Connection Timeout" name="connectionTimeout">
            <InputNumber min={0} style={{ width: '100%' }} />
            <span className="hint">Seconds</span>
          </Form.Item>

          <Form.Item label="Read Write Timeout" name="readWriteTimeout">
            <InputNumber min={0} style={{ width: '100%' }} />
            <span className="hint">Seconds</span>
          </Form.Item>

          {isNeedBodyTemplate && (
            <Form.Item label="Body Template" name="bodyTemplate">
              <Input.TextArea rows={4} placeholder="Enter body template" />
            </Form.Item>
          )}
        </div>
      ),
    },
    {
      key: '1',
      label: 'Data Source Authorization Response Config',
      children: (
        <div>
          <Form.Item
            label="Response Parser Name"
            name={['dataSourceAuthRespConfig', 'responseParserName']}
            rules={[{ required: true, message: 'Please select Response Parser Name' }]}
          >
            <Select
              placeholder="Select"
              allowClear
              onClear={onClearResponseParserName}
              onChange={onChangeResponseParserName}
              options={responseParserOptions}
            />
          </Form.Item>

          {Object.keys(formData.dataSourceAuthRespConfig.responseParamToPathMap).length > 0 && activeTab === '1' && (
            <DataSourceAuthOperationConfigEditor
              dataSourceAuthRespConfig={formData.dataSourceAuthRespConfig}
              onChange={(config) => {
                const updated = { ...formData, dataSourceAuthRespConfig: config };
                setFormData(updated);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="Auth steps"
      open={dialogVisible}
      onCancel={() => setDialogVisible(false)}
      onOk={handleOk}
      okText={editingConfig ? 'Apply' : 'Apply'}
      width="80%"
      destroyOnClose
    >
      {allErrorMessages.length > 0 && (
        <Alert
          message="Errors"
          description={
            <ol style={{ padding: 0, paddingLeft: 10 }}>
              {allErrorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ol>
          }
          type="error"
          closable={false}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="horizontal" labelCol={{ span: 6 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Form>
    </Modal>
  );
});

DialogDataSourceAuthOperationConfig.displayName = 'DialogDataSourceAuthOperationConfig';

export default DialogDataSourceAuthOperationConfig;


import React, { useState, useEffect } from 'react';
import { Form, Tabs, Button, Alert, Spin, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getById, postSave } from '../../api/chainingConfigApi';
import { getListAll as getDataSourceConfigs } from '../../api/dataSourceConfigApi';
import { getListAllDataMappings } from '../../api/dataMappingApi';
import type { ChainingConfigDto, DataSourceConfigDto, MappingConfigDto } from '../../types';
import DefaultSettings from './steps/DefaultSettings';
import DataSource from './steps/DataSource';
import RelativePaths from './steps/RelativePaths';
import Parameters from './steps/Parameters';
import './DataChainingEdit.css';

const DataChainingEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('defaultSettings');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [chainingConfig, setChainingConfig] = useState<ChainingConfigDto>({
    '@bean': 'com.cyoda.plugins.datasource.dtos.chaining.ChainingConfigDto',
    id: null,
    datasourceId: '',
    name: '',
    description: '',
    nextOperation: '',
    rootRelativePaths: {},
    parameters: [],
  });

  // Fetch existing configuration if editing
  const { isLoading: isLoadingConfig } = useQuery({
    queryKey: ['chainingConfig', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getById(id);
      return response.data;
    },
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        setChainingConfig(data);
        form.setFieldsValue(data);
      }
    },
  });

  // Fetch data source configurations
  const { data: dataSourceConfigList = [] } = useQuery({
    queryKey: ['dataSourceConfigs'],
    queryFn: async () => {
      const response = await getDataSourceConfigs();
      return response.data || [];
    },
  });

  // Fetch data mappings
  const { data: dataMappingList = [] } = useQuery({
    queryKey: ['dataMappings'],
    queryFn: async () => {
      const response = await getListAllDataMappings();
      return response.data || [];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: postSave,
    onSuccess: (response) => {
      if (response.data.success) {
        message.success('Configuration saved successfully');
        queryClient.invalidateQueries({ queryKey: ['chainingConfigs'] });
        navigate('/data-chaining');
      } else {
        message.error('Failed to save configuration');
      }
    },
    onError: () => {
      message.error('Failed to save configuration');
    },
  });

  const handleSave = async () => {
    try {
      await form.validateFields();
      setErrorMessages([]);

      const dataToSave = { ...chainingConfig };
      delete (dataToSave as any).virtual;

      saveMutation.mutate(dataToSave);
    } catch (error: any) {
      const errors: string[] = [];
      if (error.errorFields) {
        error.errorFields.forEach((field: any) => {
          field.errors.forEach((err: string) => {
            errors.push(err);
          });
        });
      }
      setErrorMessages(errors);
    }
  };

  const handleConfigChange = (newConfig: ChainingConfigDto) => {
    setChainingConfig(newConfig);
    form.setFieldsValue(newConfig);
  };

  const title = id
    ? `Chaining Edit: ${chainingConfig.name || ''}`
    : 'Chaining';

  if (isLoadingConfig) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="data-chaining-edit">
      {errorMessages.length > 0 && (
        <Alert
          message="Errors"
          description={
            <ol>
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ol>
          }
          type="error"
          closable
          onClose={() => setErrorMessages([])}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Default Settings" key="defaultSettings">
            <DefaultSettings chainingConfig={chainingConfig} onChange={handleConfigChange} />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Data Source" key="dataSource">
            <DataSource
              chainingConfig={chainingConfig}
              dataSourceConfigList={dataSourceConfigList}
              onChange={handleConfigChange}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Relative Paths" key="relativePaths">
            <RelativePaths
              chainingConfig={chainingConfig}
              dataMappingList={dataMappingList}
              onChange={handleConfigChange}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Parameters" key="parameters">
            <Parameters
              chainingConfig={chainingConfig}
              dataSourceConfigList={dataSourceConfigList}
              dataMappingList={dataMappingList}
              onChange={handleConfigChange}
            />
          </Tabs.TabPane>
        </Tabs>
      </Form>

      <div className="actions">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saveMutation.isPending}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default DataChainingEdit;


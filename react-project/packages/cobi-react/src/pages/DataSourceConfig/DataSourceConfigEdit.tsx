import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Button, Space, Alert, message, Modal } from 'antd';
import { SaveOutlined, CloseOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDataSourceConfig, useSaveDataSourceConfig } from '../../hooks/useDataSourceConfig';
import type { DataSourceConfigDto } from '../../types';
import DefaultSettings from './steps/DefaultSettings';
import ConnectionDetails from './steps/ConnectionDetails';
import Endpoints from './steps/Endpoints';
import './DataSourceConfigEdit.css';

const { confirm } = Modal;

const DataSourceConfigEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('defaultSettings');
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize config from location state or create new
  const [config, setConfig] = useState<DataSourceConfigDto>(() => {
    if (location.state?.config) {
      return location.state.config;
    }
    return {
      '@bean': 'com.cyoda.plugins.datasource.dtos.DataSourceConfigDto',
      id: null,
      name: '',
      description: '',
      connections: [],
      endpoints: [],
      active: true,
    };
  });

  // Fetch existing config if editing
  const { data: fetchedConfig, isLoading } = useDataSourceConfig(
    id && !location.state?.config ? id : null
  );

  const saveConfig = useSaveDataSourceConfig();

  // Update config when fetched
  useEffect(() => {
    if (fetchedConfig && !location.state?.config) {
      setConfig(fetchedConfig);
    }
  }, [fetchedConfig, location.state]);

  // Track changes
  const handleConfigChange = useCallback((updates: Partial<DataSourceConfigDto>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  // Validate configuration
  const validateConfig = (): boolean => {
    const errors: string[] = [];

    if (!config.name || config.name.trim() === '') {
      errors.push('Configuration name is required');
    }

    if (config.connections.length === 0) {
      errors.push('At least one connection is required');
    }

    if (config.endpoints.length === 0) {
      errors.push('At least one endpoint is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateConfig()) {
      message.error('Please fix validation errors before saving');
      return;
    }

    try {
      const dataToSave = { ...config };
      delete dataToSave.virtual;

      await saveConfig.mutateAsync(dataToSave);
      message.success('Configuration saved successfully');
      setHasChanges(false);
      navigate('/data-mapper/data-source-config-creation');
    } catch (error) {
      message.error('Failed to save configuration');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to leave?',
        onOk: () => {
          navigate('/data-mapper/data-source-config-creation');
        },
      });
    } else {
      navigate('/data-mapper/data-source-config-creation');
    }
  };

  // Handle history
  const handleHistory = () => {
    message.info('History feature coming soon');
  };

  const isUpdate = !!config.id && !config.virtual?.isVirtual;
  const title = config.id ? `Edit: ${config.name}` : 'Data Source Config Creation';

  const tabItems = [
    {
      key: 'defaultSettings',
      label: 'Default Settings',
      children: (
        <DefaultSettings
          config={config}
          onChange={handleConfigChange}
        />
      ),
    },
    {
      key: 'connections',
      label: 'Connection Details',
      children: (
        <ConnectionDetails
          config={config}
          onChange={handleConfigChange}
        />
      ),
    },
    {
      key: 'endpoints',
      label: 'Endpoints',
      children: (
        <Endpoints
          config={config}
          onChange={handleConfigChange}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="data-source-config-edit">
        <Card loading={true}>Loading configuration...</Card>
      </div>
    );
  }

  return (
    <div className="data-source-config-edit">
      <Card>
        <div className="header-section">
          <h2>{title}{hasChanges ? ' *' : ''}</h2>
          <Space>
            {isUpdate && (
              <Button
                icon={<HistoryOutlined />}
                onClick={handleHistory}
              >
                History
              </Button>
            )}
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saveConfig.isPending}
            >
              {isUpdate ? 'Update' : 'Save'}
            </Button>
          </Space>
        </div>

        {validationErrors.length > 0 && (
          <Alert
            type="error"
            message="Validation Errors"
            description={
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ol>
            }
            closable
            onClose={() => setValidationErrors([])}
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default DataSourceConfigEdit;


import React, { useMemo } from 'react';
import { Form, Select } from 'antd';
import type { ChainingConfigDto, DataSourceConfigDto } from '../../../types';

interface DataSourceProps {
  chainingConfig: ChainingConfigDto;
  dataSourceConfigList: DataSourceConfigDto[];
  onChange: (config: ChainingConfigDto) => void;
}

const DataSource: React.FC<DataSourceProps> = ({
  chainingConfig,
  dataSourceConfigList,
  onChange,
}) => {
  const operationOptions = useMemo(() => {
    const dataSourceConfig = dataSourceConfigList.find(
      (el) => el.id === chainingConfig.datasourceId
    );

    if (!dataSourceConfig || !dataSourceConfig.endpoints) {
      return [];
    }

    return dataSourceConfig.endpoints.map((endpoint: any) => ({
      label: endpoint.operation,
      value: endpoint.operation,
    }));
  }, [dataSourceConfigList, chainingConfig.datasourceId]);

  const handleDatasourceChange = (value: string) => {
    onChange({
      ...chainingConfig,
      datasourceId: value,
      nextOperation: '', // Reset operation when datasource changes
      parameters: [], // Reset parameters when datasource changes
    });
  };

  const handleOperationChange = (value: string) => {
    onChange({
      ...chainingConfig,
      nextOperation: value,
    });
  };

  return (
    <div className="data-chaining-data-source">
      <Form.Item
        label="Datasource"
        name="datasourceId"
        rules={[{ required: true, message: 'Please select Datasource' }]}
      >
        <Select
          value={chainingConfig.datasourceId}
          onChange={handleDatasourceChange}
          placeholder="Select datasource"
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={dataSourceConfigList.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          allowClear
        />
      </Form.Item>

      <Form.Item label="Next Operation" name="nextOperation">
        <Select
          value={chainingConfig.nextOperation}
          onChange={handleOperationChange}
          placeholder="Select operation"
          disabled={!chainingConfig.datasourceId}
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={operationOptions}
        />
      </Form.Item>
    </div>
  );
};

export default DataSource;


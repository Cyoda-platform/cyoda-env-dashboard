import React, { useMemo } from 'react';
import { Button, Select, TreeSelect, Table, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ChainingConfigDto, DataSourceConfigDto, MappingConfigDto } from '../../../types';
import { getSourceData } from '../../../utils/contentHelper';
import { relativePathOptions, transformPathToJs } from '../../../utils/mapperHelper';
import _ from 'lodash';

interface ParametersProps {
  chainingConfig: ChainingConfigDto;
  dataSourceConfigList: DataSourceConfigDto[];
  dataMappingList: MappingConfigDto[];
  onChange: (config: ChainingConfigDto) => void;
}

interface ChainingParameter {
  nextOperationParameterName: string;
  srcRelativePath: string | null;
}

const Parameters: React.FC<ParametersProps> = ({
  chainingConfig,
  dataSourceConfigList,
  dataMappingList,
  onChange,
}) => {
  const nameOptions = useMemo(() => {
    const dataSourceConfig = dataSourceConfigList.find(
      (el) => el.id === chainingConfig.datasourceId
    );
    if (!dataSourceConfig) {
      return [];
    }

    const selectedEndpoint = dataSourceConfig.endpoints?.find(
      (el: any) => el.operation === chainingConfig.nextOperation
    );
    if (!selectedEndpoint || !selectedEndpoint.parameters) {
      return [];
    }

    return selectedEndpoint.parameters.map((param: any) => ({
      label: param.name,
      value: param.name,
    }));
  }, [dataSourceConfigList, chainingConfig.datasourceId, chainingConfig.nextOperation]);

  const optionsForMapping = useMemo(() => {
    const dataSourceConfig = dataSourceConfigList.find(
      (el) => el.id === chainingConfig.datasourceId
    );
    if (!dataSourceConfig) {
      return [];
    }

    const mappingId = Object.keys(chainingConfig.rootRelativePaths || {})[0];
    const dataMapping = dataMappingList.find((el) => el.id === mappingId);
    const rootRelativePath = Object.values(chainingConfig.rootRelativePaths || {})[0];

    if (!dataMapping || !rootRelativePath || !mappingId) {
      return [];
    }

    let sampleContent = getSourceData(dataMapping.sampleContent || '', dataMapping);
    const path = transformPathToJs(rootRelativePath as string);
    if (path) {
      sampleContent = _.get(sampleContent, path);
    }

    if (!sampleContent) {
      return [];
    }

    return [
      {
        title: '/',
        value: '/',
        children: relativePathOptions(sampleContent, '/', [], true),
      },
    ];
  }, [
    dataSourceConfigList,
    dataMappingList,
    chainingConfig.datasourceId,
    chainingConfig.rootRelativePaths,
  ]);

  const handleAddParameter = () => {
    const newParameter: ChainingParameter = {
      nextOperationParameterName: '',
      srcRelativePath: null,
    };

    onChange({
      ...chainingConfig,
      parameters: [...(chainingConfig.parameters || []), newParameter],
    });
  };

  const handleDeleteParameter = (index: number) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove parameter?',
      onOk: () => {
        const newParameters = [...(chainingConfig.parameters || [])];
        newParameters.splice(index, 1);
        onChange({
          ...chainingConfig,
          parameters: newParameters,
        });
      },
    });
  };

  const handleParameterChange = (index: number, field: keyof ChainingParameter, value: any) => {
    const newParameters = [...(chainingConfig.parameters || [])];
    newParameters[index] = {
      ...newParameters[index],
      [field]: value,
    };

    onChange({
      ...chainingConfig,
      parameters: newParameters,
    });
  };

  const columns = [
    {
      title: 'Next Operation Parameter Name',
      dataIndex: 'nextOperationParameterName',
      key: 'name',
      width: '45%',
      render: (value: string, record: ChainingParameter, index: number) => (
        <Select
          value={value || undefined}
          onChange={(val) => handleParameterChange(index, 'nextOperationParameterName', val)}
          placeholder="Select"
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={nameOptions}
          allowClear
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Source Relative Path',
      dataIndex: 'srcRelativePath',
      key: 'path',
      width: '45%',
      render: (value: string | null, record: ChainingParameter, index: number) => (
        <TreeSelect
          value={value || undefined}
          onChange={(val) => handleParameterChange(index, 'srcRelativePath', val)}
          placeholder="Please select"
          treeData={optionsForMapping}
          treeDefaultExpandAll
          showSearch
          treeNodeFilterProp="title"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_: any, record: ChainingParameter, index: number) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteParameter(index)}
        />
      ),
    },
  ];

  return (
    <div className="data-chaining-parameters">
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddParameter}
          disabled={!chainingConfig.nextOperation}
        >
          Add New Parameter
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={chainingConfig.parameters || []}
        rowKey={(record, index) => `param-${index}`}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default Parameters;


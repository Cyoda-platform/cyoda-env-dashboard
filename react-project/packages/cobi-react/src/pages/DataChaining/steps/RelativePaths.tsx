import React, { useState, useEffect, useMemo } from 'react';
import { Button, Select, TreeSelect, Table, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ChainingConfigDto, MappingConfigDto } from '../../../types';
import { getSourceData } from '../../../utils/contentHelper';
import { relativePathOptions } from '../../../utils/mapperHelper';

interface RelativePathsProps {
  chainingConfig: ChainingConfigDto;
  dataMappingList: MappingConfigDto[];
  onChange: (config: ChainingConfigDto) => void;
}

interface RelativePathRow {
  key: string;
  value: string | null;
}

const RelativePaths: React.FC<RelativePathsProps> = ({
  chainingConfig,
  dataMappingList,
  onChange,
}) => {
  const [rootRelativePaths, setRootRelativePaths] = useState<RelativePathRow[]>([]);

  // Initialize from chainingConfig
  useEffect(() => {
    if (chainingConfig.rootRelativePaths && Object.keys(chainingConfig.rootRelativePaths).length > 0) {
      const paths = Object.entries(chainingConfig.rootRelativePaths).map(([key, value]) => ({
        key,
        value: value as string | null,
      }));
      setRootRelativePaths(paths);
    }
  }, []);

  const getOptionsForMapping = (mappingId: string) => {
    const dataMapping = dataMappingList.find((el) => el.id === mappingId);
    if (!dataMapping) {
      return [];
    }

    const sampleContent = getSourceData(dataMapping.sampleContent || '', dataMapping);
    return [
      {
        title: 'root:/',
        value: 'root:/',
        children: relativePathOptions(sampleContent, 'root:/', [], true),
      },
    ];
  };

  const handleAddRelativePath = () => {
    setRootRelativePaths([...rootRelativePaths, { key: '', value: null }]);
  };

  const handleDeleteRelativePath = (index: number) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove relative path?',
      onOk: () => {
        const newPaths = [...rootRelativePaths];
        newPaths.splice(index, 1);
        setRootRelativePaths(newPaths);
        updateChainingConfig(newPaths);
      },
    });
  };

  const handleMappingChange = (index: number, value: string) => {
    const newPaths = [...rootRelativePaths];
    newPaths[index] = { key: value, value: null }; // Reset value when mapping changes
    setRootRelativePaths(newPaths);
    updateChainingConfig(newPaths);
  };

  const handlePathChange = (index: number, value: string) => {
    const newPaths = [...rootRelativePaths];
    newPaths[index].value = value;
    setRootRelativePaths(newPaths);
    updateChainingConfig(newPaths);
  };

  const updateChainingConfig = (paths: RelativePathRow[]) => {
    const rootRelativePathsObj: Record<string, string | null> = {};
    paths.forEach((path) => {
      if (path.key) {
        rootRelativePathsObj[path.key] = path.value;
      }
    });

    onChange({
      ...chainingConfig,
      rootRelativePaths: rootRelativePathsObj,
    });
  };

  const columns = [
    {
      title: 'Mapping',
      dataIndex: 'key',
      key: 'mapping',
      width: '45%',
      render: (value: string, record: RelativePathRow, index: number) => (
        <Select
          value={value || undefined}
          onChange={(val) => handleMappingChange(index, val)}
          placeholder="Please select mapping"
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={dataMappingList.map((item) => ({
            label: item.name,
            value: item.id,
          }))}
          allowClear
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Root Relative Path',
      dataIndex: 'value',
      key: 'path',
      width: '45%',
      render: (value: string | null, record: RelativePathRow, index: number) => (
        <TreeSelect
          value={value || undefined}
          onChange={(val) => handlePathChange(index, val)}
          placeholder="Please select"
          disabled={!record.key}
          treeData={getOptionsForMapping(record.key)}
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
      render: (_: any, record: RelativePathRow, index: number) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRelativePath(index)}
        />
      ),
    },
  ];

  return (
    <div className="data-chaining-relative-paths">
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRelativePath}>
          Add relative path
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rootRelativePaths.map((item, index) => ({ ...item, rowKey: index }))}
        rowKey="rowKey"
        pagination={false}
        bordered
      />
    </div>
  );
};

export default RelativePaths;


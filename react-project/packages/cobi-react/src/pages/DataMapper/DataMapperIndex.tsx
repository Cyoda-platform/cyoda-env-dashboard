import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Space, Input, Table, Modal, Tooltip, message, Tag, Alert, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDataMappings, useDeleteDataMapping, useExportAllCobi, useImportCobiConfig } from '../../hooks/useDataMapping';
import { AIGenerateButton } from '../../components/AIGenerate';
import type { MappingConfigDto } from '../../types';
import './DataMapperIndex.css';

const DataMapperIndex: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data mappings
  const { data: mappingsData, isLoading, refetch, error } = useDataMappings(true);
  const deleteMutation = useDeleteDataMapping();

  // Export/Import mutations
  const exportMutation = useExportAllCobi();
  const importMutation = useImportCobiConfig();

  // Ensure mappings is always an array
  const mappings = useMemo(() => {
    if (!mappingsData) return [];
    if (Array.isArray(mappingsData)) return mappingsData;
    // If data is an object with a data property
    if (mappingsData.data && Array.isArray(mappingsData.data)) return mappingsData.data;
    // If data is an object with items/results property
    if (mappingsData.items && Array.isArray(mappingsData.items)) return mappingsData.items;
    if (mappingsData.results && Array.isArray(mappingsData.results)) return mappingsData.results;
    console.warn('Unexpected data format from API:', mappingsData);
    return [];
  }, [mappingsData]);

  const handleAIGenerateSuccess = () => {
    console.log('AI Generate completed successfully');
    refetch();
  };

  // Calculate number of configured columns
  const calculateNumberOfConfiguredColumns = (mapping: MappingConfigDto) => {
    if (!mapping.entityMappings) return 0;
    return mapping.entityMappings.reduce((total, entity) => {
      return total + (entity.columns?.filter(col => col.targetColumnPath).length || 0);
    }, 0);
  };

  // Get short entity names
  const getEntityShortNames = (mapping: MappingConfigDto) => {
    if (!mapping.entityMappings) return [];
    return mapping.entityMappings.map(entity => {
      const parts = entity.entityClass?.split('.') || [];
      return parts[parts.length - 1] || entity.entityClass;
    });
  };

  // Transform data for table
  const tableData = useMemo(() => {
    return mappings.map((mapping: MappingConfigDto) => ({
      ...mapping,
      numberOfConfiguredColumns: calculateNumberOfConfiguredColumns(mapping),
      entities: getEntityShortNames(mapping),
    }));
  }, [mappings]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filter) return tableData;
    const lowerFilter = filter.toLowerCase();
    return tableData.filter((mapping: any) => {
      return (
        mapping.name?.toLowerCase().includes(lowerFilter) ||
        mapping.dataType?.toLowerCase().includes(lowerFilter) ||
        mapping.description?.toLowerCase().includes(lowerFilter) ||
        mapping.entities?.join('').toLowerCase().includes(lowerFilter)
      );
    });
  }, [tableData, filter]);

  // Debug: Log data
  console.log('Data Mapper Index - mappings:', mappings.length, 'filtered:', filteredData.length);

  // Refetch data when component mounts
  useEffect(() => {
    refetch();
  }, []);

  const handleCreate = () => {
    navigate('/data-mapper/configuration');
  };

  const handleEdit = (record: MappingConfigDto) => {
    navigate(`/data-mapper/configuration/${record.id}`);
  };

  const handleDelete = (record: MappingConfigDto) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove this mapping?',
      onOk: async () => {
        if (record.id) {
          try {
            await deleteMutation.mutateAsync(record.id);
            message.success('Mapping deleted successfully');
            refetch();
          } catch (error) {
            message.error('Failed to delete mapping');
          }
        }
      },
    });
  };

  const handleCopy = (record: MappingConfigDto) => {
    const copy = {
      ...record,
      id: null, // Remove ID so it creates a new mapping
      name: `${record.name} (Copy)`,
    };
    navigate('/data-mapper/configuration', { state: { initialData: copy } });
  };

  const handleDeleteSelected = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: 'Confirm',
      content: `Do you really want to delete ${selectedRowKeys.length} selected mapping(s)?`,
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) => deleteMutation.mutateAsync(key as string))
          );
          message.success('Mappings deleted successfully');
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('Failed to delete some mappings');
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const response = await exportMutation.mutateAsync();

      // Download the exported file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cobi-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Data mappings exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data mappings');
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        await importMutation.mutateAsync({ data });
        message.success('Data mappings imported successfully');
        refetch();
      } catch (error) {
        console.error('Import error:', error);
        message.error('Failed to import data mappings. Please check the file format.');
      }
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  // Expandable row render
  const expandedRowRender = (record: MappingConfigDto) => {
    if (!record.entityMappings || record.entityMappings.length === 0) {
      return <div style={{ padding: '16px' }}>No entity mappings</div>;
    }

    const columns: ColumnsType<any> = [
      {
        title: 'Source Column Path',
        dataIndex: 'srcColumnPath',
        key: 'srcColumnPath',
        width: 180,
      },
      {
        title: 'Target Column Path',
        dataIndex: 'targetColumnPath',
        key: 'targetColumnPath',
        width: 180,
      },
      {
        title: 'Transformer',
        dataIndex: 'transformer',
        key: 'transformer',
        width: 150,
        render: (transformer: any) => transformer?.name || '-',
      },
    ];

    const data = record.entityMappings[0]?.columns || [];

    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
        rowKey={(row, index) => `${row.srcColumnPath}-${index}`}
      />
    );
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      width: 200,
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
      sorter: (a, b) => (a.dataType || '').localeCompare(b.dataType || ''),
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Entities',
      dataIndex: 'entities',
      key: 'entities',
      width: 200,
      render: (entities: string[]) => (
        <Space size={[0, 4]} wrap>
          {entities.map((entity, index) => (
            <Tag key={index} color="blue">
              {entity}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Configured Columns',
      dataIndex: 'numberOfConfiguredColumns',
      key: 'numberOfConfiguredColumns',
      width: 150,
      sorter: (a, b) => a.numberOfConfiguredColumns - b.numberOfConfiguredColumns,
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 180,
      sorter: (a, b) => {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return dateA - dateB;
      },
      defaultSortOrder: 'descend',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
          <Tooltip title="Copy">
            <Button
              type="default"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="data-mapper-index">
      <Card>
        <div className="header-actions">
          <h4>Data Mappings</h4>
          <Space>
            <Button
              type="primary"
              danger
              onClick={handleDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            >
              Delete Selected
            </Button>
            <Tooltip title="Export all data mappings">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exportMutation.isPending}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Import data mappings from file">
              <Upload
                accept=".json"
                beforeUpload={handleImport}
                showUploadList={false}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={importMutation.isPending}
                >
                  Import
                </Button>
              </Upload>
            </Tooltip>
            <AIGenerateButton type="dataMapper" onSuccess={handleAIGenerateSuccess} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Create Mapping
            </Button>
          </Space>
        </div>

        {error && (
          <Alert
            message="Error loading data mappings"
            description={error instanceof Error ? error.message : 'Failed to fetch data mappings from the server'}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input
            placeholder="Filter by name, data type, description, or entities"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '50%' }}
          />
          <span style={{ color: '#8c8c8c' }}>
            {filteredData.length} {filteredData.length === 1 ? 'mapping' : 'mappings'} found
          </span>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record.id || record.name || Math.random().toString()}
          loading={isLoading}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.entityMappings && record.entityMappings.length > 0,
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} mappings`,
            position: ['bottomCenter'],
            hideOnSinglePage: false,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1); // Reset to first page when page size changes
              }
            },
          }}
          bordered
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default DataMapperIndex;


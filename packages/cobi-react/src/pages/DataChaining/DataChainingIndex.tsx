import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Table, Space, Modal, message, Tooltip, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getListAll, deleteById } from '../../api/chainingConfigApi';
import { useExportAllCobi, useImportCobiConfig } from '../../hooks/useChainingConfig';
import type { ChainingConfigDto } from '../../types';
import './DataChainingIndex.css';

const DataChainingIndex: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Fetch chaining configurations
  const { data: chainingConfigs = [], isLoading, refetch } = useQuery({
    queryKey: ['chainingConfigs'],
    queryFn: async () => {
      const response = await getListAll();
      return response.data || [];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chainingConfigs'] });
      message.success('Configuration deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete configuration');
    },
  });

  // Export/Import mutations
  const exportMutation = useExportAllCobi();
  const importMutation = useImportCobiConfig();

  // Filter configurations
  const filteredData = useMemo(() => {
    if (!filter) return chainingConfigs;
    const lowerFilter = filter.toLowerCase();
    return chainingConfigs.filter((config: ChainingConfigDto) =>
      config.name?.toLowerCase().includes(lowerFilter)
    );
  }, [chainingConfigs, filter]);

  const handleCreate = () => {
    navigate('/data-chaining/configuration');
  };

  const handleEdit = (record: ChainingConfigDto) => {
    navigate(`/data-chaining/configuration/${record.id}`);
  };

  const handleDelete = (record: ChainingConfigDto) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove row?',
      onOk: () => {
        if (record.id) {
          deleteMutation.mutate(record.id);
        }
      },
    });
  };

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: 'Confirm',
      content: `Do you really want to remove ${selectedRowKeys.length} row(s)?`,
      onOk: async () => {
        for (const key of selectedRowKeys) {
          await deleteMutation.mutateAsync(key as string);
        }
        setSelectedRowKeys([]);
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
      link.setAttribute('download', `chaining-config-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Chaining configurations exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export chaining configurations');
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        await importMutation.mutateAsync({ data });
        message.success('Chaining configurations imported successfully');
        refetch();
      } catch (error) {
        console.error('Import error:', error);
        message.error('Failed to import chaining configurations. Please check the file format.');
      }
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ChainingConfigDto, b: ChainingConfigDto) =>
        (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Updated at',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      sorter: (a: ChainingConfigDto, b: ChainingConfigDto) =>
        (a.lastUpdated || 0) - (b.lastUpdated || 0),
      render: (lastUpdated: number) =>
        lastUpdated ? dayjs(lastUpdated).format('YYYY-MM-DD HH:mm:ss') : '-',
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, record: ChainingConfigDto) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="data-chaining-index">
      <Card>
        <div className="header-actions">
          <h4>Chaining</h4>
          <Space>
            <Button
              type="primary"
              danger
              onClick={handleDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            >
              Delete Selected
            </Button>
            <Tooltip title="Export all chaining configurations">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exportMutation.isPending}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Import chaining configurations from file">
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Create Configuration
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '50%' }}
          />
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          bordered
        />
      </Card>
    </div>
  );
};

export default DataChainingIndex;


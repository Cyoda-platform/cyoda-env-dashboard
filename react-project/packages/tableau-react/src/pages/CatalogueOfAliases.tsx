/**
 * Catalogue of Aliases Page
 * Migrated from: .old_project/packages/http-api/src/views/CatalogOfAliases.vue
 * 
 * Displays a catalog of all alias definitions with filtering, CRUD operations,
 * export/import, and state transitions
 */

import React, { useState, useMemo, useRef } from 'react';
import { Table, Button, Space, message, Modal, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { getAllCatalogItems, createCatalogItem, updateCatalogItem, deleteCatalogItem, exportCatalogItems, importCatalogItems } from '@cyoda/http-api-react';
import type { CatalogItem } from '@cyoda/http-api-react';
import CatalogueOfAliasesFilter from '../components/CatalogueOfAliasesFilter';
import CatalogueAliasDialog, { CatalogueAliasDialogRef } from '../components/CatalogueAliasDialog';
import CatalogueAliasChangeStateDialog, { CatalogueAliasChangeStateDialogRef } from '../components/CatalogueAliasChangeStateDialog';
import './CatalogueOfAliases.scss';

interface TableDataRow {
  id: string;
  name: string;
  description: string;
  entity: string;
  user: string;
  state: string;
  created: string;
  createdHuman: string;
  createdTimestamp: number;
  source: CatalogItem;
}

interface FilterForm {
  states?: string[];
  entities?: string[];
  authors?: string[];
  time_custom?: string;
  search?: string;
}

const CatalogueOfAliases: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterForm, setFilterForm] = useState<FilterForm>({});
  const aliasDialogRef = useRef<CatalogueAliasDialogRef>(null);
  const changeStateDialogRef = useRef<CatalogueAliasChangeStateDialogRef>(null);

  // Fetch catalog items
  const { data: catalogItems = [], isLoading, refetch } = useQuery({
    queryKey: ['catalogItems'],
    queryFn: async () => {
      const { data } = await getAllCatalogItems();
      return data || [];
    },
  });

  // Helper function to get short entity name
  const getShortEntityName = (entityClass: string): string => {
    if (!entityClass) return '';
    const parts = entityClass.split('.');
    return parts[parts.length - 1];
  };

  // Transform data for table
  const tableData = useMemo(() => {
    let data: TableDataRow[] = catalogItems.map((item) => ({
      id: item.id || '',
      name: item.name,
      description: item.desc || '',
      entity: getShortEntityName(item.entityClass),
      user: item.user || '',
      state: item.state || '',
      created: item.createDate || '',
      createdHuman: item.createDate ? moment(item.createDate).format('DD-MM-YYYY HH:mm') : '',
      createdTimestamp: item.createDate ? moment(item.createDate).unix() : 0,
      source: item,
    }));

    // Apply filters
    if (filterForm.states && filterForm.states.length > 0) {
      data = data.filter((item) => filterForm.states!.includes(item.state));
    }
    if (filterForm.entities && filterForm.entities.length > 0) {
      data = data.filter((item) => filterForm.entities!.includes(item.entity));
    }
    if (filterForm.authors && filterForm.authors.length > 0) {
      data = data.filter((item) => filterForm.authors!.includes(item.user));
    }
    if (filterForm.time_custom) {
      const filterTime = moment(filterForm.time_custom).unix();
      data = data.filter((item) => item.createdTimestamp >= filterTime);
    }
    if (filterForm.search) {
      const searchLower = filterForm.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    return data;
  }, [catalogItems, filterForm]);

  // Get filter options
  const filterOptions = useMemo(() => {
    const users = Array.from(new Set(catalogItems.map((item) => item.user).filter(Boolean)));
    const entities = Array.from(new Set(catalogItems.map((item) => getShortEntityName(item.entityClass))));
    const states = Array.from(new Set(catalogItems.map((item) => item.state).filter(Boolean)));

    return {
      usersOptions: users.map((user) => ({ value: user, label: user })),
      entityOptions: entities.map((entity) => ({ value: entity, label: entity })),
      stateOptions: states.map((state) => ({ value: state, label: state })),
    };
  }, [catalogItems]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (item: CatalogItem) => {
      await createCatalogItem(item);
    },
    onSuccess: () => {
      message.success('Alias created successfully');
      refetch();
    },
    onError: () => {
      message.error('Failed to create alias');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, item }: { id: string; item: CatalogItem }) => {
      await updateCatalogItem(id, item);
    },
    onSuccess: () => {
      message.success('Alias updated successfully');
      refetch();
    },
    onError: () => {
      message.error('Failed to update alias');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCatalogItem(id);
    },
    onSuccess: () => {
      message.success('Alias deleted successfully');
      refetch();
    },
    onError: () => {
      message.error('Failed to delete alias');
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteCatalogItem(id)));
    },
    onSuccess: () => {
      message.success('Aliases deleted successfully');
      setSelectedRowKeys([]);
      refetch();
    },
    onError: () => {
      message.error('Failed to delete aliases');
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await exportCatalogItems(ids);
      return data;
    },
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aliases-export-${moment().format('YYYY-MM-DD-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Aliases exported successfully');
    },
    onError: () => {
      message.error('Failed to export aliases');
    },
  });

  // Import handler
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importCatalogItems(data);
        message.success('Aliases imported successfully');
        refetch();
      } catch (error) {
        message.error('Failed to import aliases');
      }
    };
    input.click();
  };

  // Handlers
  const handleCreateNew = () => {
    aliasDialogRef.current?.open();
  };

  const handleEdit = (record: TableDataRow) => {
    aliasDialogRef.current?.open(record.source);
  };

  const handleDelete = (record: TableDataRow) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Do you really want to remove this alias?',
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Do you really want to remove ${selectedRowKeys.length} aliases?`,
      onOk: () => bulkDeleteMutation.mutate(selectedRowKeys as string[]),
    });
  };

  const handleExport = () => {
    const ids = selectedRowKeys.length > 0 
      ? (selectedRowKeys as string[]) 
      : tableData.map((item) => item.id);
    exportMutation.mutate(ids);
  };

  const handleChangeState = (record: TableDataRow) => {
    changeStateDialogRef.current?.open(record.id, record.source.entityClass);
  };

  const handleAliasCreated = (item: CatalogItem) => {
    createMutation.mutate(item);
  };

  const handleAliasUpdated = (id: string, item: CatalogItem) => {
    updateMutation.mutate({ id, item });
  };

  const handleStateChanged = () => {
    refetch();
  };

  // Table columns
  const columns: TableColumnsType<TableDataRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      sorter: (a, b) => a.entity.localeCompare(b.entity),
      width: 150,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      sorter: (a, b) => a.user.localeCompare(b.user),
      width: 120,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      sorter: (a, b) => a.state.localeCompare(b.state),
      width: 100,
    },
    {
      title: 'Created',
      dataIndex: 'createdHuman',
      key: 'created',
      sorter: (a, b) => a.createdTimestamp - b.createdTimestamp,
      width: 150,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="catalogue-of-aliases">
      <h1>Catalogue of Aliases</h1>

      <div className="flex-buttons">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Create New
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Export
          </Button>
          <Button icon={<ImportOutlined />} onClick={handleImport}>
            Import
          </Button>
        </Space>
      </div>

      <CatalogueOfAliasesFilter
        value={filterForm}
        onChange={setFilterForm}
        usersOptions={filterOptions.usersOptions}
        entityOptions={filterOptions.entityOptions}
        stateOptions={filterOptions.stateOptions}
      />

      <Divider />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{ x: 1200 }}
      />

      {selectedRowKeys.length > 0 && (
        <div className="form-multiple-selection">
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </div>
      )}

      <CatalogueAliasDialog
        ref={aliasDialogRef}
        onCreate={handleAliasCreated}
        onUpdate={handleAliasUpdated}
      />

      <CatalogueAliasChangeStateDialog
        ref={changeStateDialogRef}
        onStateChanged={handleStateChanged}
      />
    </div>
  );
};

export default CatalogueOfAliases;


/**
 * Catalogue of Aliases Page
 * Migrated from: .old_project/packages/http-api/src/views/CatalogOfAliases.vue
 * 
 * Displays a catalog of all alias definitions with filtering, CRUD operations,
 * export/import, and state transitions
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Table, Button, Space, App, Modal, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { getAllCatalogItems, createCatalogItem, updateCatalogItem, deleteCatalogItem, exportCatalogItems, importCatalogItems, useGlobalUiSettingsStore, getReportingFetchTypes } from '@cyoda/http-api-react';
import type { CatalogItem } from '@cyoda/http-api-react';
import CatalogueOfAliasesFilter from '../components/CatalogueOfAliasesFilter';
import ModellingPopUpAliasNew, { ModellingPopUpAliasNewRef } from '../components/Modelling/Alias/ModellingPopUpAliasNew';
import CatalogueAliasChangeStateDialog, { CatalogueAliasChangeStateDialogRef } from '../components/CatalogueAliasChangeStateDialog';
import ImportDialog from '../components/ImportDialog';
import { ResizableTitle } from '../components/ResizableTitle';
import { HelperStorage } from '@cyoda/ui-lib-react';
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
  entityType?: string | null;
}

interface FilterForm {
  states?: string[];
  entities?: string[];
  authors?: string[];
  time_custom?: string;
  search?: string;
}

const CatalogueOfAliases: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const storage = useMemo(() => new HelperStorage(), []);
  const { entityType } = useGlobalUiSettingsStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterForm, setFilterForm] = useState<FilterForm>({});
  const [pageSize, setPageSize] = useState<number>(50);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const aliasDialogRef = useRef<ModellingPopUpAliasNewRef>(null);
  const changeStateDialogRef = useRef<CatalogueAliasChangeStateDialogRef>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('catalogueOfAliases:columnWidths', {});
    const defaultWidths = {
      name: 200,
      description: 250,
      entity: 150,
      author: 120,
      created: 150,
      state: 100,
      action: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Sort state - load from localStorage
  const [sortField, setSortField] = useState<string | null>(() => {
    return storage.get('catalogueOfAliases:sortField', null);
  });
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(() => {
    return storage.get('catalogueOfAliases:sortOrder', null);
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('catalogueOfAliases:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

  // Save sort settings to localStorage
  useEffect(() => {
    storage.set('catalogueOfAliases:sortField', sortField);
    storage.set('catalogueOfAliases:sortOrder', sortOrder);
  }, [sortField, sortOrder, storage]);

  // Handle column resize
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

        const totalOtherWidth = otherKeys.reduce((sum, k) => sum + prev[k], 0);
        const newWidths = { ...prev, [key]: newWidth };

        otherKeys.forEach(k => {
          const proportion = prev[k] / totalOtherWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment);
        });

        return newWidths;
      });
    };
  }, []);

  // Fetch entity types for filtering
  const { data: entityTypesData = [] } = useQuery({
    queryKey: ['entityTypes'],
    queryFn: async () => {
      try {
        const { data } = await getReportingFetchTypes();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Failed to load entity types:', error);
        return [];
      }
    },
  });

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
    let data: TableDataRow[] = catalogItems.map((item) => {
      // Find entity type info
      const entityClass = item.entityClass;
      const entityTypeInfo = entityTypesData.find((et: any) =>
        typeof et === 'object' ? et.name === entityClass : et === entityClass
      );
      const entityTypeValue = typeof entityTypeInfo === 'object' ? entityTypeInfo.type : null;

      return {
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
        entityType: entityTypeValue,
      };
    });

    // Filter by entity type from global toggle
    if (entityTypesData.length > 0 && entityTypesData.some((et: any) => typeof et === 'object' && et.type)) {
      data = data.filter((item: any) => {
        // If entity has type info, filter by it
        if (item.entityType) {
          return item.entityType === entityType;
        }
        // If no type info, show in both modes (backward compatibility)
        return true;
      });
    }

    // Apply other filters
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
  }, [catalogItems, filterForm, entityType, entityTypesData]);

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

      // Show success message after successful API call and file download trigger
      message.success('Aliases exported successfully');
    },
    onError: () => {
      message.error('Failed to export aliases');
    },
  });

  // Import handler
  const handleImport = async (data: any) => {
    // For catalog items, always use needRewrite=true (backend doesn't support failOnExists properly)
    const response = await importCatalogItems(data, true);

    // Return the response data for ImportDialog to handle
    return {
      success: response.data.success !== false,
      errors: response.data.errors || []
    };
  };

  const validateImportData = (data: any) => {
    // Validate that the data has the expected structure for catalog items
    // API returns CatalogItemExportImportContainer with 'aliases' field
    return data && Array.isArray(data.aliases);
  };

  const getImportPreview = (data: any) => {
    const count = data.aliases?.length || 0;
    const names = data.aliases?.map((item: any) => item.aliasDef?.name || item.name || 'Unnamed').join(', ') || '';
    return { count, names };
  };

  // Handlers
  const handleCreateNew = () => {
    aliasDialogRef.current?.open();
  };

  const handleEdit = (record: TableDataRow) => {
    aliasDialogRef.current?.open(record.source.entityClass, record.source);
  };

  const handleDelete = (record: TableDataRow) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Do you really want to remove this alias?',
      onOk: () => deleteMutation.mutate(record.id),
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

  // Table columns with resizable support
  const columns: TableColumnsType<TableDataRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortField === 'name' ? sortOrder : null,
      width: columnWidths.name,
      onHeaderCell: () => ({
        width: columnWidths.name,
        onResize: handleResize('name'),
      }),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortOrder: sortField === 'description' ? sortOrder : null,
      width: columnWidths.description,
      onHeaderCell: () => ({
        width: columnWidths.description,
        onResize: handleResize('description'),
      }),
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      sorter: (a, b) => a.entity.localeCompare(b.entity),
      sortOrder: sortField === 'entity' ? sortOrder : null,
      width: columnWidths.entity,
      onHeaderCell: () => ({
        width: columnWidths.entity,
        onResize: handleResize('entity'),
      }),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      sorter: (a, b) => a.user.localeCompare(b.user),
      sortOrder: sortField === 'user' ? sortOrder : null,
      width: columnWidths.author,
      onHeaderCell: () => ({
        width: columnWidths.author,
        onResize: handleResize('author'),
      }),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      sorter: (a, b) => a.state.localeCompare(b.state),
      sortOrder: sortField === 'state' ? sortOrder : null,
      width: columnWidths.state,
      onHeaderCell: () => ({
        width: columnWidths.state,
        onResize: handleResize('state'),
      }),
    },
    {
      title: 'Created',
      dataIndex: 'createdHuman',
      key: 'created',
      sorter: (a, b) => a.createdTimestamp - b.createdTimestamp,
      sortOrder: sortField === 'created' ? sortOrder : null,
      width: columnWidths.created,
      onHeaderCell: () => ({
        width: columnWidths.created,
        onResize: handleResize('created'),
      }),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: columnWidths.action,
      onHeaderCell: () => ({
        width: columnWidths.action,
        onResize: handleResize('action'),
      }),
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
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={selectedRowKeys.length === 0}
          >
            Export
          </Button>
          <Button icon={<ImportOutlined />} onClick={() => setImportDialogOpen(true)}>
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
        onChange={(pagination, filters, sorter: any) => {
          // Handle sorting
          if (sorter && !Array.isArray(sorter)) {
            if (sorter.order) {
              setSortField(sorter.columnKey || sorter.field);
              setSortOrder(sorter.order);
            } else {
              // Clear sorting
              setSortField(null);
              setSortOrder(null);
            }
          }
        }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          className: 'pagination-bar',
          selectComponentClass: undefined,
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
        scroll={{ x: 1200 }}
      />

      <ModellingPopUpAliasNew
        ref={aliasDialogRef}
        onCreate={handleAliasCreated}
        onUpdate={handleAliasUpdated}
        allowSelectEntity={true}
        allowConfigFile={true}
        aliasEditType="catalog"
      />

      <CatalogueAliasChangeStateDialog
        ref={changeStateDialogRef}
        onStateChanged={handleStateChanged}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
          message.success('Aliases imported successfully');
          refetch();
        }}
        onImport={handleImport}
        title="Import Aliases"
        description="Upload a previously exported aliases JSON file to import aliases into the catalog. Existing aliases will be overwritten."
        validateData={validateImportData}
        getItemsPreview={getImportPreview}
        showFailOnExists={false}
      />
    </div>
  );
};

export default CatalogueOfAliases;


/**
 * ModellingPopUpAlias Component
 * Catalog browser for saved aliases
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/tabs/CyodaModelling/CyodaModellingAlias/CyodaModellingPopUpAlias.vue
 */

import React, { useState, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, Table, Space, message } from 'antd';
import { PlusOutlined, SelectOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ModellingPopUpAliasNew, { ModellingPopUpAliasNewRef } from './ModellingPopUpAliasNew';
import type { AliasDef, ReportDefinition } from '../../../types';
import './ModellingPopUpAlias.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ModellingPopUpAliasProps {
  requestClass: string;
  configDefinition: ReportDefinition;
  onChange?: (alias: AliasDef) => void;
  onDelete?: (aliasName: string) => void;
}

export interface ModellingPopUpAliasRef {
  open: () => void;
  close: () => void;
}

interface CatalogItem {
  id?: string;
  name?: string;
  aliasDef: AliasDef;
}

interface TableRow {
  item: CatalogItem;
  isDisableSelect: boolean;
  name: string;
  paths: Array<{
    path: string;
    mapperClass: string;
    mapperParameters?: string;
  }>;
}

export const ModellingPopUpAlias = forwardRef<ModellingPopUpAliasRef, ModellingPopUpAliasProps>(
  ({ requestClass, configDefinition, onChange, onDelete }, ref) => {
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [aliasEdit, setAliasEdit] = useState<CatalogItem | null>(null);
    const queryClient = useQueryClient();
    const aliasNewRef = useRef<ModellingPopUpAliasNewRef>(null);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    // Fetch catalog items
    const { data: catalogOfAliases = [], isLoading, refetch } = useQuery({
      queryKey: ['catalogItems', requestClass],
      queryFn: async () => {
        const { data } = await axios.get(
          `${API_BASE}/platform-api/catalog/item/class?entityClass=${requestClass}`
        );
        return data as CatalogItem[];
      },
      enabled: visible && !!requestClass,
    });

    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        await axios.delete(`${API_BASE}/platform-api/catalog/item?itemId=${id}`);
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
        await Promise.all(ids.map((id) => axios.delete(`${API_BASE}/platform-api/catalog/item?itemId=${id}`)));
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

    const tableData = useMemo(() => {
      return catalogOfAliases.map((item) => ({
        key: item.id || item.name,
        item,
        isDisableSelect: !!configDefinition.aliasDefs?.find(
          (selectedAlias) => selectedAlias.name === item.aliasDef.name
        ),
        name: item.aliasDef.name,
        paths: item.aliasDef.aliasPaths?.value?.map((aliasPath: any) => ({
          path: aliasPath.colDef.fullPath,
          mapperClass: aliasPath.mapperClass?.split('.').pop() || '',
          mapperParameters: aliasPath.mapperParameters || undefined,
        })) || [],
      }));
    }, [catalogOfAliases, configDefinition.aliasDefs]);

    const handleOpenNew = () => {
      setAliasEdit(null);
      aliasNewRef.current?.open(requestClass);
    };

    const handleSelect = (record: TableRow) => {
      if (onChange) {
        onChange(JSON.parse(JSON.stringify(record.item.aliasDef)));
      }
      setVisible(false);
    };

    const handleEdit = (record: TableRow) => {
      setAliasEdit(JSON.parse(JSON.stringify(record.item)));
      aliasNewRef.current?.open(requestClass, record.item);
    };

    const handleDelete = (record: TableRow) => {
      Modal.confirm({
        title: 'Confirm!',
        content: 'Do you really want to remove?',
        onOk: async () => {
          if (record.item.id) {
            await deleteMutation.mutateAsync(record.item.id);
            if (onDelete) {
              onDelete(record.item.name || '');
            }
          }
        },
      });
    };

    const handleBulkDelete = () => {
      Modal.confirm({
        title: 'Confirm!',
        content: `Do you really want to remove ${selectedRowKeys.length} records?`,
        onOk: async () => {
          const ids = selectedRowKeys
            .map((key) => {
              const row = tableData.find((r) => r.key === key);
              return row?.item.id;
            })
            .filter((id): id is string => !!id);

          await bulkDeleteMutation.mutateAsync(ids);
        },
      });
    };

    const handleBulkAdd = () => {
      const selectedAliases = selectedRowKeys
        .map((key) => {
          const row = tableData.find((r) => r.key === key);
          return row?.item.aliasDef;
        })
        .filter((alias): alias is AliasDef => !!alias);

      selectedAliases.forEach((alias) => {
        if (onChange) {
          onChange(JSON.parse(JSON.stringify(alias)));
        }
      });

      setSelectedRowKeys([]);
      setVisible(false);
    };

    const handleAliasCreated = () => {
      refetch();
    };

    const columns: TableColumnsType<TableRow> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: 'Paths',
        dataIndex: 'paths',
        key: 'paths',
        render: (paths: TableRow['paths']) => (
          <div>
            {paths.map((p, idx) => (
              <div key={idx}>
                {p.path}
                {p.mapperClass && ` (${p.mapperClass})`}
              </div>
            ))}
          </div>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => (
          <Space>
            <Button
              type="primary"
              icon={<SelectOutlined />}
              onClick={() => handleSelect(record)}
              disabled={record.isDisableSelect}
            />
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Button
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
      <>
        <Modal
          title="Catalog of Aliases"
          open={visible}
          onCancel={() => setVisible(false)}
          width="90%"
          footer={null}
        >
          <div className="modelling-popup-alias__actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenNew}
              disabled={!requestClass}
            >
              Add New Alias
            </Button>

            {selectedRowKeys.length > 0 && (
              <Space style={{ marginLeft: 'auto' }}>
                <Button onClick={handleBulkAdd}>Add Selected ({selectedRowKeys.length})</Button>
                <Button danger onClick={handleBulkDelete}>
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </Space>
            )}
          </div>

          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
            pagination={false}
            scroll={{ y: 400 }}
          />
        </Modal>

        <ModellingPopUpAliasNew
          ref={aliasNewRef}
          configDefinition={configDefinition}
          onCreated={handleAliasCreated}
          onUpdated={handleAliasCreated}
        />
      </>
    );
  }
);

ModellingPopUpAlias.displayName = 'ModellingPopUpAlias';

export default ModellingPopUpAlias;


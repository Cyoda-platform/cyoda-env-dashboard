/**
 * ModellingAliases Component
 * Alias definitions management
 * Migrated from: CyodaModellingAliases.vue
 */

import React, { useState, useMemo, useRef } from 'react';
import { Button, Table, Modal, App } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { AliasDef } from '@cyoda/http-api-react';
import ModellingPopUpAlias, { ModellingPopUpAliasRef } from './ModellingPopUpAlias';
import ModellingPopUpAliasNew, { ModellingPopUpAliasNewRef } from './ModellingPopUpAliasNew';
import './ModellingAliases.scss';

interface ModellingAliasesProps {
  configDefinition: any;
  onChange?: (updates: any) => void;
  readOnly?: boolean;
}

export const ModellingAliases: React.FC<ModellingAliasesProps> = ({ configDefinition, onChange, readOnly = false }) => {
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const catalogRef = useRef<ModellingPopUpAliasRef>(null);
  const aliasNewRef = useRef<ModellingPopUpAliasNewRef>(null);

  const tableData = useMemo(() => {
    return (configDefinition.aliasDefs || []).map((el: AliasDef, index: number) => ({
      key: index,
      name: el.name,
      alias: el,
      paths: el.aliasPaths?.value?.map((aliasPath) => ({
        path: aliasPath.colDef.fullPath,
        mapperClass: aliasPath.mapperClass.split('.').pop()!,
        mapperParameters: aliasPath.mapperParameters || undefined,
      })) || [],
    }));
  }, [configDefinition.aliasDefs]);

  const handleOpenDialog = () => {
    catalogRef.current?.open();
  };

  const handleAliasSelected = (alias: AliasDef) => {
    // Check if alias with same name already exists
    const existingAlias = (configDefinition.aliasDefs || []).find((a: AliasDef) => a.name === alias.name);

    if (existingAlias) {
      message.warning(`Alias "${alias.name}" already exists in the report`);
      return;
    }

    const newAliasDefs = [...(configDefinition.aliasDefs || []), alias];
    if (onChange) {
      onChange({ aliasDefs: newAliasDefs });
    } else {
      configDefinition.aliasDefs = newAliasDefs;
    }
    message.success('Alias added successfully');
  };

  const handleAliasDeleted = (aliasName: string) => {
    const newAliasDefs = (configDefinition.aliasDefs || []).filter((a: AliasDef) => a.name !== aliasName);
    if (onChange) {
      onChange({ aliasDefs: newAliasDefs });
    } else {
      configDefinition.aliasDefs = newAliasDefs;
    }
  };

  const handleRemove = (index: number) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove?',
      onOk: () => {
        if (configDefinition.aliasDefs) {
          const newAliasDefs = configDefinition.aliasDefs.filter((_: any, i: number) => i !== index);
          if (onChange) {
            onChange({ aliasDefs: newAliasDefs });
          } else {
            configDefinition.aliasDefs = newAliasDefs;
          }
          message.success('Alias removed successfully');
        }
      },
    });
  };

  const handleEdit = (alias: AliasDef, index: number) => {
    setEditingIndex(index);
    const catalogItem = {
      aliasDef: alias,
    };
    aliasNewRef.current?.open(configDefinition.requestClass || '', catalogItem);
  };

  const handleCreateNew = () => {
    setEditingIndex(null);
    aliasNewRef.current?.open(configDefinition.requestClass || '');
  };

  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select aliases to delete');
      return;
    }

    Modal.confirm({
      title: 'Confirm',
      content: `Do you really want to remove ${selectedRowKeys.length} records?`,
      onOk: () => {
        if (configDefinition.aliasDefs) {
          const indicesToRemove = selectedRowKeys.map((key) => Number(key));
          const newAliasDefs = configDefinition.aliasDefs.filter(
            (_: any, index: number) => !indicesToRemove.includes(index)
          );
          if (onChange) {
            onChange({ aliasDefs: newAliasDefs });
          } else {
            configDefinition.aliasDefs = newAliasDefs;
          }
          setSelectedRowKeys([]);
          message.success(`${selectedRowKeys.length} aliases removed successfully`);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Paths',
      dataIndex: 'paths',
      key: 'paths',
      render: (paths: any[]) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {paths.map((path, idx) => (
            <li key={idx}>
              {path.path} ({path.mapperClass})
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 250,
      render: (_: any, record: any) => (
        <>
          <Button
            type="primary"
            disabled={readOnly}
            onClick={() => handleEdit(record.alias, record.key)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button danger disabled={readOnly} onClick={() => handleRemove(record.key)}>
            Remove
          </Button>
        </>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
  };

  return (
    <div className="modelling-aliases">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          disabled={!configDefinition.requestClass || readOnly}
          onClick={handleOpenDialog}
          style={{ marginRight: 8 }}
        >
          Add from Catalog
        </Button>
        <Button
          type="default"
          disabled={!configDefinition.requestClass || readOnly}
          onClick={handleCreateNew}
        >
          Create New
        </Button>
      </div>

      <h2>Selected Aliases:</h2>
      <Table
        rowKey="key"
        rowSelection={readOnly ? undefined : rowSelection}
        bordered
          columns={columns}
        dataSource={tableData}
        pagination={false}
      />

      {selectedRowKeys.length > 0 && (
        <div className="form-multiple-selection">
          <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </div>
      )}

      <ModellingPopUpAlias
        ref={catalogRef}
        requestClass={configDefinition.requestClass || ''}
        configDefinition={configDefinition}
        onChange={handleAliasSelected}
        onDelete={handleAliasDeleted}
      />

      <ModellingPopUpAliasNew
        ref={aliasNewRef}
        configDefinition={configDefinition}
        allowSelectEntity={false}
        allowConfigFile={false}
        aliasEditType="report"
        onCreated={(aliasDef) => {
          handleAliasSelected(aliasDef);
          setEditingIndex(null);
        }}
        onUpdated={(updatedAliasDef) => {
          if (editingIndex !== null && configDefinition.aliasDefs) {
            const oldName = configDefinition.aliasDefs[editingIndex].name;
            const newAliasDefs = [...configDefinition.aliasDefs];
            newAliasDefs[editingIndex] = updatedAliasDef;

            if (onChange) {
              onChange({ aliasDefs: newAliasDefs });
            } else {
              configDefinition.aliasDefs = newAliasDefs;
            }

            // If name changed, update references in other parts of the config
            if (oldName !== updatedAliasDef.name) {
              // TODO: Update alias references in colDefs, conditions, etc.
            }

            message.success('Alias updated successfully');
            setEditingIndex(null);
          }
        }}
      />
    </div>
  );
};


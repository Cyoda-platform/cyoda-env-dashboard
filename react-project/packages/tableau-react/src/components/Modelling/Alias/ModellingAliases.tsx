/**
 * ModellingAliases Component
 * Alias definitions management
 * Migrated from: CyodaModellingAliases.vue
 */

import React, { useState, useMemo, useRef } from 'react';
import { Button, Table, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ModellingPopUpAlias, { ModellingPopUpAliasRef } from './ModellingPopUpAlias';
import ModellingPopUpAliasNew, { ModellingPopUpAliasNewRef } from './ModellingPopUpAliasNew';
import type { AliasDef } from '../../../types/modelling';
import './ModellingAliases.scss';

interface ModellingAliasesProps {
  configDefinition: any;
  onChange?: (updates: any) => void;
  readOnly?: boolean;
}

export const ModellingAliases: React.FC<ModellingAliasesProps> = ({ configDefinition, onChange, readOnly = false }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const catalogRef = useRef<ModellingPopUpAliasRef>(null);
  const aliasNewRef = useRef<ModellingPopUpAliasNewRef>(null);

  const tableData = useMemo(() => {
    return (configDefinition.aliasDefs || []).map((el: AliasDef, index: number) => ({
      key: index,
      name: el.name,
      alias: el,
      paths: el.aliasPaths.value.map((aliasPath) => ({
        path: aliasPath.colDef.fullPath,
        mapperClass: aliasPath.mapperClass.split('.').pop()!,
        mapperParameters: aliasPath.mapperParameters || undefined,
      })),
    }));
  }, [configDefinition.aliasDefs]);

  const handleOpenDialog = () => {
    catalogRef.current?.open();
  };

  const handleAliasSelected = (alias: AliasDef) => {
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
    const catalogItem = {
      aliasDef: alias,
    };
    aliasNewRef.current?.open(configDefinition.requestClass || '', catalogItem);
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
          configDefinition.aliasDefs = configDefinition.aliasDefs.filter(
            (_: any, index: number) => !indicesToRemove.includes(index)
          );
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
          <Button type="primary" danger disabled={readOnly} onClick={() => handleRemove(record.key)}>
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
      <Button type="primary" disabled={!configDefinition.requestClass || readOnly} onClick={handleOpenDialog}>
        Catalogue of Aliases
      </Button>

      <h2>Selected Aliases:</h2>
      <Table
        rowSelection={readOnly ? undefined : rowSelection}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />

      {selectedRowKeys.length > 0 && (
        <div className="form-multiple-selection">
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
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
        onCreated={() => message.success('Alias created successfully')}
        onUpdated={() => message.success('Alias updated successfully')}
      />
    </div>
  );
};


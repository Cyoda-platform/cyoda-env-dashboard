import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Modal, Table, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useEntityModels } from '../../hooks/useSqlSchema';
import sqlSchemaApi from '../../api/sqlSchemaApi';
import type { EntityModel, SqlTable } from '../../types';
import './ModelsPopUp.css';

interface ModelsPopUpProps {
  tables: SqlTable[];
  onChange: (tables: SqlTable[]) => void;
  onDeleteTables: (metadataClassIds: string[]) => void;
  onUpdateTables: (data: { tables: SqlTable[]; metaId: string; row: EntityModel }) => void;
}

export interface ModelsPopUpRef {
  open: () => void;
}

interface EntityModelWithLoading extends EntityModel {
  isLoading?: boolean;
}

const ModelsPopUp = forwardRef<ModelsPopUpRef, ModelsPopUpProps>(
  ({ tables, onChange, onDeleteTables, onUpdateTables }, ref) => {
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [tableData, setTableData] = useState<EntityModelWithLoading[]>([]);
    const isInitRef = useRef(false);
    const isAutomaticAddRef = useRef(false);

    // Fetch entity models
    const { data: entityModels = [], isLoading } = useEntityModels();

    // Load data when dialog opens
    useEffect(() => {
      if (visible && !isInitRef.current && entityModels.length > 0) {
        setTableData(
          entityModels.map((el) => ({
            ...el,
            isLoading: false,
          }))
        );
        isInitRef.current = true;
      }
    }, [visible, entityModels]);

    // Auto-select rows based on existing tables
    useEffect(() => {
      if (tableData.length > 0) {
        const allIds = [...new Set(tables.map((el) => el.metadataClassId))];
        setSelectedRowKeys(allIds);
      }
    }, [tableData, tables]);

    // Open dialog
    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
      },
    }));

    // Check if update button should be shown
    const isShowUpdateBtn = (row: EntityModel): boolean => {
      const record = tables.find(
        (el) => el.metadataClassId === row.id && el.modelUpdateDate
      );
      if (!row.modelUpdateDate || !record) return false;

      const tableDate = moment(record.modelUpdateDate).valueOf();
      const modelDate = moment(row.modelUpdateDate).valueOf();
      return modelDate > tableDate;
    };

    // Handle update tables
    const handleUpdateTables = async (row: EntityModelWithLoading) => {
      const tablesToUpdate = tables.filter((el) => el.metadataClassId === row.id);
      onUpdateTables({
        tables: tablesToUpdate,
        metaId: row.id,
        row,
      });
    };

    // Handle selection change
    const handleSelectionChange = async (newSelectedRowKeys: React.Key[]) => {
      const newKeys = newSelectedRowKeys as string[];

      // If deselecting
      if (newKeys.length < selectedRowKeys.length) {
        Modal.confirm({
          title: 'Warning',
          content: 'All manual changes to those tables will be lost. Continue?',
          onOk: () => {
            const removedIds = selectedRowKeys.filter((id) => !newKeys.includes(id));
            onDeleteTables(removedIds);
            setSelectedRowKeys(newKeys);
          },
          onCancel: () => {
            // Keep the old selection
          },
        });
      } else if (!isAutomaticAddRef.current) {
        // If selecting new rows
        const newIds = newKeys.filter((id) => !selectedRowKeys.includes(id));
        await generateTableByIds(newIds);
        setSelectedRowKeys(newKeys);
      }
    };

    // Generate tables from model IDs
    const generateTableByIds = async (ids: string[]) => {
      try {
        const promises = ids.map(async (id) => {
          try {
            const response = await sqlSchemaApi.getGenTable(id);
            return response.data;
          } catch (err) {
            console.error(`Error fetching tables for model ${id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);

        // Filter out null/undefined values and flatten
        const tableList = results
          .filter((result) => result != null && Array.isArray(result))
          .flat()
          .filter((table) => table != null && table.tableName);

        // Convert table names to lowercase and replace dashes
        tableList.forEach((el: SqlTable) => {
          if (el && el.tableName) {
            el.tableName = el.tableName.toLowerCase().replaceAll('-', '_');
          }
        });

        if (tableList.length === 0) {
          message.warning('No tables were generated');
          return;
        }

        onChange(tableList);
        message.success(`Generated ${tableList.length} table(s) successfully`);
      } catch (error) {
        message.error('Failed to generate tables');
        console.error('Generate tables error:', error);
      }
    };

    // Check if row is selectable
    const isSelectable = (record: EntityModel): boolean => {
      return record.currentState !== 'UNLOCKED';
    };

    // Table columns
    const columns: ColumnsType<EntityModelWithLoading> = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Model Name',
        dataIndex: 'modelName',
        key: 'modelName',
      },
      {
        title: 'Current State',
        dataIndex: 'currentState',
        key: 'currentState',
      },
      {
        title: 'Model Version',
        dataIndex: 'modelVersion',
        key: 'modelVersion',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <>
            {isShowUpdateBtn(record) && (
              <Button
                type="primary"
                danger
                onClick={() => handleUpdateTables(record)}
                loading={record.isLoading}
              >
                Update
              </Button>
            )}
          </>
        ),
      },
    ];

    return (
      <Modal
        title="Models list"
        open={visible}
        onCancel={() => setVisible(false)}
        width="80%"
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
        maskClosable={false}
      >
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          loading={isLoading}
          bordered
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectionChange,
            getCheckboxProps: (record) => ({
              disabled: !isSelectable(record),
            }),
          }}
          pagination={false}
        />
      </Modal>
    );
  }
);

ModelsPopUp.displayName = 'ModelsPopUp';

export default ModelsPopUp;


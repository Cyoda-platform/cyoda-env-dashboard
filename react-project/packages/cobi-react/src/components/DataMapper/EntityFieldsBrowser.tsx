import React, { useState, useEffect } from 'react';
import { Button, Table, Space, message, Modal, Checkbox, Input, Tree, Spin, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { EntityMappingConfigDto } from '../../types';
import { useReportingInfo } from '../../hooks';
import './EntityFieldsBrowser.scss';

interface EntityFieldsBrowserProps {
  entityMapping: EntityMappingConfigDto;
  readOnly?: boolean;
  showAliases?: boolean;
}

interface ColDef {
  fullPath: string;
  colType?: string;
}

interface ReportingInfoRow {
  columnPath: string;
  columnType: string;
  children?: ReportingInfoRow[];
}

const EntityFieldsBrowser: React.FC<EntityFieldsBrowserProps> = ({
  entityMapping,
  readOnly = false,
  showAliases = false,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // Fetch reporting info for the entity class
  const { data: reportingInfo, isLoading } = useReportingInfo(entityMapping.entityClass || '');

  // Initialize colDefs from entityMapping if not present
  useEffect(() => {
    if (!entityMapping.metadata) {
      entityMapping.metadata = [];
    }
  }, [entityMapping]);

  // Get current column definitions - filter out any invalid entries
  const colDefs: ColDef[] = (entityMapping.metadata || []).filter(
    (col: any) => col && typeof col === 'object' && col.fullPath
  );

  // Table columns for selected fields
  const columns: ColumnsType<ColDef> = [
    {
      title: 'Path',
      dataIndex: 'fullPath',
      key: 'fullPath',
      render: (text: string) => {
        if (!text) return '-';
        // Shorten the path for display
        const parts = text.split('.');
        return parts.length > 3 ? `...${parts.slice(-3).join('.')}` : text;
      },
    },
    {
      title: 'Type',
      dataIndex: 'colType',
      key: 'colType',
      width: 200,
      render: (text: string) => {
        if (!text) return '-';
        const parts = text.split('.');
        return parts[parts.length - 1] || '-';
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: ColDef, index: number) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          disabled={readOnly}
          onClick={() => handleRemove(index)}
        >
          Remove
        </Button>
      ),
    },
  ];

  // Convert reporting info to tree data
  const buildTreeData = (rows: ReportingInfoRow[] | undefined, parentPath = ''): any[] => {
    if (!rows || rows.length === 0) return [];

    return rows
      .filter((row) => {
        if (!row || !row.columnPath) return false;
        if (!searchText) return true;
        return row.columnPath.toLowerCase().includes(searchText.toLowerCase());
      })
      .map((row) => {
        const fullPath = parentPath ? `${parentPath}.${row.columnPath}` : row.columnPath;
        const hasChildren = row.children && row.children.length > 0;
        const columnType = row.columnType || 'Unknown';
        const shortType = columnType.includes('.') ? columnType.split('.').pop() : columnType;

        return {
          title: (
            <Space>
              <Checkbox
                checked={selectedFields.includes(fullPath)}
                onChange={(e) => handleFieldToggle(fullPath, columnType, e.target.checked)}
              />
              <span>{row.columnPath}</span>
              <span style={{ color: '#999', fontSize: '12px' }}>
                ({shortType})
              </span>
            </Space>
          ),
          key: fullPath,
          icon: hasChildren ? <FolderOutlined /> : <FileOutlined />,
          children: hasChildren ? buildTreeData(row.children, fullPath) : undefined,
          isLeaf: !hasChildren,
        };
      });
  };

  const treeData = buildTreeData(reportingInfo?.rows);

  const handleFieldToggle = (fullPath: string, colType: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fullPath]);
    } else {
      setSelectedFields(selectedFields.filter((f) => f !== fullPath));
    }
  };

  const handleRemove = (index: number) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to remove this field?',
      onOk: () => {
        const newColDefs = [...colDefs];
        newColDefs.splice(index, 1);
        entityMapping.metadata = newColDefs;
        message.success('Field removed successfully');
      },
    });
  };

  const handleOpenDialog = () => {
    if (!entityMapping.entityClass) {
      message.warning('Please select an entity class first');
      return;
    }
    // Initialize selected fields from current colDefs
    setSelectedFields(colDefs.map((col) => col.fullPath).filter(Boolean));
    setIsModalVisible(true);
  };

  const handleAddFields = () => {
    // Convert selected fields to ColDef format
    const newColDefs: ColDef[] = selectedFields.map((fullPath) => {
      // Find the column type from reporting info
      const findType = (rows: ReportingInfoRow[] | undefined, path: string): string => {
        if (!rows) return '';
        for (const row of rows) {
          const currentPath = row.columnPath;
          if (path === currentPath || path.endsWith(`.${currentPath}`)) {
            return row.columnType;
          }
          if (row.children) {
            const childType = findType(row.children, path);
            if (childType) return childType;
          }
        }
        return '';
      };

      return {
        fullPath,
        colType: findType(reportingInfo?.rows, fullPath),
      };
    });

    entityMapping.metadata = newColDefs;
    setIsModalVisible(false);
    message.success(`${newColDefs.length} field(s) added successfully`);
  };

  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select fields to delete');
      return;
    }

    Modal.confirm({
      title: 'Confirm',
      content: `Do you really want to remove ${selectedRowKeys.length} field(s)?`,
      onOk: () => {
        const newColDefs = colDefs.filter((_, index) => !selectedRowKeys.includes(index));
        entityMapping.metadata = newColDefs;
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} field(s) removed successfully`);
      },
    });
  };

  return (
    <div className="entity-fields-browser">
      <div className="browser-header">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenDialog}
          disabled={!entityMapping.entityClass || readOnly}
        >
          Add Column Definitions
        </Button>
        {selectedRowKeys.length > 0 && (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBulkDelete}
            disabled={readOnly}
          >
            Remove Selected ({selectedRowKeys.length})
          </Button>
        )}
      </div>

      <h3 style={{ marginTop: 16, marginBottom: 12 }}>Selected Columns:</h3>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectionChange,
        }}
        columns={columns}
        dataSource={colDefs.map((col, index) => ({ ...col, key: index }))}
        pagination={false}
        size="small"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No columns selected. Click 'Add Column Definitions' to add fields."
            />
          ),
        }}
      />

      {/* Field Selection Modal */}
      <Modal
        title="Select Entity Fields"
        open={isModalVisible}
        onOk={handleAddFields}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Add Selected"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search fields..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin tip="Loading entity fields..." />
          </div>
        ) : treeData.length > 0 ? (
          <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '12px' }}>
            <Tree
              showIcon
              defaultExpandAll={false}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              treeData={treeData}
              selectable={false}
            />
          </div>
        ) : (
          <Empty description="No fields available for this entity class" />
        )}

        <div style={{ marginTop: 16, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Selected: {selectedFields.length} field(s)</strong>
        </div>
      </Modal>
    </div>
  );
};

export default EntityFieldsBrowser;


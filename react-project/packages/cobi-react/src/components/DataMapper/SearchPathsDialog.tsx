import React, { useState, useMemo } from 'react';
import { Modal, Input, Table, Button } from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { EntityMappingConfigDto } from '../../types';
import './SearchPathsDialog.css';

interface PathRelation {
  srcColumnPath: string;
  dstColumnPath: string;
  statements: string[];
  type: 'column' | 'functional' | 'metadata';
}

interface SearchPathsDialogProps {
  visible: boolean;
  entityMapping: EntityMappingConfigDto | null;
  onClose: () => void;
  onFindSourcePath?: (path: string) => void;
  onFindTargetPath?: (path: string) => void;
}

const SearchPathsDialog: React.FC<SearchPathsDialogProps> = ({
  visible,
  entityMapping,
  onClose,
  onFindSourcePath,
  onFindTargetPath,
}) => {
  const [searchText, setSearchText] = useState('');

  const allRelations = useMemo(() => {
    if (!entityMapping) return [];

    const relations: PathRelation[] = [];

    // Column mappings
    entityMapping.columns.forEach((col) => {
      relations.push({
        srcColumnPath: col.srcColumnPath,
        dstColumnPath: col.dstCyodaColumnPath,
        statements: [],
        type: 'column',
      });
    });

    // Functional mappings
    entityMapping.functionalMappings.forEach((fm) => {
      fm.srcPaths.forEach((srcPath) => {
        relations.push({
          srcColumnPath: srcPath,
          dstColumnPath: fm.dstPath,
          statements: fm.statements.map((s) => JSON.stringify(s).substring(0, 50)),
          type: 'functional',
        });
      });
    });

    return relations;
  }, [entityMapping]);

  const filteredRelations = useMemo(() => {
    if (!searchText) return allRelations;

    const lowerSearch = searchText.toLowerCase();
    return allRelations.filter((rel) => {
      return (
        rel.srcColumnPath.toLowerCase().includes(lowerSearch) ||
        rel.dstColumnPath.toLowerCase().includes(lowerSearch) ||
        rel.statements.some((s) => s.toLowerCase().includes(lowerSearch))
      );
    });
  }, [allRelations, searchText]);

  const columns: ColumnsType<PathRelation> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const colors = {
          column: 'green',
          functional: 'orange',
          metadata: 'blue',
        };
        return (
          <span
            style={{
              color: colors[type as keyof typeof colors],
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {type}
          </span>
        );
      },
    },
    {
      title: 'Source Path',
      dataIndex: 'srcColumnPath',
      key: 'srcColumnPath',
      render: (path: string) => (
        <Button
          type="link"
          icon={<LinkOutlined />}
          onClick={() => onFindSourcePath?.(path)}
        >
          {path}
        </Button>
      ),
    },
    {
      title: 'Target Path',
      dataIndex: 'dstColumnPath',
      key: 'dstColumnPath',
      render: (path: string) => (
        <Button
          type="link"
          icon={<LinkOutlined />}
          onClick={() => onFindTargetPath?.(path)}
        >
          {path}
        </Button>
      ),
    },
    {
      title: 'Statements',
      dataIndex: 'statements',
      key: 'statements',
      width: 200,
      render: (statements: string[]) => (
        <div className="statements-preview">
          {statements.length > 0 ? (
            <ul>
              {statements.slice(0, 3).map((s, i) => (
                <li key={i}>{s}...</li>
              ))}
              {statements.length > 3 && <li>+{statements.length - 3} more</li>}
            </ul>
          ) : (
            <span style={{ color: '#999' }}>No statements</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="Search Paths and Statements"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={1100}
      className="search-paths-dialog"
    >
      <div className="search-header">
        <Input
          placeholder="Filter for paths and statements"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredRelations}
        rowKey={(record) => `${record.srcColumnPath}-${record.dstColumnPath}`}
        pagination={{ pageSize: 20 }}
        size="small"
      />
    </Modal>
  );
};

export default SearchPathsDialog;


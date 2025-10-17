import React, { useState, useMemo } from 'react';
import { Modal, Input, Table, Button, Tag } from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { EntityMappingConfigDto, FunctionalMappingConfigDto } from '../../types';
import { shortNamePath } from '../../utils/formatHelper';
import './SearchPathsDialog.css';

interface PathRelation {
  srcColumnPath: string;
  dstColumnPath: string;
  statements: string[];
  type: 'column' | 'functional' | 'metadata';
  fullSrcPath: string;
  fullDstPath: string;
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

  // Helper function to extract all @bean statements from functional mapping
  const getAllStatements = (functionalMapping: FunctionalMappingConfigDto): string[] => {
    const statementsText = JSON.stringify(functionalMapping.statements);
    const matchAll = [...statementsText.matchAll(/"@bean":"([^"]*)"/g)];
    const uniqueStatements = Array.from(new Set(matchAll.map((el) => el[1])));
    return uniqueStatements.map((s) => shortNamePath(s));
  };

  const allRelations = useMemo(() => {
    if (!entityMapping) return [];

    const relations: PathRelation[] = [];

    // Column mappings
    entityMapping.columns.forEach((col) => {
      relations.push({
        srcColumnPath: shortNamePath(col.srcColumnPath),
        dstColumnPath: shortNamePath(col.dstCyodaColumnPath),
        fullSrcPath: col.srcColumnPath,
        fullDstPath: col.dstCyodaColumnPath,
        statements: [],
        type: 'column',
      });
    });

    // Functional mappings - group by destination path
    entityMapping.functionalMappings.forEach((fm) => {
      const statements = getAllStatements(fm);

      // If there are source paths, create a relation for the first one
      // (Vue version seems to show one row per functional mapping, not per source path)
      if (fm.srcPaths.length > 0) {
        relations.push({
          srcColumnPath: shortNamePath(fm.srcPaths[0]),
          dstColumnPath: shortNamePath(fm.dstPath),
          fullSrcPath: fm.srcPaths[0],
          fullDstPath: fm.dstPath,
          statements,
          type: 'functional',
        });
      } else {
        // No source paths, just show destination
        relations.push({
          srcColumnPath: '',
          dstColumnPath: shortNamePath(fm.dstPath),
          fullSrcPath: '',
          fullDstPath: fm.dstPath,
          statements,
          type: 'functional',
        });
      }
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
        rel.fullSrcPath.toLowerCase().includes(lowerSearch) ||
        rel.fullDstPath.toLowerCase().includes(lowerSearch) ||
        rel.statements.some((s) => s.toLowerCase().includes(lowerSearch))
      );
    });
  }, [allRelations, searchText]);

  const handleFindSourcePath = (fullPath: string) => {
    if (onFindSourcePath) {
      onFindSourcePath(fullPath);
      onClose(); // Close dialog after clicking
    }
  };

  const handleFindTargetPath = (fullPath: string) => {
    if (onFindTargetPath) {
      onFindTargetPath(fullPath);
      onClose(); // Close dialog after clicking
    }
  };

  const columns: ColumnsType<PathRelation> = [
    {
      title: 'Source',
      dataIndex: 'srcColumnPath',
      key: 'srcColumnPath',
      width: '40%',
      render: (path: string, record: PathRelation) => {
        if (!path) return <span style={{ color: '#999' }}>-</span>;
        return (
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => handleFindSourcePath(record.fullSrcPath)}
            style={{ padding: 0 }}
          >
            {path}
          </Button>
        );
      },
    },
    {
      title: 'Target',
      dataIndex: 'dstColumnPath',
      key: 'dstColumnPath',
      width: '40%',
      render: (path: string, record: PathRelation) => (
        <Button
          type="link"
          icon={<LinkOutlined />}
          onClick={() => handleFindTargetPath(record.fullDstPath)}
          style={{ padding: 0 }}
        >
          {path}
        </Button>
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
      width="90%"
      className="search-paths-dialog"
    >
      <div className="search-header">
        <Input
          placeholder="Filter for paths and statements"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredRelations}
        rowKey={(record, index) => `${record.fullSrcPath}-${record.fullDstPath}-${index}`}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} relations` }}
        size="small"
        bordered
        expandable={{
          expandedRowRender: (record) => {
            if (record.statements.length === 0) {
              return <div style={{ margin: '12px 20px', color: '#999' }}>No statements</div>;
            }
            return (
              <div className="statements-expanded">
                <Table
                  dataSource={record.statements.map((stmt, idx) => ({ index: idx + 1, statement: stmt }))}
                  columns={[
                    {
                      title: '#',
                      dataIndex: 'index',
                      key: 'index',
                      width: 50,
                    },
                    {
                      title: 'Statements',
                      dataIndex: 'statement',
                      key: 'statement',
                      render: (text: string) => (
                        <code style={{ fontSize: '12px', color: '#1890ff' }}>{text}</code>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                  showHeader={true}
                  rowKey="index"
                />
              </div>
            );
          },
          rowExpandable: (record) => record.statements.length > 0,
        }}
      />
    </Modal>
  );
};

export default SearchPathsDialog;


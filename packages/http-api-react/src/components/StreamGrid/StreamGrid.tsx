/**
 * StreamGrid Component
 * Modal for displaying stream report results in a grid
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/ConfigEditor/ConfigEditorReportsStreamGrid.vue
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Modal, Table, Button, Select, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './StreamGrid.scss';

const { Option } = Select;

export interface StreamGridProps {
  title?: string;
  hasFilterBuilder?: boolean;
  isDeleteAvailable?: boolean;
}

export interface StreamGridRef {
  dialogVisible: boolean;
  setDialogVisible: (visible: boolean) => void;
  configDefinitionRequest: any;
  setConfigDefinitionRequest: (request: any) => void;
  onlyUniq: boolean;
  setOnlyUniq: (value: boolean) => void;
  loadPage: () => void;
}

export const StreamGrid = forwardRef<StreamGridRef, StreamGridProps>(
  ({ title = 'Report Stream Result', hasFilterBuilder = false, isDeleteAvailable = false }, ref) => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [configDefinitionRequest, setConfigDefinitionRequest] = useState<any>(null);
    const [onlyUniq, setOnlyUniq] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [tableData, setTableData] = useState<any[]>([]);
    const [columns, setColumns] = useState<ColumnsType<any>>([]);
    const [lastRequest, setLastRequest] = useState<any>(null);

    const optionsPageSize = [20, 50, 100, 200, 300];

    const loadPage = async () => {
      if (!configDefinitionRequest) return;

      setIsLoading(true);
      try {
        // TODO: Implement actual API call
        // For now, use mock data
        const mockData = Array.from({ length: pageSize }, (_, i) => ({
          id: `${page * pageSize + i + 1}`,
          name: `Item ${page * pageSize + i + 1}`,
          value: Math.random() * 1000,
        }));

        setTableData(mockData);

        // Generate columns from data
        if (mockData.length > 0) {
          const cols: ColumnsType<any> = Object.keys(mockData[0]).map((key) => ({
            title: key,
            dataIndex: key,
            key,
            sorter: (a, b) => {
              const aVal = a[key];
              const bVal = b[key];
              if (typeof aVal === 'string') {
                return aVal.localeCompare(bVal);
              }
              return aVal - bVal;
            },
          }));
          setColumns(cols);
        }

        setLastRequest({ rows: mockData });
      } catch (error) {
        console.error('Failed to load stream grid data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handlePageSizeChange = (value: number) => {
      setPageSize(value);
      setPage(0);
    };

    const handlePrev = () => {
      if (page > 0) {
        setPage(page - 1);
      }
    };

    const handleNext = () => {
      setPage(page + 1);
    };

    const handleClose = () => {
      setDialogVisible(false);
    };

    // Reload when page or pageSize changes
    useEffect(() => {
      if (dialogVisible && configDefinitionRequest) {
        loadPage();
      }
    }, [page, pageSize, dialogVisible, configDefinitionRequest]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      dialogVisible,
      setDialogVisible,
      configDefinitionRequest,
      setConfigDefinitionRequest,
      onlyUniq,
      setOnlyUniq,
      loadPage,
    }));

    const isDisableNextPage = tableData.length < pageSize;

    return (
      <Modal
        title={
          <span>
            {title} | <span className="page-size">Page Size: {pageSize}</span>
          </span>
        }
        open={dialogVisible}
        onCancel={handleClose}
        width="80%"
        footer={
          <div className="stream-grid-footer">
            <span className="page-info">Current page: {page + 1}</span>
            <Form layout="inline">
              <Form.Item label="Page Size">
                <Select value={pageSize} onChange={handlePageSizeChange} style={{ width: 100 }}>
                  {optionsPageSize.map((size) => (
                    <Option key={size} value={size}>
                      {size}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <div className="wrap-buttons">
              <Button type="primary" disabled={page === 0} onClick={handlePrev}>
                Previous {pageSize}
              </Button>
              <Button type="primary" disabled={isDisableNextPage} onClick={handleNext}>
                Next {pageSize}
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        }
        className="stream-grid-modal"
      >
        <Table
          loading={isLoading}
          dataSource={tableData}
          bordered
          columns={columns}
          pagination={false}
          scroll={{ x: true, y: 400 }}
          rowKey="id"
        />
      </Modal>
    );
  }
);

StreamGrid.displayName = 'StreamGrid';


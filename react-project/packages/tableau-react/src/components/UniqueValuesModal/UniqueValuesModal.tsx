/**
 * UniqueValuesModal Component
 * Modal that displays unique values for a field in a table
 * Opens when user clicks the eye icon in ModellingItem
 */

import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Space, Spin, Select } from 'antd';
import type { TableColumnsType } from 'antd';
import './UniqueValuesModal.scss';

export interface UniqueValuesModalProps {
  visible: boolean;
  fieldName: string;
  fieldPath: string;
  entityClass: string;
  onClose: () => void;
  onLoadData?: (entityClass: string, fieldPath: string, page: number, pageSize: number) => Promise<any[]>;
}

export const UniqueValuesModal: React.FC<UniqueValuesModalProps> = ({
  visible,
  fieldName,
  fieldPath,
  entityClass,
  onClose,
  onLoadData,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [total, setTotal] = useState(0);

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, currentPage, pageSize]);

  const loadData = async () => {
    if (!onLoadData) {
      console.error('No onLoadData function provided to UniqueValuesModal');
      setData([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const result = await onLoadData(entityClass, fieldPath, currentPage - 1, pageSize);

      // Transform the result into table data
      // The API returns an array of values, we need to convert to objects with the field name as key
      const tableData = result.map((value, index) => ({
        key: index,
        [fieldName]: value,
      }));

      setData(tableData);
      setTotal(result.length);
    } catch (error) {
      console.error('Failed to load unique values:', error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnsType<any> = [
    {
      title: fieldName,
      dataIndex: fieldName,
      key: fieldName,
      render: (value: any) => {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      },
    },
  ];

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const pageSizeOptions = [
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '300', value: 300 },
  ];

  const title = `Unique values for "${fieldName}" for ${pageSize} rows | Page Size: ${pageSize}`;

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      className="unique-values-modal"
    >
      <Spin spinning={loading}>
        <div className="unique-values-content">
          {data.length === 0 && !loading ? (
            <div className="no-data">No Data</div>
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              scroll={{ y: 400 }}
              size="small"
            />
          )}
        </div>

        <div className="unique-values-footer">
          <div className="footer-left">
            <span className="page-info">Current page: {currentPage}</span>
          </div>
          <div className="footer-center">
            <span className="page-size-label">Page Size</span>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              options={pageSizeOptions}
              style={{ width: 80 }}
              className="page-size-select"
            />
          </div>
          <div className="footer-right">
            <Space>
              <Button onClick={handlePrevious} disabled={currentPage === 1}>
                Previous {pageSize}
              </Button>
              <Button onClick={handleNext}>
                Next {pageSize}
              </Button>
              <Button onClick={onClose}>Close</Button>
            </Space>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};


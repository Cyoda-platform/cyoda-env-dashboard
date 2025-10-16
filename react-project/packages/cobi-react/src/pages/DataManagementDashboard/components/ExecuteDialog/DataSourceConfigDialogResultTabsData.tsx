import React, { useState, useMemo } from 'react';
import { Table, Input, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './DataSourceConfigDialogResultTabsData.css';

interface DataSourceConfigDialogResultTabsDataProps {
  data: any[];
}

const DataSourceConfigDialogResultTabsData: React.FC<DataSourceConfigDialogResultTabsDataProps> = ({ data }) => {
  const [filter, setFilter] = useState('');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsData, setDetailsData] = useState<any>(null);

  // Generate columns from first data row
  const columns: ColumnsType<any> = useMemo(() => {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      width: 200,
      ellipsis: true,
      render: (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'object') {
          return (
            <a
              onClick={() => {
                setDetailsData({ key, value });
                setDetailsVisible(true);
              }}
            >
              [Object]
            </a>
          );
        }
        return String(value);
      },
    }));
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filter) return data;

    return data.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(filter.toLowerCase());
      });
    });
  }, [data, filter]);

  // Add keys to data
  const dataWithKeys = useMemo(() => {
    return filteredData.map((row, index) => ({
      ...row,
      key: index,
    }));
  }, [filteredData]);

  return (
    <div className="data-source-config-dialog-result-tabs-data">
      <div className="filter">
        <Input
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={dataWithKeys}
        scroll={{ x: 'max-content', y: 400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />
      <Modal
        title={`Details: ${detailsData?.key || ''}`}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        <pre style={{ maxHeight: '500px', overflow: 'auto' }}>
          {JSON.stringify(detailsData?.value, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};

export default DataSourceConfigDialogResultTabsData;


/**
 * Sample Data Preview Component
 * Displays a preview of sample data from uploaded files
 */

import React from 'react';
import { Table, Card, Typography, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './SampleDataPreview.css';

const { Title, Text } = Typography;

interface SampleDataPreviewProps {
  data: any;
  maxRows?: number;
}

const SampleDataPreview: React.FC<SampleDataPreviewProps> = ({ data, maxRows = 10 }) => {
  if (!data) {
    return (
      <Card>
        <Empty description="No sample data available" />
      </Card>
    );
  }

  // Handle different data formats
  let columns: ColumnsType<any> = [];
  let dataSource: any[] = [];

  if (data.columnNames && data.rows) {
    // CSV format
    columns = data.columnNames.map((name: string) => ({
      title: name,
      dataIndex: name,
      key: name,
      ellipsis: true,
      width: 150,
    }));

    dataSource = data.rows.slice(0, maxRows).map((row: any[], index: number) => {
      const record: any = { key: index };
      data.columnNames.forEach((name: string, i: number) => {
        record[name] = row[i];
      });
      return record;
    });
  } else if (Array.isArray(data)) {
    // Array of objects format
    if (data.length > 0) {
      const firstRow = data[0];
      columns = Object.keys(firstRow).map((key) => ({
        title: key,
        dataIndex: key,
        key,
        ellipsis: true,
        width: 150,
      }));

      dataSource = data.slice(0, maxRows).map((row, index) => ({
        ...row,
        key: index,
      }));
    }
  }

  return (
    <Card className="sample-data-preview">
      <div className="preview-header">
        <Title level={5}>Sample Data Preview</Title>
        <Text type="secondary">
          Showing {dataSource.length} of {data.rows?.length || data.length || 0} rows
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 'max-content', y: 400 }}
        size="small"
        bordered
      />
    </Card>
  );
};

export default SampleDataPreview;


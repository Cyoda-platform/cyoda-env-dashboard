import React, { useState, useMemo, useEffect } from 'react';
import { Table, DatePicker, Select, Button, Space, Modal, message, Tag } from 'antd';
import { DeleteOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { getStatisticsSearch, deleteRequestDeleteById } from '../../../api/dataSourceConfigApi';
import type { ColumnsType } from 'antd/es/table';
import './ConnectionExecutions.css';

const { RangePicker } = DatePicker;

interface ConnectionExecutionsProps {}

interface DataSourceRequestStatistic {
  rootRawRequestId: string;
  timeStatistic: {
    startProcessing: number;
    finishProcessing: number;
  };
  status: string;
  dataSourceNames: string[];
  mappingConfigNames: string[];
  classNames: string[];
  totalCreatedEntitiesCount: number;
  totalUpdatedEntitiesCount: number;
}

const ConnectionExecutions: React.FC<ConnectionExecutionsProps> = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Build filter object
  const filter = useMemo(() => {
    const filterObj: any = {};
    if (dateRange[0]) {
      filterObj.from = dateRange[0].utcOffset('+0200').format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (dateRange[1]) {
      filterObj.to = dateRange[1].utcOffset('+0200').format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (statusFilter) {
      filterObj.status = statusFilter;
    }
    return filterObj;
  }, [dateRange, statusFilter]);

  // Fetch statistics
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['connectionExecutions', currentPage, pageSize, filter],
    queryFn: async () => {
      const response = await getStatisticsSearch({
        pagination: { page: currentPage, pageSize },
        filter,
      });
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (rootRawRequestId: string) => deleteRequestDeleteById(rootRawRequestId),
    onSuccess: () => {
      message.success('Execution deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['connectionExecutions'] });
    },
    onError: () => {
      message.error('Failed to delete execution');
    },
  });

  const handleDelete = (record: DataSourceRequestStatistic) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Do you really want to delete selected row?',
      onOk: () => {
        deleteMutation.mutate(record.rootRawRequestId);
      },
    });
  };

  const handleViewConfig = (record: DataSourceRequestStatistic) => {
    message.info('View config functionality not yet implemented');
  };

  const handleViewDetails = (record: DataSourceRequestStatistic) => {
    message.info('View details functionality not yet implemented');
  };

  const arrayNormalizer = (arr: string[] | undefined) => {
    if (!arr || arr.length === 0) return '-';
    return arr.join(', ');
  };

  const statusOptions = [
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Success', value: 'SUCCESS' },
    { label: 'Failed', value: 'FAILED' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'IN_PROGRESS':
        return 'processing';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<DataSourceRequestStatistic> = [
    {
      title: 'Event Id',
      dataIndex: 'rootRawRequestId',
      key: 'rootRawRequestId',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Start timestamp',
      key: 'startTimestamp',
      width: 200,
      render: (_, record) =>
        record.timeStatistic?.startProcessing
          ? dayjs(record.timeStatistic.startProcessing).format('DD.MM.YYYY HH:mm:ss')
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Data Source',
      dataIndex: 'dataSourceNames',
      key: 'dataSourceNames',
      width: 200,
      render: (names: string[]) => arrayNormalizer(names),
    },
    {
      title: 'Mapping operations',
      dataIndex: 'mappingConfigNames',
      key: 'mappingConfigNames',
      width: 300,
      render: (names: string[]) => arrayNormalizer(names),
    },
    {
      title: 'Entity Classes',
      dataIndex: 'classNames',
      key: 'classNames',
      width: 400,
      ellipsis: true,
      render: (names: string[]) => arrayNormalizer(names),
    },
    {
      title: 'Created',
      dataIndex: 'totalCreatedEntitiesCount',
      key: 'totalCreatedEntitiesCount',
      width: 100,
      align: 'right',
    },
    {
      title: 'Updated',
      dataIndex: 'totalUpdatedEntitiesCount',
      key: 'totalUpdatedEntitiesCount',
      width: 100,
      align: 'right',
    },
    {
      title: 'Duration (ms)',
      key: 'duration',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.timeStatistic?.finishProcessing && record.timeStatistic?.startProcessing
          ? (record.timeStatistic.finishProcessing - record.timeStatistic.startProcessing).toLocaleString()
          : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleteMutation.isPending}
            size="small"
          />
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => handleViewConfig(record)}
            size="small"
          />
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  const tableData = useMemo(() => {
    if (!data?._embedded?.dataSourceRequestStatisticDtoes) return [];
    return data._embedded.dataSourceRequestStatisticDtoes.slice(0, pageSize);
  }, [data, pageSize]);

  const totalElements = data?.page?.totalElements || 0;

  return (
    <div className="connection-executions">
      <div className="filter-section">
        <h3>Filter</h3>
        <Space wrap>
          <div>
            <label>Date Range:</label>
            <RangePicker
              showTime
              format="DD.MM.YYYY HH:mm:ss"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
              style={{ width: 400 }}
            />
          </div>
          <div>
            <label>Status:</label>
            <Select
              placeholder="Select status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: 200 }}
              options={statusOptions}
            />
          </div>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="rootRawRequestId"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showTotal: (total) => `Total ${total} items`,
        }}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ConnectionExecutions;


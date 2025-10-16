import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Space, Tag, message } from 'antd';
import { HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './HistoryDialog.css';

interface HistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  changes: number;
  version: number;
}

interface HistoryDialogProps {
  visible: boolean;
  entityMappingId?: string;
  onClose: () => void;
  onRestore?: (version: number) => void;
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  visible,
  entityMappingId,
  onClose,
  onRestore,
}) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (visible && entityMappingId) {
      loadHistory();
    }
  }, [visible, entityMappingId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await api.getEntityMappingHistory(entityMappingId);
      // setHistory(response.data);

      // Mock data for now
      const mockHistory: HistoryEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          user: 'admin',
          action: 'Updated mapping',
          changes: 5,
          version: 3,
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          user: 'admin',
          action: 'Added transformers',
          changes: 3,
          version: 2,
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          user: 'admin',
          action: 'Created mapping',
          changes: 10,
          version: 1,
        },
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
      message.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version: number) => {
    Modal.confirm({
      title: 'Restore Version',
      content: `Are you sure you want to restore version ${version}? This will overwrite the current configuration.`,
      onOk: () => {
        if (onRestore) {
          onRestore(version);
          message.success(`Restored to version ${version}`);
          onClose();
        }
      },
    });
  };

  const columns: ColumnsType<HistoryEntry> = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: number) => <Tag color="blue">v{version}</Tag>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 150,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      width: 100,
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<RollbackOutlined />}
            onClick={() => handleRestore(record.version)}
          >
            Restore
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>Mapping History</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
      className="history-dialog"
    >
      <Table
        columns={columns}
        dataSource={history}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Modal>
  );
};

export default HistoryDialog;


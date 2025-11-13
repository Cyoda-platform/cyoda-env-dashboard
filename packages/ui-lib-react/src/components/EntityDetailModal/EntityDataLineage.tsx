/**
 * EntityDataLineage Component
 * Shows entity transaction history and allows comparing versions
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/DataLineage/DataLineage.vue
 */

import React, { useState, useEffect } from 'react';
import { Timeline, Checkbox, Button, DatePicker, Row, Col, Modal, Table, Tag, Spin } from 'antd';
import axios from 'axios';
import moment from 'moment';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import './EntityDataLineage.scss';

const { RangePicker } = DatePicker;

interface Transaction {
  transactionId: string;
  dateTime: string;
  changeCount: number;
  timestamp: number;
}

interface TransactionDiff {
  changedFields: Array<{
    columnPath: string;
    columnPathContainer: {
      elements: Array<{ columnName: string; type: string }>;
      shortPath: string;
      prevValue: any;
      currValue: any;
    };
  }>;
}

interface EntityDataLineageProps {
  entityClass: string;
  entityId: string;
}

const EntityDataLineage: React.FC<EntityDataLineageProps> = ({ entityClass, entityId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [compareData, setCompareData] = useState<TransactionDiff | null>(null);

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      if (!entityClass || !entityId) return;

      setLoading(true);
      try {
        const { data } = await axios.get('/platform-api/fetch/transactions', {
          params: { entityClass, entityId },
        });
        // Ensure data is an array
        const transactions = Array.isArray(data) ? data : [];
        setTransactions(transactions);
        setFilteredTransactions(transactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [entityClass, entityId]);

  // Filter transactions by date range
  useEffect(() => {
    let filtered = [...transactions];

    if (dateRange[0]) {
      const fromTimestamp = dateRange[0].valueOf();
      filtered = filtered.filter((tx) => tx.timestamp >= fromTimestamp);
    }

    if (dateRange[1]) {
      const toTimestamp = dateRange[1].valueOf();
      filtered = filtered.filter((tx) => tx.timestamp <= toTimestamp);
    }

    setFilteredTransactions(filtered);
  }, [dateRange, transactions]);

  // Handle transaction selection
  const handleTransactionSelect = (transaction: Transaction, checked: boolean) => {
    if (checked) {
      if (selectedTransactions.length < 2) {
        setSelectedTransactions([...selectedTransactions, transaction]);
      }
    } else {
      setSelectedTransactions(selectedTransactions.filter((tx) => tx.transactionId !== transaction.transactionId));
    }
  };

  // Compute sorted transactions for display in compare modal
  const sortedSelectedTransactions = React.useMemo(() => {
    return [...selectedTransactions].sort((a, b) => a.timestamp - b.timestamp);
  }, [selectedTransactions]);

  // Handle compare
  const handleCompare = async () => {
    if (selectedTransactions.length !== 2) return;

    // Sort by timestamp to ensure correct order
    const sorted = sortedSelectedTransactions;

    setCompareLoading(true);
    try {
      const { data } = await axios.get('/platform-api/transactions/diff', {
        params: {
          entityClass,
          entityId,
          firstTx: sorted[0].transactionId,
          lastTx: sorted[1].transactionId,
        },
      });
      setCompareData(data);
      setCompareVisible(true);
    } catch (error) {
      console.error('Failed to compare transactions:', error);
    } finally {
      setCompareLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateTime: string) => {
    return moment(dateTime, 'DD-MM-YYYY HH:mm:ss.SSS').format('DD/MM/YYYY HH:mm:ss');
  };

  // Render value in comparison table
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <Tag color="default">null</Tag>;
    }
    if (typeof value === 'object') {
      return <pre style={{ margin: 0, fontSize: '12px' }}>{JSON.stringify(value, null, 2)}</pre>;
    }
    return String(value);
  };

  // Comparison modal columns
  const compareColumns = [
    {
      title: 'Field',
      dataIndex: 'columnPath',
      key: 'columnPath',
      width: 200,
    },
    {
      title: 'Old Value',
      dataIndex: 'prevValue',
      key: 'prevValue',
      render: renderValue,
    },
    {
      title: 'New Value',
      dataIndex: 'currValue',
      key: 'currValue',
      render: renderValue,
    },
  ];

  const compareTableData = compareData?.changedFields.map((field, index) => ({
    key: index,
    columnPath: field.columnPathContainer.shortPath,
    prevValue: field.columnPathContainer.prevValue,
    currValue: field.columnPathContainer.currValue,
  })) || [];

  return (
    <div className="entity-data-lineage">
      <Spin spinning={loading}>
        <Row gutter={20}>
          <Col span={6}>
            <div className="filter-section">
              <h4>Filter</h4>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [moment.Moment | null, moment.Moment | null])}
                format="DD/MM/YYYY"
              />
            </div>
          </Col>
          <Col span={18}>
            <div className="transactions-section">
              <div className="header">
                <strong>Current version</strong>
              </div>
              <div className="body">
                <Timeline>
                  {filteredTransactions.map((transaction) => {
                    const isChecked = selectedTransactions.some(
                      (tx) => tx.transactionId === transaction.transactionId
                    );
                    const isDisabled = !isChecked && selectedTransactions.length >= 2;

                    return (
                      <Timeline.Item key={transaction.transactionId}>
                        <div className="transaction-item">
                          <div className="date">{formatDate(transaction.dateTime)}</div>
                          <div className="info">
                            <span>No. changed fields [{transaction.changeCount}]</span>
                            <Checkbox
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e: CheckboxChangeEvent) =>
                                handleTransactionSelect(transaction, e.target.checked)
                              }
                            />
                          </div>
                        </div>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
                <Button
                  type="primary"
                  loading={compareLoading}
                  disabled={selectedTransactions.length !== 2}
                  onClick={handleCompare}
                  style={{ marginTop: 16 }}
                >
                  Compare
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Spin>

      {/* Compare Modal */}
      <Modal
        title="Compare Versions"
        open={compareVisible}
        onCancel={() => setCompareVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setCompareVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={compareColumns}
          dataSource={compareTableData}
          scroll={{ x: true, y: 400 }}
          pagination={false}
          bordered
          size="small"
        />
      </Modal>
    </div>
  );
};

export default EntityDataLineage;


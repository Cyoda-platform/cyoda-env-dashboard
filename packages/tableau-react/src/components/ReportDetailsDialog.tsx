/**
 * ReportDetailsDialog Component
 * Modal dialog showing report configuration details (grouping, sorting, conditions)
 * Migrated from: .old_project/packages/http-api/src/views/History/HistoryTable.vue (lines 37-84)
 */

import React, { useState } from 'react';
import { Modal, Tabs, Button, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import type { ConfigDefinition } from '@/types';
import './ReportDetailsDialog.scss';

const { Text } = Typography;

interface ReportDetailsDialogProps {
  visible: boolean;
  reportId: string;
  reportConfig: string;
  groupingColumns: string[];
  configDefinition: ConfigDefinition | null;
  onClose: () => void;
}

const ReportDetailsDialog: React.FC<ReportDetailsDialogProps> = ({
  visible,
  reportId,
  reportConfig,
  groupingColumns,
  configDefinition,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('groupBy');

  // Handle copy report ID to clipboard
  const handleCopyId = () => {
    navigator.clipboard.writeText(reportId).then(
      () => {
        message.success('Report ID copied to clipboard');
      },
      () => {
        message.error('Failed to copy Report ID');
      }
    );
  };

  // Format condition for syntax highlighting
  const formatCondition = (condition: any) => {
    const jsonString = JSON.stringify(condition, null, 2);
    return Prism.highlight(jsonString, Prism.languages.javascript, 'javascript');
  };

  // Get sorting array from config definition
  const getSortingArray = () => {
    if (!configDefinition?.sorting || !Array.isArray(configDefinition.sorting)) {
      return [];
    }
    return configDefinition.sorting.map((sort: any) => {
      const columnName = sort.column?.name || 'Unknown';
      const direction = sort.reverse ? 'DESC' : 'ASC';
      return `${columnName} (${direction})`;
    });
  };

  // Get conditions from config definition
  const getConditions = () => {
    if (!configDefinition?.condition?.conditions) {
      return [];
    }
    return configDefinition.condition.conditions;
  };

  const sortingArray = getSortingArray();
  const conditions = getConditions();

  const tabItems = [
    {
      key: 'groupBy',
      label: 'Group by',
      children: (
        <div className="tab-content">
          {groupingColumns && groupingColumns.length > 0 ? (
            <ul>
              {groupingColumns.map((column, index) => (
                <li key={index}>{column}</li>
              ))}
            </ul>
          ) : (
            <Text type="secondary">Grouping not in use</Text>
          )}
        </div>
      ),
    },
    {
      key: 'sortBy',
      label: 'Sort by',
      children: (
        <div className="tab-content">
          {sortingArray.length > 0 ? (
            <ul>
              {sortingArray.map((sort, index) => (
                <li key={index}>{sort}</li>
              ))}
            </ul>
          ) : (
            <Text type="secondary">Sorting not in use</Text>
          )}
        </div>
      ),
    },
    {
      key: 'conditions',
      label: 'Conditions',
      children: (
        <div className="tab-content">
          {conditions.length > 0 ? (
            <div className="conditions-container">
              {conditions.map((condition, index) => (
                <pre key={index} className="conditions-pre language-javascript">
                  <code
                    className="language-javascript"
                    dangerouslySetInnerHTML={{ __html: formatCondition(condition) }}
                  />
                </pre>
              ))}
            </div>
          ) : (
            <Text type="secondary">Conditions not in use</Text>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="report-details-header">
          <div className="report-config-name">{reportConfig}</div>
          <div className="report-id">
            <Text type="secondary">ID: {reportId}</Text>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyId}
              className="copy-button"
            />
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="ok" type="primary" onClick={onClose}>
          OK
        </Button>,
      ]}
      width={800}
      className="report-details-dialog"
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={tabItems}
      />
    </Modal>
  );
};

export default ReportDetailsDialog;


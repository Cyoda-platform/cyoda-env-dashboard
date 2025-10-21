/**
 * ReportTemplates Component
 * Pre-configured report templates for common use cases
 */

import React, { useState } from 'react';
import { Modal, Card, Row, Col, Button, Input, message } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ReportDefinition } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ReportTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: ReportDefinition) => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: ReportDefinition;
}

const MOCK_TEMPLATES: ReportTemplate[] = [
  {
    id: 'transaction-summary',
    name: 'Transaction Summary',
    description: 'Summary of all transactions with key metrics',
    category: 'Financial',
    definition: {
      requestClass: 'com.cyoda.tms.model.entities.Transaction',
      colDefs: [
        { fullPath: 'id', colType: 'STRING' },
        { fullPath: 'amount', colType: 'NUMBER' },
        { fullPath: 'currency', colType: 'STRING' },
        { fullPath: 'timestamp', colType: 'DATE' },
      ],
      aliasDefs: [],
      condition: { '@bean': 'com.cyoda.core.reports.filter.Condition', value: [] },
      sortingDefs: [{ fullPath: 'timestamp', order: 'DESC' }],
      groupingDefs: [],
    },
  },
  {
    id: 'entity-audit',
    name: 'Entity Audit Trail',
    description: 'Track all changes to entities over time',
    category: 'Audit',
    definition: {
      requestClass: 'com.cyoda.platform.model.Entity',
      colDefs: [
        { fullPath: 'id', colType: 'STRING' },
        { fullPath: 'modifiedBy', colType: 'STRING' },
        { fullPath: 'modifiedDate', colType: 'DATE' },
        { fullPath: 'version', colType: 'NUMBER' },
      ],
      aliasDefs: [],
      condition: { '@bean': 'com.cyoda.core.reports.filter.Condition', value: [] },
      sortingDefs: [{ fullPath: 'modifiedDate', order: 'DESC' }],
      groupingDefs: [],
    },
  },
  {
    id: 'daily-activity',
    name: 'Daily Activity Report',
    description: 'Daily summary of system activity',
    category: 'Operations',
    definition: {
      requestClass: 'com.cyoda.platform.model.Activity',
      colDefs: [
        { fullPath: 'date', colType: 'DATE' },
        { fullPath: 'activityType', colType: 'STRING' },
        { fullPath: 'count', colType: 'NUMBER' },
        { fullPath: 'user', colType: 'STRING' },
      ],
      aliasDefs: [],
      condition: { '@bean': 'com.cyoda.core.reports.filter.Condition', value: [] },
      sortingDefs: [{ fullPath: 'date', order: 'DESC' }],
      groupingDefs: [{ fullPath: 'activityType' }],
    },
  },
  {
    id: 'user-permissions',
    name: 'User Permissions Report',
    description: 'Overview of user roles and permissions',
    category: 'Security',
    definition: {
      requestClass: 'com.cyoda.platform.model.User',
      colDefs: [
        { fullPath: 'username', colType: 'STRING' },
        { fullPath: 'email', colType: 'STRING' },
        { fullPath: 'roles', colType: 'STRING' },
        { fullPath: 'lastLogin', colType: 'DATE' },
      ],
      aliasDefs: [],
      condition: { '@bean': 'com.cyoda.core.reports.filter.Condition', value: [] },
      sortingDefs: [{ fullPath: 'username', order: 'ASC' }],
      groupingDefs: [],
    },
  },
  {
    id: 'error-log',
    name: 'Error Log Report',
    description: 'System errors and exceptions',
    category: 'Operations',
    definition: {
      requestClass: 'com.cyoda.platform.model.ErrorLog',
      colDefs: [
        { fullPath: 'timestamp', colType: 'DATE' },
        { fullPath: 'severity', colType: 'STRING' },
        { fullPath: 'message', colType: 'STRING' },
        { fullPath: 'stackTrace', colType: 'STRING' },
      ],
      aliasDefs: [],
      condition: { '@bean': 'com.cyoda.core.reports.filter.Condition', value: [] },
      sortingDefs: [{ fullPath: 'timestamp', order: 'DESC' }],
      groupingDefs: [],
    },
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'System performance and resource usage',
    category: 'Operations',
    definition: {
      requestClass: 'com.cyoda.platform.model.Metrics',
      colDefs: [
        { fullPath: 'timestamp', colType: 'DATE' },
        { fullPath: 'cpuUsage', colType: 'NUMBER' },
        { fullPath: 'memoryUsage', colType: 'NUMBER' },
        { fullPath: 'requestCount', colType: 'NUMBER' },
      ],
      aliasDefs: [],
      condition: { '@bean': 'com.cyoda.core.reports.filter.Condition', value: [] },
      sortingDefs: [{ fullPath: 'timestamp', order: 'DESC' }],
      groupingDefs: [],
    },
  },
];

export const ReportTemplates: React.FC<ReportTemplatesProps> = ({ visible, onClose, onSelectTemplate }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectTemplate = (template: ReportTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.definition);
      message.success(`Template "${template.name}" applied`);
      onClose();
    }
  };

  const categories = Array.from(new Set(MOCK_TEMPLATES.map((t) => t.category)));

  const filteredTemplates = MOCK_TEMPLATES.filter((template) => {
    const matchesSearch =
      !searchText ||
      template.name.toLowerCase().includes(searchText.toLowerCase()) ||
      template.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = !selectedCategory || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      title="Report Templates"
      open={visible}
      onCancel={onClose}
      width="90%"
      footer={null}
    >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search templates..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 16 }}>
            <Button
              type={selectedCategory === null ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(null)}
              style={{ marginRight: 8 }}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                type={selectedCategory === category ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(category)}
                style={{ marginRight: 8 }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {filteredTemplates.map((template) => (
            <Col key={template.id} xs={24} sm={12} md={8}>
              <Card
                title={template.name}
                extra={<span style={{ fontSize: 12, color: '#999' }}>{template.category}</span>}
                actions={[
                  <Button
                    key="use"
                    type="primary"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Use Template
                  </Button>,
                ]}
              >
                <p>{template.description}</p>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <div>Entity: {template.definition.requestClass?.split('.').pop()}</div>
                  <div>Columns: {template.definition.colDefs?.length || 0}</div>
                  <div>Sorting: {template.definition.sortingDefs?.length || 0}</div>
                  <div>Grouping: {template.definition.groupingDefs?.length || 0}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No templates found matching your criteria
          </div>
        )}
      </Modal>
  );
};

export default ReportTemplates;


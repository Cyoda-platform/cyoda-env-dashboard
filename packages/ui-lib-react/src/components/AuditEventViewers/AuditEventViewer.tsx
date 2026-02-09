/**
 * AuditEventViewer Component
 * A reusable modal component to display entity audit events
 * Supports StateMachine, EntityChange, and System event types
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Spin, Table, Tag, Empty, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getEntityAuditEvents } from '@cyoda/http-api-react';
import type { AuditEventType, AuditEventSeverity } from '@cyoda/http-api-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './AuditEventViewer.scss';

/** Storage key for severity preferences */
const SEVERITY_STORAGE_KEY = 'audit-viewer-severity-preferences';

/** All available severity levels */
const SEVERITY_OPTIONS: AuditEventSeverity[] = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

/** Default severity by event type - StateMachine defaults to DEBUG, others to INFO */
const DEFAULT_SEVERITY: Record<AuditEventType, AuditEventSeverity> = {
  StateMachine: 'DEBUG',
  EntityChange: 'INFO',
  System: 'INFO',
};

/**
 * Get stored severity preferences from localStorage
 */
const getStoredSeverityPreferences = (): Record<AuditEventType, AuditEventSeverity> => {
  try {
    const stored = localStorage.getItem(SEVERITY_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SEVERITY, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load severity preferences from localStorage:', e);
  }
  return { ...DEFAULT_SEVERITY };
};

/**
 * Store severity preference in localStorage
 */
const storeSeverityPreference = (eventType: AuditEventType, severity: AuditEventSeverity): void => {
  try {
    const current = getStoredSeverityPreferences();
    current[eventType] = severity;
    localStorage.setItem(SEVERITY_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save severity preference to localStorage:', e);
  }
};

export interface AuditEventViewerProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Entity ID to fetch audit events for */
  entityId: string;
  /** Optional transaction ID to filter events */
  transactionId?: string;
  /** Event type to display (StateMachine, EntityChange, System) */
  eventType: AuditEventType;
  /** Modal title override */
  title?: string;
}

interface AuditEventItem {
  auditEventType: AuditEventType;
  severity: AuditEventSeverity;
  utcTime: string;
  microsTime: number;
  consistencyTime?: string;
  entityId?: string;
  entityModel?: string;
  transactionId?: string;
  actor?: { id: string; legalId: string; name?: string };
  details?: string;
  system?: boolean;
  state?: string;
  eventType?: string;
  data?: Record<string, unknown>;
  changeType?: 'CREATED' | 'UPDATED' | 'DELETED';
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  errorTime?: string;
  doneTime?: string;
  queueName?: string;
  shardId?: string;
  status?: string;
}

/**
 * Format time with maximum resolution (including microseconds)
 * The API returns utcTime as ISO string and microsTime as microseconds since epoch
 */
const formatHighResolutionTime = (utcTime: string, microsTime?: number): string => {
  // Parse the ISO time string
  const date = new Date(utcTime);

  // Format date part
  const datePart = date.toLocaleDateString();

  // Format time with milliseconds
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const millis = date.getMilliseconds().toString().padStart(3, '0');

  // If we have microsTime, extract the microsecond part (last 3 digits after milliseconds)
  let microsPart = '000';
  if (microsTime !== undefined) {
    // microsTime is in microseconds, get the last 3 digits for sub-millisecond precision
    microsPart = (microsTime % 1000).toString().padStart(3, '0');
  }

  return `${datePart} ${hours}:${minutes}:${seconds}.${millis}${microsPart}`;
};

/**
 * Get severity tag color
 */
const getSeverityColor = (severity: AuditEventSeverity): string => {
  const colorMap: Record<AuditEventSeverity, string> = {
    ERROR: 'red',
    WARN: 'orange',
    INFO: 'blue',
    DEBUG: 'default',
  };
  return colorMap[severity] || 'default';
};

/**
 * Get event type display name
 */
const getEventTypeTitle = (eventType: AuditEventType): string => {
  const titleMap: Record<AuditEventType, string> = {
    StateMachine: 'State Machine Audit',
    EntityChange: 'Entity Change Audit',
    System: 'System Events',
  };
  return titleMap[eventType] || eventType;
};

/**
 * Render JSON data with syntax highlighting
 */
const renderJsonData = (data: unknown): React.ReactNode => {
  if (data === null || data === undefined) {
    return <Tag color="default">null</Tag>;
  }
  if (typeof data !== 'object') {
    return String(data);
  }
  const jsonStr = JSON.stringify(data, null, 2);
  return (
    <pre
      className="language-javascript"
      style={{ margin: 0, padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}
    >
      <code
        className="language-javascript"
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(jsonStr, Prism.languages.javascript, 'javascript')
        }}
      />
    </pre>
  );
};

export const AuditEventViewer: React.FC<AuditEventViewerProps> = ({
  visible,
  onClose,
  entityId,
  transactionId,
  eventType,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Severity filter state - initialized from localStorage with defaults
  const [selectedSeverity, setSelectedSeverity] = useState<AuditEventSeverity>(() =>
    getStoredSeverityPreferences()[eventType]
  );

  // Update severity when eventType changes (e.g., switching between different audit viewers)
  useEffect(() => {
    setSelectedSeverity(getStoredSeverityPreferences()[eventType]);
  }, [eventType]);

  // Load audit events when visible, entityId, transactionId, eventType, or severity changes
  useEffect(() => {
    if (visible && entityId) {
      loadAuditEvents();
    }
  }, [visible, entityId, transactionId, eventType, selectedSeverity]);

  const loadAuditEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getEntityAuditEvents({
        entityId,
        transactionId,
        eventType: [eventType],
        severity: selectedSeverity,
      });
      setEvents(data.items || []);
    } catch (err) {
      console.error('Failed to load audit events:', err);
      setError('Failed to load audit events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [entityId, transactionId, eventType, selectedSeverity]);

  const modalTitle = title || `${getEventTypeTitle(eventType)} - Entity: ${entityId}`;

  // Handle severity change - store preference and trigger reload
  const handleSeverityChange = (newSeverity: AuditEventSeverity) => {
    setSelectedSeverity(newSeverity);
    storeSeverityPreference(eventType, newSeverity);
  };

  // Render severity filter
  const renderSeverityFilter = () => (
    <Space style={{ marginBottom: 16 }}>
      <span>Minimum Severity:</span>
      <Select
        value={selectedSeverity}
        onChange={handleSeverityChange}
        style={{ width: 120 }}
        options={SEVERITY_OPTIONS.map(s => ({ value: s, label: s }))}
        popupMatchSelectWidth={false}
        getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
      />
    </Space>
  );

  // Render content based on event type
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      );
    }
    if (error) {
      return <Empty description={error} />;
    }
    if (events.length === 0) {
      return <Empty description="No audit events found" />;
    }

    return renderEventTable();
  };

  const renderEventTable = () => {
    const columns: ColumnsType<AuditEventItem> = getColumnsForEventType();
    return (
      <Table
        columns={columns}
        dataSource={events}
        rowKey={(record, index) => `${record.utcTime}-${record.microsTime}-${index}`}
        scroll={{ x: true, y: 400 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total ${total} events`,
          onChange: (page, size) => {
            setCurrentPage(page);
            if (size !== pageSize) {
              setPageSize(size);
              setCurrentPage(1); // Reset to first page when page size changes
            }
          },
        }}
        size="small"
        bordered
        expandable={getExpandableConfig()}
      />
    );
  };

  const getColumnsForEventType = (): ColumnsType<AuditEventItem> => {
    const baseColumns: ColumnsType<AuditEventItem> = [
      {
        title: 'Time',
        key: 'utcTime',
        width: 220,
        render: (_: unknown, record: AuditEventItem) => formatHighResolutionTime(record.utcTime, record.microsTime),
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        width: 100,
        render: (severity: AuditEventSeverity) => <Tag color={getSeverityColor(severity)}>{severity}</Tag>,
      },
      {
        title: 'Actor',
        key: 'actor',
        width: 180,
        render: (_: unknown, record: AuditEventItem) => {
          if (!record.actor) return '-';
          const name = record.actor.name || record.actor.id;
          return `${name} (${record.actor.legalId})`;
        },
        ellipsis: true,
      },
      {
        title: 'Transaction ID',
        dataIndex: 'transactionId',
        key: 'transactionId',
        width: 280,
        ellipsis: true,
      },
    ];

    switch (eventType) {
      case 'StateMachine':
        return [
          ...baseColumns,
          { title: 'State', dataIndex: 'state', key: 'state', width: 120 },
          { title: 'Event Type', dataIndex: 'eventType', key: 'eventType', width: 150 },
          { title: 'Details', dataIndex: 'details', key: 'details', ellipsis: true },
        ];
      case 'EntityChange':
        return [
          ...baseColumns,
          {
            title: 'Change Type',
            dataIndex: 'changeType',
            key: 'changeType',
            width: 120,
            render: (changeType: string) => {
              const colorMap: Record<string, string> = { CREATED: 'green', UPDATED: 'blue', DELETED: 'red' };
              return <Tag color={colorMap[changeType] || 'default'}>{changeType}</Tag>;
            },
          },
          { title: 'Details', dataIndex: 'details', key: 'details', ellipsis: true },
        ];
      case 'System':
        return [
          ...baseColumns,
          { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
          { title: 'Queue', dataIndex: 'queueName', key: 'queueName', width: 150 },
          { title: 'Details', dataIndex: 'details', key: 'details', ellipsis: true },
        ];
      default:
        return baseColumns;
    }
  };

  const getExpandableConfig = () => ({
    expandedRowRender: (record: AuditEventItem) => (
      <div className="audit-event-details">
        {renderJsonData(record)}
      </div>
    ),
    rowExpandable: () => true,
  });

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      className="audit-event-viewer-modal"
    >
      {renderSeverityFilter()}
      {renderContent()}
    </Modal>
  );
};

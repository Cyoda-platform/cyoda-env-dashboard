/**
 * Export Dialog Component
 * Dialog for selecting export format and exporting workflows
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ExportImport
 */

import React, { useState } from 'react';
import { Modal, Radio, Space, Alert, Typography } from 'antd';
import type { Workflow } from '../../types';
import { EXPORT_FORMATS, useExportWorkflows, type ExportFormat } from '../../hooks/useExportImport';

const { Text } = Typography;

export interface ExportDialogProps {
  open: boolean;
  workflows: Workflow[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  workflows,
  onClose,
  onSuccess,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const exportMutation = useExportWorkflows();

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        workflows,
        format: selectedFormat,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      // Export failed
    }
  };

  const workflowNames = workflows.map((w) => w.name).join(', ');

  return (
    <Modal
      title="Export Workflows"
      open={open}
      onOk={handleExport}
      onCancel={onClose}
      confirmLoading={exportMutation.isPending}
      okText="Export"
      cancelText="Cancel"
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong>Selected Workflows ({workflows.length}):</Text>
          <div style={{ marginTop: 8, padding: 12, background: '#1e293b', borderRadius: 4 }}>
            <span style={{ color: '#14b8a6', fontSize: '14px' }}>{workflowNames || 'No workflows selected'}</span>
          </div>
        </div>

        <div>
          <Text strong>Select Export Format:</Text>
          <Radio.Group
            value={selectedFormat.extension}
            onChange={(e) => {
              const format = EXPORT_FORMATS.find((f) => f.extension === e.target.value);
              if (format) {
                setSelectedFormat(format);
              }
            }}
            style={{ marginTop: 8, width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {EXPORT_FORMATS.map((format) => (
                <Radio key={format.extension} value={format.extension}>
                  <Space direction="vertical" size={0}>
                    <Text strong>.{format.extension.toUpperCase()}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {format.description}
                    </Text>
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        {selectedFormat.extension === 'zip' && (
          <Alert
            message="Note"
            description="ZIP format exports cannot be re-imported through the UI. Use JSON format if you plan to import the workflows later."
            type="warning"
            showIcon
            style={{
              backgroundColor: '#1e293b',
              borderColor: '#f59e0b',
              color: '#f5f5f5'
            }}
          />
        )}

        {exportMutation.isError && (
          <Alert
            message="Export Failed"
            description="An error occurred while exporting workflows. Please try again."
            type="error"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default ExportDialog;


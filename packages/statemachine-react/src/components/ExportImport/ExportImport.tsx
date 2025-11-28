/**
 * Export/Import Component
 * Main component for exporting and importing workflows
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ExportImport
 */

import React, { useState } from 'react';
import { Button, Space, Tooltip, App } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import type { Workflow } from '../../types';
import './ExportImport.scss';

export interface ExportImportProps {
  selectedWorkflows: Workflow[];
  onImportSuccess?: () => void;
  className?: string;
}

export const ExportImport: React.FC<ExportImportProps> = ({
  selectedWorkflows,
  onImportSuccess,
  className = '',
}) => {
  const { message } = App.useApp();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleExportClick = () => {
    if (selectedWorkflows.length === 0) {
      message.warning('Please select at least one workflow to export');
      return;
    }
    setExportDialogOpen(true);
  };

  const handleExportSuccess = () => {
    message.success('Workflows exported successfully');
  };

  const handleImportSuccess = () => {
    message.success('Workflows imported successfully');
    if (onImportSuccess) {
      onImportSuccess();
    }
  };

  return (
    <div className={`export-import ${className}`}>
      <Space>
        <Tooltip title="Export selected workflows">
          <Button
            className="export-import-button"
            icon={<UploadOutlined />}
            onClick={handleExportClick}
            disabled={selectedWorkflows.length === 0}
          >
            Export
          </Button>
        </Tooltip>

        <Tooltip title="Import previously exported workflows">
          <Button
            className="export-import-button"
            icon={<DownloadOutlined />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
        </Tooltip>
      </Space>

      <ExportDialog
        open={exportDialogOpen}
        workflows={selectedWorkflows}
        onClose={() => setExportDialogOpen(false)}
        onSuccess={handleExportSuccess}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default ExportImport;


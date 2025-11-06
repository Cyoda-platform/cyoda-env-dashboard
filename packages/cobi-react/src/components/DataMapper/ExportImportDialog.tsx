import React, { useState } from 'react';
import { Modal, Tabs, Button, Upload, message, Alert } from 'antd';
import { DownloadOutlined, UploadOutlined, CopyOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import CodeEditor from '../CodeEditor';
import type { EntityMappingConfigDto } from '../../types';
import './ExportImportDialog.css';

interface ExportImportDialogProps {
  visible: boolean;
  entityMapping: EntityMappingConfigDto | null;
  onClose: () => void;
  onImport?: (mapping: EntityMappingConfigDto) => void;
}

const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  visible,
  entityMapping,
  onClose,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importedJson, setImportedJson] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const exportJson = entityMapping ? JSON.stringify(entityMapping, null, 2) : '';

  const handleDownload = () => {
    if (!entityMapping) return;

    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entity-mapping-${entityMapping.name || 'export'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Mapping exported successfully');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJson);
    message.success('Copied to clipboard');
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        setImportedJson(JSON.stringify(parsed, null, 2));
        message.success('File loaded successfully');
      } catch (error) {
        message.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importedJson);
      if (onImport) {
        onImport(parsed);
        message.success('Mapping imported successfully');
        onClose();
      }
    } catch (error) {
      message.error('Invalid JSON format');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      setImportedJson(JSON.stringify(parsed, null, 2));
      message.success('Pasted from clipboard');
    } catch (error) {
      message.error('Invalid JSON in clipboard');
    }
  };

  return (
    <Modal
      title="Export / Import Mapping"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      className="export-import-dialog"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'export',
            label: 'Export',
            children: (
              <div className="export-tab">
                <Alert
                  message="Export Mapping Configuration"
                  description="Download or copy the mapping configuration as JSON"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <div className="export-actions">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                  >
                    Download JSON
                  </Button>
                  <Button icon={<CopyOutlined />} onClick={handleCopy}>
                    Copy to Clipboard
                  </Button>
                </div>

                <div className="export-preview">
                  <CodeEditor
                    value={exportJson}
                    language="json"
                    height="400px"
                    readOnly
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'import',
            label: 'Import',
            children: (
              <div className="import-tab">
                <Alert
                  message="Import Mapping Configuration"
                  description="Upload a JSON file or paste JSON content to import a mapping configuration"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <div className="import-actions">
                  <Upload
                    fileList={fileList}
                    beforeUpload={handleFileUpload}
                    onRemove={() => setFileList([])}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload JSON File</Button>
                  </Upload>
                  <Button onClick={handlePaste}>Paste from Clipboard</Button>
                </div>

                <div className="import-editor">
                  <CodeEditor
                    value={importedJson}
                    onChange={(value) => setImportedJson(value || '')}
                    language="json"
                    height="400px"
                  />
                </div>

                <div className="import-footer">
                  <Button type="primary" onClick={handleImport} disabled={!importedJson}>
                    Import Mapping
                  </Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ExportImportDialog;


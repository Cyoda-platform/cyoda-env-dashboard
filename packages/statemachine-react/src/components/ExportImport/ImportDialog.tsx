/**
 * Import Dialog Component
 * Dialog for importing workflows from JSON files
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ExportImport
 */

import React, { useState } from 'react';
import { Modal, Upload, Alert, Space, Typography, Checkbox } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  useImportWorkflows,
  readFileAsText,
  validateWorkflowData
} from '../../hooks/useExportImport';
import './ImportDialog.css';

const { Dragger } = Upload;
const { Text } = Typography;

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [parsedData, setParsedData] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [needRewrite, setNeedRewrite] = useState(true);
  
  const importMutation = useImportWorkflows();

  const handleFileChange = async (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList.slice(-1)); // Keep only the last file

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        try {
          const text = await readFileAsText(file);
          const data = JSON.parse(text);

          if (validateWorkflowData(data)) {
            setParsedData(data);
            setValidationError('');
          } else {
            setParsedData(null);
            setValidationError('Invalid workflow data structure. Please check the file format.');
          }
        } catch (error) {
          setParsedData(null);
          setValidationError('Failed to parse JSON file. Please ensure the file is valid JSON.');
        }
      }
    } else {
      setParsedData(null);
      setValidationError('');
    }
  };

  const handleImport = async () => {
    if (!parsedData) {
      return;
    }

    try {
      await importMutation.mutateAsync({
        data: parsedData,
        needRewrite,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset state
      setFileList([]);
      setParsedData(null);
      setValidationError('');
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    setParsedData(null);
    setValidationError('');
    onClose();
  };

  const workflowNames = parsedData?.workflow?.map((w: any) => w.name).join(', ') || '';
  const workflowCount = parsedData?.workflow?.length || 0;

  return (
    <Modal
      title="Import Workflows"
      open={open}
      onOk={handleImport}
      onCancel={handleCancel}
      confirmLoading={importMutation.isPending}
      okText="Import"
      cancelText="Cancel"
      okButtonProps={{ disabled: !parsedData || !!validationError }}
      width={600}
      className="import-dialog"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Import Workflows from JSON"
          description="Upload a previously exported workflow JSON file to import workflows into the system."
          type="info"
          showIcon
        />

        <Dragger
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false} // Prevent auto upload
          accept=".json"
          maxCount={1}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Only JSON files exported from this system are supported.
          </p>
        </Dragger>

        {validationError && (
          <Alert
            message="Validation Error"
            description={validationError}
            type="error"
            showIcon
          />
        )}

        {parsedData && !validationError && (
          <div>
            <Alert
              message={`Found ${workflowCount} workflow${workflowCount !== 1 ? 's' : ''}`}
              description={
                <div>
                  <Text strong>Workflows to import:</Text>
                  <div className="workflow-names-container">
                    <span className="workflow-name">{workflowNames}</span>
                  </div>
                </div>
              }
              type="success"
              showIcon
            />
          </div>
        )}

        <Checkbox
          checked={needRewrite}
          onChange={(e) => setNeedRewrite(e.target.checked)}
        >
          <Space direction="vertical" size={0}>
            <span className="checkbox-label">Overwrite existing workflows</span>
            <span className="checkbox-description">
              If enabled, existing workflows with the same ID will be replaced
            </span>
          </Space>
        </Checkbox>

        {importMutation.isError && (
          <Alert
            message="Import Failed"
            description="An error occurred while importing workflows. Please check the file and try again."
            type="error"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default ImportDialog;


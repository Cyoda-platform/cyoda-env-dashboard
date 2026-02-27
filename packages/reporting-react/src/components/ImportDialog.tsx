/**
 * Import Dialog Component
 * Dialog for importing reports from JSON files
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ExportImport
 */

import React, { useState, useEffect } from 'react';
import { Modal, Upload, Alert, Space, Typography, Checkbox, Tooltip, Steps, Tag, Button, Popover } from 'antd';
import { InboxOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import './ImportDialog.scss';

const { Dragger } = Upload;
const { Text } = Typography;

export interface ImportResult {
  name: string;
  isSuccess: boolean | '';
  errorDesc: string;
  isSolveLoading?: boolean;
}

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onImport: (data: any, failOnExists?: boolean) => Promise<{ success: boolean; errors?: any[] }>;
  title?: string;
  description?: string;
  validateData?: (data: any) => boolean;
  getItemsPreview?: (data: any) => { count: number; names: string };
  showFailOnExists?: boolean;
  failOnExistsLabel?: string;
  failOnExistsTooltip?: string;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onImport,
  title = 'Import Reports',
  description = 'Upload a previously exported report JSON file to import reports into the system.',
  validateData,
  getItemsPreview,
  showFailOnExists = true,
  failOnExistsLabel = 'Fail On Exists',
  failOnExistsTooltip = 'If enabled, import will fail if items with the same ID already exist. If disabled, existing items will be overwritten.',
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = Import, 1 = Result
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [parsedData, setParsedData] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [failOnExists, setFailOnExists] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList.slice(-1)); // Keep only the last file

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        try {
          const text = await readFileAsText(file);
          const data = JSON.parse(text);

          // Validate data if validator is provided
          if (validateData) {
            if (validateData(data)) {
              setParsedData(data);
              setValidationError('');
              // Auto-import after file selection
              await performImport(data);
            } else {
              setParsedData(null);
              setValidationError('Invalid data structure. Please check the file format.');
            }
          } else {
            // No validation, accept any valid JSON
            setParsedData(data);
            setValidationError('');
            // Auto-import after file selection
            await performImport(data);
          }
        } catch (error) {
          console.error('Parse error:', error);
          setParsedData(null);
          setValidationError('Failed to parse JSON file. Please ensure the file is valid JSON.');
        }
      }
    } else {
      setParsedData(null);
      setValidationError('');
    }
  };

  const performImport = async (data: any) => {
    const preview = getItemsPreview ? getItemsPreview(data) : { count: 0, names: '' };

    // Switch to result step
    setCurrentStep(1);

    // Create import result instance
    const result: ImportResult = {
      name: preview.names || 'Items',
      isSuccess: '',
      errorDesc: '',
    };
    setImportResult(result);

    try {
      const response = await onImport(data, failOnExists);

      if (response.success === false || (response.errors && response.errors.length > 0)) {
        result.isSuccess = false;
        result.errorDesc = response.errors?.map((e: any) =>
          `${e.name || e.id}: ${e.error}`
        ).join('\n') || 'Import failed';
      } else {
        result.isSuccess = true;
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      result.isSuccess = false;
      result.errorDesc = error.message || 'Import failed. Please check the console for details.';
    }

    setImportResult({ ...result });
  };

  const handleSolveProblem = async () => {
    if (!parsedData || !importResult) return;

    importResult.isSolveLoading = true;
    setImportResult({ ...importResult });

    try {
      // Retry import with failOnExists=false (allow overwrite)
      const response = await onImport(parsedData, false);

      if (response.success === false || (response.errors && response.errors.length > 0)) {
        importResult.isSuccess = false;
        importResult.errorDesc = response.errors?.map((e: any) =>
          `${e.name || e.id}: ${e.error}`
        ).join('\n') || 'Import failed';
      } else {
        importResult.isSuccess = true;
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      importResult.isSuccess = false;
      importResult.errorDesc = error.message || 'Import failed';
    } finally {
      importResult.isSolveLoading = false;
      setImportResult({ ...importResult });
    }
  };

  const handleClose = () => {
    // Reset all state
    setCurrentStep(0);
    setFileList([]);
    setParsedData(null);
    setValidationError('');
    setFailOnExists(false);
    setImportResult(null);
    onClose();
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setFileList([]);
      setParsedData(null);
      setValidationError('');
      setImportResult(null);
    }
  }, [open]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>
      ]}
      width={700}
      className="import-dialog"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Steps current={currentStep} items={[
          { title: 'Import', status: currentStep === 0 ? 'process' : 'finish' },
          { title: 'Result', status: currentStep === 1 ? 'process' : 'wait' }
        ]} />

        {showFailOnExists && (
          <Checkbox
            checked={failOnExists}
            onChange={(e) => setFailOnExists(e.target.checked)}
            disabled={currentStep === 1}
          >
            <Space size={4}>
              <span>{failOnExistsLabel}</span>
              <Tooltip title={failOnExistsTooltip}>
                <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
              </Tooltip>
            </Space>
          </Checkbox>
        )}

        {currentStep === 0 && (
          <>
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
          </>
        )}

        {currentStep === 1 && importResult && (
          <div className="import-result">
            <div className="import-result__item">
              <div className="import-result__name">{importResult.name}</div>
              <div className="import-result__status">
                {importResult.isSuccess === true && (
                  <Tag color="success">Success</Tag>
                )}
                {importResult.isSuccess === false && (
                  <Space>
                    <Tag color="error">Fail</Tag>
                    {importResult.errorDesc && (
                      <Popover
                        content={<div style={{ whiteSpace: 'pre-wrap' }}>{importResult.errorDesc}</div>}
                        title="Error"
                        trigger="click"
                        placement="topLeft"
                      >
                        <Button shape="circle" icon={<InfoCircleOutlined />} />
                      </Popover>
                    )}
                    {failOnExists && (
                      <Tooltip title="Try to solve problem by overwriting existing items">
                        <Button
                          type="primary"
                          shape="circle"
                          disabled={importResult.isSolveLoading}
                          onClick={handleSolveProblem}
                          icon={<SyncOutlined spin={importResult.isSolveLoading} />}
                        />
                      </Tooltip>
                    )}
                  </Space>
                )}
                {importResult.isSuccess === '' && (
                  <Tag color="processing">Importing...</Tag>
                )}
              </div>
            </div>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default ImportDialog;


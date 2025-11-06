/**
 * Upload File Component
 * File upload component for data mapping with FilePond
 */

import React, { useState, useRef } from 'react';
import { Button, Space, Alert, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import { readFileAsText, formatFileSize } from '../../utils/contentHelper';
import type { MappingConfigDto } from '../../types';
import './UploadFile.css';

// Register FilePond plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface UploadFileProps {
  dataMappingConfigDto: MappingConfigDto;
  isEnableEditor?: boolean;
  onSave: (content: string) => void;
  onOpenEditor?: () => void;
}

const UploadFile: React.FC<UploadFileProps> = ({
  dataMappingConfigDto,
  isEnableEditor = false,
  onSave,
  onOpenEditor,
}) => {
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const pondRef = useRef<FilePond>(null);

  // Determine accepted file types based on data type
  const getAcceptedFileTypes = (): string[] => {
    const dataType = dataMappingConfigDto.dataType;
    
    switch (dataType) {
      case 'CSV':
        return ['text/csv', '.csv'];
      case 'XML':
        return ['text/xml', 'application/xml', '.xml'];
      case 'JSON':
        return ['application/json', '.json'];
      default:
        return ['text/csv', 'text/xml', 'application/xml', 'application/json', '.csv', '.xml', '.json'];
    }
  };

  // Handle file upload
  const handleProcessFile = async (
    _fieldName: string,
    file: File,
    _metadata: any,
    load: (p: string | { [key: string]: any }) => void,
    error: (errorText: string) => void,
    progress: (computable: boolean, loaded: number, total: number) => void,
    abort: () => void
  ) => {
    try {
      setIsUploading(true);
      progress(true, 0, 100);

      // Read file content
      const content = await readFileAsText(file);
      
      progress(true, 50, 100);

      // Validate content
      if (!content || content.trim().length === 0) {
        error('File is empty');
        setIsUploading(false);
        return;
      }

      progress(true, 100, 100);

      // Call onSave with content
      onSave(content);

      message.success(`File uploaded successfully (${formatFileSize(file.size)})`);
      load('success');
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
      }, 1000);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      error(err.message || 'Failed to upload file');
      message.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }

    return {
      abort: () => {
        abort();
        setIsUploading(false);
      },
    };
  };

  const hasExistingData = dataMappingConfigDto.sampleContent && 
                          dataMappingConfigDto.sampleContent.trim().length > 0;

  return (
    <div className="upload-file-component">
      {hasExistingData && (
        <Alert
          message="Data Already Loaded"
          description="Sample data has been previously loaded. You can upload a new file to replace it or skip this step."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="upload-section">
        <FilePond
          ref={pondRef}
          files={files}
          onupdatefiles={(fileItems) => setFiles(fileItems)}
          allowMultiple={false}
          maxFiles={1}
          acceptedFileTypes={getAcceptedFileTypes()}
          maxFileSize="50MB"
          labelIdle={`Drag & Drop your ${dataMappingConfigDto.dataType || 'data'} file or <span class="filepond--label-action">Browse</span>`}
          credits={false}
          server={{
            process: handleProcessFile as any,
          }}
          disabled={isUploading}
        />
      </div>

      {isEnableEditor && (
        <div className="editor-section" style={{ marginTop: 16 }}>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={onOpenEditor}
              disabled={!hasExistingData}
            >
              Edit Content
            </Button>
            {hasExistingData && (
              <span className="file-info">
                Current content: {formatFileSize(dataMappingConfigDto.sampleContent?.length || 0)}
              </span>
            )}
          </Space>
        </div>
      )}

      <div className="upload-info" style={{ marginTop: 16 }}>
        <Alert
          message="Upload Guidelines"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Maximum file size: 50 MB</li>
              <li>Accepted formats: {getAcceptedFileTypes().filter(t => t.startsWith('.')).join(', ')}</li>
              <li>The uploaded file will be used as sample data for mapping</li>
              {dataMappingConfigDto.dataType === 'CSV' && (
                <li>CSV files should have consistent column structure</li>
              )}
            </ul>
          }
          type="info"
        />
      </div>
    </div>
  );
};

export default UploadFile;


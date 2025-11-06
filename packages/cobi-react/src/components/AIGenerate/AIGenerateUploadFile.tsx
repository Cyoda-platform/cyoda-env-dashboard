import React, { useState } from 'react';
import { Upload, Button, Space, Typography, message } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import './AIGenerateUploadFile.css';

const { Text } = Typography;

interface AIGenerateUploadFileProps {
  onSave?: (file: File) => void;
}

const AIGenerateUploadFile: React.FC<AIGenerateUploadFileProps> = ({ onSave }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleBeforeUpload = (file: File) => {
    console.log('File selected:', file.name, 'Type:', file.type);

    // Validate file type - be more lenient
    const isJson = file.type === 'application/json' ||
                   file.type === 'text/json' ||
                   file.name.toLowerCase().endsWith('.json');

    if (!isJson) {
      message.error(`File ${file.name} is not a JSON file. Please select a .json file.`);
      return Upload.LIST_IGNORE;
    }

    message.success(`File ${file.name} selected successfully`);

    setFileList([
      {
        uid: file.name,
        name: file.name,
        status: 'done',
        originFileObj: file as any,
      },
    ]);

    return false; // Prevent auto upload
  };

  const handleRemove = () => {
    setFileList([]);
  };

  const handleGenerate = () => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      onSave?.(fileList[0].originFileObj as File);
    }
  };

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: handleBeforeUpload,
    onRemove: handleRemove,
    accept: '.json,application/json,text/json',
    maxCount: 1,
    showUploadList: true,
  };

  return (
    <div className="ai-generate-upload">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="upload-description">
          <Text>
            Upload a JSON configuration file to generate data mappings and data source configurations
            using AI assistance.
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Accepted file types: .json
          </Text>
        </div>

        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Click or drag JSON file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single JSON configuration file upload.
          </p>
        </Upload.Dragger>

        {fileList.length > 0 && (
          <div className="file-preview">
            <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <div>
              <Text strong>{fileList[0].name}</Text>
              <br />
              <Text type="success" style={{ fontSize: '12px' }}>Ready to generate</Text>
            </div>
          </div>
        )}

        <Button
          type="primary"
          onClick={handleGenerate}
          disabled={fileList.length === 0}
          block
          size="large"
        >
          {fileList.length > 0 ? 'Generate Configuration' : 'Please select a file first'}
        </Button>
      </Space>
    </div>
  );
};

export default AIGenerateUploadFile;


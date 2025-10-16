/**
 * File Upload Dialog Component
 * Handles uploading CSV/XML files using FilePond
 */

import React, { useState } from 'react';
import { Modal, Select, message, Space, Typography } from 'antd';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import { useSourceConfigStore } from '../stores/sourceConfigStore';
import { useEncompassConfigs, useUploadFile } from '../hooks/useSourceConfig';
import type { CsvUploadConfig, XmlUploadConfig } from '../types';
import './FileUploadDialog.css';

const { Text } = Typography;

// Register FilePond plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

const FileUploadDialog: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | undefined>();

  const isOpen = useSourceConfigStore((state) => state.isUploadDialogOpen);
  const setIsOpen = useSourceConfigStore((state) => state.setUploadDialogOpen);
  const uploadProgress = useSourceConfigStore((state) => state.uploadProgress);

  const { data: configs } = useEncompassConfigs();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  const handleClose = () => {
    setIsOpen(false);
    setFiles([]);
    setSelectedConfigId(undefined);
  };

  const handleUpload = () => {
    if (!selectedConfigId) {
      message.error('Please select a configuration');
      return;
    }

    if (files.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    const file = files[0].file;
    uploadFile(
      { configId: selectedConfigId, file },
      {
        onSuccess: () => {
          message.success('File uploaded successfully');
          handleClose();
        },
        onError: (error: any) => {
          message.error(error.message || 'Failed to upload file');
        },
      }
    );
  };

  const selectedConfig = Array.isArray(configs) ? configs.find((c) => c.id === selectedConfigId) : undefined;
  const acceptedFileTypes = selectedConfig
    ? selectedConfig.fileType === 'CSV'
      ? ['text/csv', '.csv']
      : ['text/xml', 'application/xml', '.xml']
    : undefined;

  return (
    <Modal
      title="Upload File"
      open={isOpen}
      onCancel={handleClose}
      onOk={handleUpload}
      confirmLoading={isUploading}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Select Configuration</Text>
          <Select
            value={selectedConfigId}
            onChange={setSelectedConfigId}
            placeholder="Select a configuration"
            style={{ width: '100%', marginTop: 8 }}
            showSearch
            optionFilterProp="children"
          >
            {Array.isArray(configs) && configs.map((config) => (
              <Select.Option key={config.id} value={config.id}>
                {config.name} ({config.fileType})
              </Select.Option>
            ))}
          </Select>
        </div>

        {selectedConfig && (
          <div>
            <Text strong>Upload File</Text>
            <div style={{ marginTop: 8 }}>
              <FilePond
                files={files}
                onupdatefiles={setFiles}
                allowMultiple={false}
                maxFiles={1}
                acceptedFileTypes={acceptedFileTypes}
                maxFileSize="50MB"
                labelIdle={`Drag & Drop your ${selectedConfig.fileType} file or <span class="filepond--label-action">Browse</span>`}
                credits={false}
              />
            </div>
          </div>
        )}

        {uploadProgress[selectedConfigId || ''] && (
          <div className="upload-progress">
            <Text>Upload Progress: {uploadProgress[selectedConfigId || '']}%</Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default FileUploadDialog;


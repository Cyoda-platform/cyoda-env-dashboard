import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, Spin, message } from 'antd';
import AIGenerateUploadFile from './AIGenerateUploadFile';
import { useImportCobiConfig } from '../../hooks/useDataSourceConfig';

export interface AIGenerateDialogRef {
  open: () => void;
}

interface AIGenerateDialogProps {
  type: 'dataMapper' | 'dataSource';
  onSuccess?: () => void;
}

const AIGenerateDialog = forwardRef<AIGenerateDialogRef, AIGenerateDialogProps>(
  ({ type, onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { mutateAsync: importConfig } = useImportCobiConfig();

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
      },
    }));

    const handleSaveUploadFile = async (file: File) => {
      try {
        setIsLoading(true);

        // Read file content
        const fileContent = await file.text();
        const data = JSON.parse(fileContent);

        // Simulate AI processing delay (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Import the configuration
        await importConfig({
          data,
          params: {
            cleanBeforeImport: false,
            doPostProcess: false,
          },
        });

        message.success('Data was generated successfully');
        setVisible(false);
        onSuccess?.();
      } catch (error) {
        console.error('Failed to generate data:', error);
        message.error('Failed to generate data');
      } finally {
        setIsLoading(false);
      }
    };

    const handleClose = () => {
      setVisible(false);
    };

    return (
      <Modal
        title="AI Generate - Upload Configuration"
        open={visible}
        onCancel={handleClose}
        width={500}
        footer={[
          <Button key="close" onClick={handleClose}>
            Close
          </Button>,
        ]}
      >
        <Spin spinning={isLoading} tip="Generating configuration...">
          <AIGenerateUploadFile onSave={handleSaveUploadFile} />
        </Spin>
      </Modal>
    );
  }
);

AIGenerateDialog.displayName = 'AIGenerateDialog';

export default AIGenerateDialog;


/**
 * CloneReportDialog Component
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/popup/ConfigEditorSaveAs.vue
 */

import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import './CloneReportDialog.scss';

const { TextArea } = Input;

export interface CloneReportDialogRef {
  open: (reportId: string, currentName?: string, currentDescription?: string) => void;
  close: () => void;
}

interface CloneReportDialogProps {
  onConfirm: (reportId: string, newName: string, newDescription: string) => void | Promise<void>;
}

const CloneReportDialog = forwardRef<CloneReportDialogRef, CloneReportDialogProps>(
  ({ onConfirm }, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportId, setReportId] = useState<string>('');
    const [form] = Form.useForm();

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      open: (id: string, currentName?: string, currentDescription?: string) => {
        setReportId(id);
        setVisible(true);
        
        // Set default values with " (Copy)" suffix
        form.setFieldsValue({
          name: currentName ? `${currentName} (Copy)` : '',
          description: currentDescription || '',
        });
      },
      close: () => {
        setVisible(false);
      },
    }));

    // Handle form submission
    const handleConfirm = async () => {
      try {
        const values = await form.validateFields();
        setLoading(true);
        
        await onConfirm(reportId, values.name, values.description);
        
        setVisible(false);
        form.resetFields();
      } catch (error: any) {
        if (error.errorFields) {
          // Form validation error
          message.error('Please fill in all required fields');
        } else {
          console.error('Failed to clone report:', error);
          message.error(error.message || 'Failed to clone report');
        }
      } finally {
        setLoading(false);
      }
    };

    // Reset form when dialog closes
    useEffect(() => {
      if (!visible) {
        form.resetFields();
        setReportId('');
      }
    }, [visible, form]);

    return (
      <Modal
        title="Clone Report"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleConfirm}
        confirmLoading={loading}
        width={500}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          className="clone-report-form"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input Name' }]}
          >
            <Input placeholder="Enter new report name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input Description' }]}
          >
            <TextArea rows={4} placeholder="Enter report description" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

CloneReportDialog.displayName = 'CloneReportDialog';

export default CloneReportDialog;


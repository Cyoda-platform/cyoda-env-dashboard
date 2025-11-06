import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Modal, Form, Select, Button, message } from 'antd';

interface CollectionElementSetMode {
  type: 'OVERRIDE' | 'APPEND' | 'MERGE';
}

interface MappingSetModesDialogProps {
  path: string;
  collectElemsSetModes: CollectionElementSetMode[];
  onChange: (modes: CollectionElementSetMode[]) => void;
}

export interface MappingSetModesDialogRef {
  open: () => void;
  close: () => void;
}

const collectionElementSetModeOptions = [
  { label: 'Override', value: 'OVERRIDE' },
  { label: 'Append', value: 'APPEND' },
  { label: 'Merge', value: 'MERGE' },
];

const MappingSetModesDialog = forwardRef<MappingSetModesDialogRef, MappingSetModesDialogProps>(
  ({ path, collectElemsSetModes, onChange }, ref) => {
    const [visible, setVisible] = useState(false);
    const [localModes, setLocalModes] = useState<CollectionElementSetMode[]>([]);
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    useEffect(() => {
      if (visible) {
        // Count the number of asterisks in the path
        const starCount = (path.match(/\*/g) || []).length;

        // Initialize modes if empty
        const modes = [...collectElemsSetModes];
        while (modes.length < starCount) {
          modes.push({ type: 'OVERRIDE' });
        }

        setLocalModes(modes);

        // Set form values
        const formValues: any = {};
        modes.forEach((mode, index) => {
          formValues[`mode_${index}`] = mode.type;
        });
        form.setFieldsValues(formValues);
      }
    }, [visible, path, collectElemsSetModes, form]);

    const handleSave = async () => {
      try {
        const values = await form.validateFields();
        const updatedModes = localModes.map((mode, index) => ({
          type: values[`mode_${index}`] || mode.type,
        }));

        onChange(updatedModes);
        setVisible(false);
        message.success('Collection element set modes updated successfully');
      } catch (error) {
        console.error('Validation failed:', error);
      }
    };

    const handleCancel = () => {
      setVisible(false);
      form.resetFields();
    };

    return (
      <Modal
        title="Collection Element Set Modes"
        open={visible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            OK
          </Button>,
        ]}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          {localModes.map((mode, index) => (
            <Form.Item
              key={index}
              name={`mode_${index}`}
              label={`Type ${index + 1}`}
              initialValue={mode.type}
            >
              <Select
                placeholder="Select"
                options={collectionElementSetModeOptions}
                style={{ width: '100%' }}
              />
            </Form.Item>
          ))}
        </Form>

        {localModes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No collection elements found in path
          </div>
        )}
      </Modal>
    );
  }
);

MappingSetModesDialog.displayName = 'MappingSetModesDialog';

export default MappingSetModesDialog;

